import express from "express";
import cors from "cors";
import backupToDrive from "./backup.js";

const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------------------
// TEST ROUTE
// ---------------------------------------
app.get("/", (req, res) => {
  res.send("Khadija Jewellery Backend Working");
});

// ---------------------------------------
// BACKUP ROUTE
// ---------------------------------------
app.post("/api/backup", async (req, res) => {
  try {
    const result = await backupToDrive();
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------
// Vercel Export
// ---------------------------------------
export default app;
