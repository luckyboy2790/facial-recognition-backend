const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const descriptorsPath = path.join(__dirname, "..", "face-data", "descriptors.json");

router.get("/descriptors", (req, res) => {
  if (!fs.existsSync(descriptorsPath)) {
    return res.status(404).json({ message: "Archivo de descriptores no encontrado." });
  }

  const data = fs.readFileSync(descriptorsPath);
  const json = JSON.parse(data);
  res.json(json);
});

module.exports = router;

