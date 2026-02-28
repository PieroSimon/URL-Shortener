const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

// Ruta para acortar la URL
router.post("/shorten", urlController.shortenUrl);

// Ruta para los reportes agrupados
router.get("/global-stats", urlController.getGlobalStats);

// NUEVA: Ruta para el desglose (Drill-down)
router.get("/url-details", urlController.getUrlDetails); 

module.exports = router;