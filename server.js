import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { google } from "googleapis";
import archiver from "archiver";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// -------------------- TEST ROUTE --------------------
app.get("/", (req, res) => {
  res.send("Khadija Jewellery Backend Working");
});

// -------------------- BACKUP ROUTE --------------------
app.post("/api/backup", async (req, res) => {
  try {
    const tables = ["sales", "purchases", "items", "customers", "app_users"];
    const backupFolder = "backup_temp";

    if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);

    // Download all tables
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*");

      if (error) console.log(error);

      fs.writeFileSync(
        `${backupFolder}/${table}.json`,
        JSON.stringify(data, null, 2)
      );
    }

    // Create ZIP
    const zipName = `backup_${Date.now()}.zip`;
    const zipPath = path.join(backupFolder, zipName);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");

    archive.pipe(output);

    fs.readdirSync(backupFolder).forEach((file) => {
      if (!file.endsWith(".zip")) {
        archive.file(`${backupFolder}/${file}`, { name: file });
      }
    });

    await archive.finalize();

    // Upload ZIP to Google Drive using Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const fileMeta = {
      name: zipName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: "application/zip",
      body: fs.createReadStream(zipPath),
    };

    await drive.files.create({
      resource: fileMeta,
      media: media,
      fields: "id",
    });

    res.json({ success: true, message: "Backup uploaded successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------- START SERVER --------------------
app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
