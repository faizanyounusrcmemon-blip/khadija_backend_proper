import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
app.use(express.json());

// ⭐ Allow all frontend origins (Fix CORS)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// ⭐ Test Route
app.get("/", (req, res) => {
  res.send("Khadija Jewellery Backend Working");
});

// ⭐ BACKUP API ROUTE
app.post("/api/backup", (req, res) => {
  console.log("Backup API Called");

  // Run your Python backup script
  exec("python backup_to_drive.py", (error, stdout, stderr) => {
    if (error) {
      console.log("Backup Error:", error);
      return res.status(500).json({ message: "Backup Failed", error });
    }

    return res.json({
      message: "Backup Completed Successfully",
      output: stdout
    });
  });
});

// ⭐ Required for Vercel
app.listen(5000, () => {
  console.log("Backend running on port 5000");
});

export default app;
