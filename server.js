import express from "express";
import cors from "cors";
import backupRoute from "./backupRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Khadija Jewellery Backend Working");
});

app.use("/backup", backupRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
