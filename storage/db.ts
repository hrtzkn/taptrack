import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("taptrack.db");

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS attendance_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT,
      rfid_uid TEXT,
      status TEXT,
      time TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teacher_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT,
      grade INTEGER,
      section TEXT,
      time TEXT,
      synced INTEGER DEFAULT 0
    );
  `);
};

export default db;
