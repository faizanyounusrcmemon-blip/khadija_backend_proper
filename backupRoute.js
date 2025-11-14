import express from "express";
import supabase from "./db.js";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data: users } = await supabase.from("app_users").select("*");

    res.json({
      message: "Backup API Working",
      usersCount: users?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: "Backup failed" });
  }
});

export default router;
