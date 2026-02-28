const express = require("express"); 
const path = require("path"); 
require("dotenv").config(); 

const pool = require("./config/db"); 
const urlRoutes = require("./routes/urlRoutes"); 

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); 
app.use("/api", urlRoutes); 
// Redirección Dinámica y Conteo de Clics
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params; 

  try {
    const result = await pool.query(
      "SELECT id, original_url FROM urls WHERE short_code = $1",
      [shortCode]
    ); 

    if (result.rows.length === 0) return res.status(404).send("URL no encontrada"); 

    const urlData = result.rows[0];

    // Incrementar clics totales
    await pool.query("UPDATE urls SET clicks = clicks + 1 WHERE id = $1", [urlData.id]);

    // Registrar log detallado
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    await pool.query(
      "INSERT INTO click_logs (url_id, user_agent) VALUES ($1, $2)",
      [urlData.id, userAgent]
    );

    res.redirect(urlData.original_url);
  } catch (error) {
    res.status(500).send("Error del servidor");
  }
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`)); 