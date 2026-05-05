const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));

module.exports = app;

//npx expo start -c
//npm run dev
