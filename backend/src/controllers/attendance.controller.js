const pool = require("../config/db");

// GET attendance per student
const getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({
        error: "Student ID required",
      });
    }

    const result = await pool.query(
      `SELECT student_id, attendance_date, timein, timeout
       FROM attendance_logs
       WHERE student_id = $1
       ORDER BY attendance_date DESC`,
      [student_id],
    );

    return res.json({
      attendance: result.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

const getAvailableYears = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM attendance_date) AS year
       FROM attendance_logs
       WHERE student_id = $1
       ORDER BY year DESC`,
      [student_id],
    );

    return res.json({
      years: result.rows.map((r) => Number(r.year)),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getStudentHistoryByMonth = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { month, year } = req.query;

    const result = await pool.query(
      `SELECT 
          attendance_date,
          TO_CHAR(attendance_date, 'FMMonth DD') AS date,
          timein,
          timeout
       FROM attendance_logs
       WHERE student_id = $1
         AND EXTRACT(MONTH FROM attendance_date) = $2
         AND EXTRACT(YEAR FROM attendance_date) = $3
       ORDER BY attendance_date DESC`,
      [student_id, month, year],
    );

    return res.json({
      attendance: result.rows,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAllAvailableYears = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM attendance_date) AS year
      FROM attendance_logs
      ORDER BY year DESC
    `);

    return res.json({
      years: result.rows.map((r) => Number(r.year)),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAttendanceByDate = async (req, res) => {
  try {
    const { year, month, day, grade, section } = req.query;

    const result = await pool.query(
      `
      SELECT
        s.student_id,
        s.fullname,
        a.timein,
        a.timeout,
        CASE
          WHEN a.student_id IS NULL THEN 'ABSENT'
          WHEN a.timein > '08:15:00' THEN 'LATE'
          ELSE 'PRESENT'
        END AS status
      FROM student s
      LEFT JOIN attendance_logs a
        ON s.student_id = a.student_id
        AND EXTRACT(YEAR FROM a.attendance_date) = $1
        AND EXTRACT(MONTH FROM a.attendance_date) = $2
        AND EXTRACT(DAY FROM a.attendance_date) = $3
      WHERE s.grade = $4
        AND s.section = $5
      ORDER BY s.fullname ASC
      `,
      [year, month, day, grade, section],
    );

    res.json({
      attendance: result.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getStudentAttendance,
  getAvailableYears,
  getStudentHistoryByMonth,
  getAllAvailableYears,
  getAttendanceByDate,
};
