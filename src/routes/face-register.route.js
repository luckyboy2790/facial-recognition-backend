const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Ruta base de las imágenes subidas
const uploadsDir = path.join(__dirname, "..", "uploads");
// Ruta donde se guardarán los descriptores
const descriptorsPath = path.join(__dirname, "..", "face-data", "descriptors.json");

router.post("/register-face", async (req, res) => {
  try {
    const { filename, label } = req.body;

    if (!filename || !label) {
      return res.status(400).json({ message: "Faltan parámetros: filename o label." });
    }

    const imagePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Imagen no encontrada en uploads." });
    }

    // Aquí no ejecutamos Face API porque se hace en el frontend.
    // Simulamos que el descriptor se genera desde el frontend y se envía aquí.

    const descriptor = req.body.descriptor;

    if (!descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({ message: "Descriptor no válido." });
    }

    let data = [];

    if (fs.existsSync(descriptorsPath)) {
      const file = fs.readFileSync(descriptorsPath);
      data = JSON.parse(file);
    }

    data.push({ label, descriptor });

    fs.writeFileSync(descriptorsPath, JSON.stringify(data, null, 2));

    return res.status(200).json({ message: "Rostro registrado con éxito." });
  } catch (error) {
    console.error("Error registrando rostro:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

router.get("/descriptors", (req, res) => {
  const descriptorsPath = path.join(__dirname, "..", "face-data", "descriptors.json");

  if (!fs.existsSync(descriptorsPath)) {
    return res.status(404).json({ message: "Archivo de descriptores no encontrado." });
  }

  const data = fs.readFileSync(descriptorsPath);
  const json = JSON.parse(data);
  res.json(json);
});

module.exports = router;

