import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import archiver from "archiver";
import { google } from "googleapis";

export default async function backupToDrive() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const GOOGLE_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const tables = ["sales", "purchases", "items", "customers", "app_users"];

  const backupDir = "./backups";
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  let csvFiles = [];

  for (let table of tables) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw new Error(error.message);

    const csvPath = `${backupDir}/${table}.csv`;
    const csv =
      Object.keys(data[0] || {}).join(",") +
      "\n" +
      data.map((row) => Object.values(row).join(",")).join("\n");

    fs.writeFileSync(csvPath, csv);
    csvFiles.push(csvPath);
  }

  // ZIP FILE
  const zipName = `backup_${Date.now()}.zip`;
  const zipPath = `${backupDir}/${zipName}`;

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");
  archive.pipe(output);

  csvFiles.forEach((file) => {
    archive.file(file, { name: path.basename(file) });
  });

  await archive.finalize();

  // GOOGLE UPLOAD
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_SERVICE_ACCOUNT,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  await drive.files.create({
    resource: { name: zipName, parents: [GOOGLE_DRIVE_FOLDER_ID] },
    media: { mimeType: "application/zip", body: fs.createReadStream(zipPath) },
  });

  return `Backup uploaded → ${zipName}`;
}
