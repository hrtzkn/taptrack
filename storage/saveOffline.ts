import db from "./db";

export const saveOffline = (
  student_id: string,
  rfid_uid: string,
  status: string,
) => {
  const time = new Date().toISOString();

  db.runSync(
    `INSERT INTO attendance_queue (student_id, rfid_uid, status, time, synced)
     VALUES (?, ?, ?, ?, 0);`,
    [student_id, rfid_uid, status, time],
  );
};
