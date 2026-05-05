const pool = require("../config/db");

const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ storage: multer.memoryStorage() });

const signup = async (req, res) => {
  let { full_name, grade, section } = req.body;

  // Validate fields
  if (!full_name || !grade || !section) {
    return res.status(400).json({ error: "All fields are required" });
  }

  full_name = full_name.trim().toUpperCase();
  section = section.trim().toUpperCase();
  grade = parseInt(grade);

  if (isNaN(grade)) {
    return res.status(400).json({ error: "Grade must be a number" });
  }

  try {
    // Check if teacher already exists
    const existing = await pool.query(
      `SELECT * FROM teacher
       WHERE LOWER(TRIM(fullname)) = LOWER(TRIM($1))
       AND grade = $2
       AND LOWER(TRIM(section)) = LOWER(TRIM($3))`,
      [full_name, grade, section],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Teacher already exists for this Grade and Section.",
      });
    }

    // Insert into teacher table
    const result = await pool.query(
      `INSERT INTO teacher (fullname, grade, section)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [full_name, grade, section],
    );

    return res.json({
      message: "Teacher account created successfully!",
      teacher: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    let { full_name, grade, section } = req.body;
    console.log("BODY:", req.body);

    if (!full_name || !grade || !section) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    full_name = full_name.trim().toUpperCase();
    section = section.trim().toUpperCase();
    grade = parseInt(grade);

    if (isNaN(grade)) {
      return res.status(400).json({
        error: "Grade must be a number",
      });
    }

    const teacherResult = await pool.query(
      `SELECT * FROM teacher
       WHERE UPPER(TRIM(fullname)) = $1
       AND grade = $2
       AND UPPER(TRIM(section)) = $3`,
      [full_name, grade, section],
    );

    if (teacherResult.rows.length > 0) {
      return res.json({
        message: "Login successful",
        user: {
          teacher_id: teacherResult.rows[0].teacher_id,
          fullname: teacherResult.rows[0].fullname,
          grade: teacherResult.rows[0].grade,
          section: teacherResult.rows[0].section,
          role: "teacher",
        },
      });
    }

    const studentResult = await pool.query(
      `SELECT * FROM student
       WHERE UPPER(TRIM(fullname)) = $1
       AND grade = $2
       AND UPPER(TRIM(section)) = $3`,
      [full_name, grade, section],
    );

    if (studentResult.rows.length > 0) {
      return res.json({
        message: "Login successful",
        user: {
          student_id: studentResult.rows[0].student_id,
          fullname: studentResult.rows[0].fullname,
          grade: studentResult.rows[0].grade,
          section: studentResult.rows[0].section,
          rfid_uid: studentResult.rows[0].rfid_uid,
          role: "student",
        },
      });
    }

    return res.status(401).json({
      error: "Invalid credentials. Please try again.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

const addStudent = async (req, res) => {
  try {
    let { fullname, grade, section, rfid_uid } = req.body;

    if (!fullname || !grade || !section || !rfid_uid) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    fullname = fullname.trim().toUpperCase();
    section = section.trim().toUpperCase();
    grade = parseInt(grade);

    const existing = await pool.query(
      `SELECT * FROM student
       WHERE rfid_uid = $1
       OR (
         LOWER(fullname) = LOWER($2)
         AND grade = $3
         AND LOWER(section) = LOWER($4)
       )`,
      [rfid_uid, fullname, grade, section],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Student already exists (RFID or same identity).",
      });
    }

    const result = await pool.query(
      `INSERT INTO student
       (fullname, grade, section, rfid_uid)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fullname, grade, section, rfid_uid],
    );

    return res.json({
      message: "Student added successfully",
      student: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      let full_name = String(row.full_name || "").trim();
      let grade = parseInt(row.grade);
      let section = String(row.section || "")
        .trim()
        .toUpperCase();

      if (!full_name || isNaN(grade) || !section) continue;

      const existing = await pool.query(
        `SELECT * FROM student 
         WHERE LOWER(TRIM(full_name)) = LOWER(TRIM($1))
         AND grade = $2 
         AND LOWER(TRIM(section)) = LOWER(TRIM($3))`,
        [full_name, grade, section],
      );

      if (existing.rows.length > 0) continue;

      await pool.query(
        `INSERT INTO student (full_name, role, grade, section)
         VALUES ($1, $2, $3, $4)`,
        [full_name, "student", grade, section],
      );
    }

    return res.json({ message: "Students uploaded successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = { signup, login, addStudent, uploadExcel };
