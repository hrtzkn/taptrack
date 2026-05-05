import db from "./db";

export const saveTeacherOffline = (
  fullname: string,
  grade: number,
  section: string,
) => {
  const time = new Date().toISOString();

  db.runSync(
    `INSERT INTO teacher_queue (fullname, grade, section, time, synced)
     VALUES (?, ?, ?, ?, 0);`,
    [fullname, grade, section, time],
  );
};
