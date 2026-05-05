import API from "../backend/src/services/api";
import db from "./db";

export const syncAttendance = async () => {
  const rows = db.getAllSync(
    `SELECT * FROM attendance_queue WHERE synced = 0`,
  ) as any[];

  for (const item of rows) {
    try {
      await API.post("/attendance", item);

      db.runSync(`UPDATE attendance_queue SET synced = 1 WHERE id = ?`, [
        item.id,
      ]);
    } catch (err) {
      console.log("Sync failed", err);
    }
  }
};
