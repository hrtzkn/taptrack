const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  addStudent,
  uploadExcel,
} = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
//router.post("/upload-excel", upload.single("file"), uploadExcel);
router.post("/add-student", addStudent);

module.exports = router;
