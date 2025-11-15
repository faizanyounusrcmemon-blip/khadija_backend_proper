import express from "express";
import cors from "cors";
import backupToDrive from "./backup.js";

const app = express();
app.use(express.json());
app.use(cors());

// --------------------------------------
// ROOT TEST ROUTE
// --------------------------------------
app.get("/", (req, res) => {
  res.send("Khadija Jewellery Backend Running Successfully ✔");
});

// --------------------------------------
// BACKUP ROUTE
// --------------------------------------
app.post("/api/backup", async (req, res) => {
  try {
    const message = await backupToDrive();
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Backup Failed: " + err.message
    });
  }
});

export default app;
