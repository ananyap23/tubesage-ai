import sqlite3
import json
import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from config import MONGODB_URI, MONGODB_DB_NAME, SQLITE_DB_PATH

logger = logging.getLogger("tubesage.db")

class DatabaseManager:
    def __init__(self):
        self.is_mongo = False
        self.client = None
        self.db = None
        self._init_connection()

    def _init_connection(self):
        try:
            from pymongo import MongoClient
            self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
            # Trigger server selection test
            self.client.admin.command('ping')
            self.db = self.client[MONGODB_DB_NAME]
            self.is_mongo = True
            logger.info("Successfully connected to MongoDB (%s)", MONGODB_URI)
        except Exception as e:
            self.is_mongo = False
            logger.warning(
                "MongoDB not available (%s). Seamlessly falling back to local SQLite database at %s",
                str(e),
                SQLITE_DB_PATH
            )
            self._init_sqlite()

    def _init_sqlite(self):
        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS summaries (
                id TEXT PRIMARY KEY,
                video_id TEXT,
                url TEXT,
                title TEXT,
                channel TEXT,
                duration INTEGER,
                thumbnail TEXT,
                mode TEXT,
                language TEXT,
                summary_data TEXT,
                created_at TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY,
                summary_id TEXT,
                video_id TEXT,
                role TEXT,
                content TEXT,
                created_at TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def get_status(self) -> Dict[str, Any]:
        return {
            "type": "mongodb" if self.is_mongo else "sqlite",
            "target": MONGODB_URI if self.is_mongo else str(SQLITE_DB_PATH),
            "connected": True
        }

    def save_summary(self, data: Dict[str, Any]) -> str:
        record_id = data.get("id") or str(uuid.uuid4())
        data["id"] = record_id
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow().isoformat()

        if self.is_mongo:
            try:
                # Update or insert
                self.db.summaries.update_one(
                    {"id": record_id},
                    {"$set": data},
                    upsert=True
                )
                return record_id
            except Exception as e:
                logger.error("Mongo write failed (%s), writing to sqlite fallback", e)
                # fallback write
                self._save_summary_sqlite(data)
                return record_id
        else:
            self._save_summary_sqlite(data)
            return record_id

    def _save_summary_sqlite(self, data: Dict[str, Any]):
        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        summary_data_json = json.dumps(data)
        cursor.execute('''
            INSERT OR REPLACE INTO summaries 
            (id, video_id, url, title, channel, duration, thumbnail, mode, language, summary_data, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get("id"),
            data.get("video_id", ""),
            data.get("url", ""),
            data.get("title", ""),
            data.get("channel", ""),
            data.get("duration", 0),
            data.get("thumbnail", ""),
            data.get("mode", "short"),
            data.get("language", "en"),
            summary_data_json,
            data.get("created_at")
        ))
        conn.commit()
        conn.close()

    def get_summary(self, summary_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mongo:
            try:
                doc = self.db.summaries.find_one({"id": summary_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception as e:
                logger.error("Mongo get failed (%s), querying sqlite", e)

        # SQLite query
        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute("SELECT summary_data FROM summaries WHERE id = ?", (summary_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
        return None

    def get_summary_by_video_and_settings(self, video_id: str, mode: str, language: str) -> Optional[Dict[str, Any]]:
        """Check if an identical summary exists already to save API costs & latency"""
        if self.is_mongo:
            try:
                doc = self.db.summaries.find_one(
                    {"video_id": video_id, "mode": mode, "language": language},
                    {"_id": 0},
                    sort=[("created_at", -1)]
                )
                if doc:
                    return doc
            except Exception as e:
                logger.error("Mongo query error: %s", e)

        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute(
            "SELECT summary_data FROM summaries WHERE video_id = ? AND mode = ? AND language = ? ORDER BY created_at DESC LIMIT 1",
            (video_id, mode, language)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
        return None

    def list_summaries(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.is_mongo:
            try:
                cursor = self.db.summaries.find(
                    {},
                    {
                        "_id": 0,
                        "id": 1,
                        "video_id": 1,
                        "url": 1,
                        "title": 1,
                        "channel": 1,
                        "duration": 1,
                        "thumbnail": 1,
                        "mode": 1,
                        "language": 1,
                        "overview": 1,
                        "created_at": 1
                    }
                ).sort("created_at", -1).limit(limit)
                return list(cursor)
            except Exception as e:
                logger.error("Mongo list failed (%s), falling back to sqlite", e)

        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, video_id, url, title, channel, duration, thumbnail, mode, language, summary_data, created_at
            FROM summaries
            ORDER BY created_at DESC
            LIMIT ?
        ''', (limit,))
        rows = cursor.fetchall()
        conn.close()

        items = []
        for r in rows:
            try:
                s_data = json.loads(r[9]) if r[9] else {}
            except Exception:
                s_data = {}
            items.append({
                "id": r[0],
                "video_id": r[1],
                "url": r[2],
                "title": r[3],
                "channel": r[4],
                "duration": r[5],
                "thumbnail": r[6],
                "mode": r[7],
                "language": r[8],
                "overview": s_data.get("overview", ""),
                "created_at": r[10]
            })
        return items

    def delete_summary(self, summary_id: str) -> bool:
        deleted = False
        if self.is_mongo:
            try:
                res = self.db.summaries.delete_one({"id": summary_id})
                self.db.chats.delete_many({"summary_id": summary_id})
                deleted = res.deleted_count > 0
            except Exception as e:
                logger.error("Mongo delete failed: %s", e)

        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute("DELETE FROM summaries WHERE id = ?", (summary_id,))
        if cursor.rowcount > 0:
            deleted = True
        cursor.execute("DELETE FROM chats WHERE summary_id = ?", (summary_id,))
        conn.commit()
        conn.close()
        return deleted

    def save_chat_message(self, summary_id: str, video_id: str, role: str, content: str) -> Dict[str, Any]:
        msg_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        msg = {
            "id": msg_id,
            "summary_id": summary_id,
            "video_id": video_id,
            "role": role,
            "content": content,
            "created_at": created_at
        }
        if self.is_mongo:
            try:
                self.db.chats.insert_one(msg)
                msg.pop("_id", None)
                return msg
            except Exception as e:
                logger.error("Mongo chat save failed: %s", e)

        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO chats (id, summary_id, video_id, role, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (msg_id, summary_id, video_id, role, content, created_at))
        conn.commit()
        conn.close()
        return msg

    def get_chat_history(self, summary_id: str) -> List[Dict[str, Any]]:
        if self.is_mongo:
            try:
                docs = list(self.db.chats.find({"summary_id": summary_id}, {"_id": 0}).sort("created_at", 1))
                return docs
            except Exception as e:
                logger.error("Mongo chat history failed: %s", e)

        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, summary_id, video_id, role, content, created_at FROM chats WHERE summary_id = ? ORDER BY created_at ASC",
            (summary_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "summary_id": r[1],
                "video_id": r[2],
                "role": r[3],
                "content": r[4],
                "created_at": r[5]
            }
            for r in rows
        ]

db = DatabaseManager()
