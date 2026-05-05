const express = require("express");
const router = express.Router();

const {
  getStudentAttendance,
  getAvailableYears,
  getStudentHistoryByMonth,
  getAllAvailableYears,
  getAttendanceByDate,
} = require("../controllers/attendance.controller");

// GET attendance by student id
router.get("/student/:student_id", getStudentAttendance);
router.get("/student-years/:student_id", getAvailableYears);
router.get("/student-history/:student_id", getStudentHistoryByMonth);
router.get("/years", getAllAvailableYears);
router.get("/date", getAttendanceByDate);

module.exports = router;
