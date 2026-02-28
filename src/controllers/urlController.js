const pool = require("../config/db"); 
const { nanoid } = require("nanoid"); 
const QRCode = require("qrcode"); 
const { isValidUrl } = require("../utils/validateUrl");

// Crear URL corta y QR
exports.shortenUrl = async (req, res) => { 
  try {
    const { originalUrl } = req.body; 

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Esta URL no es valida, ejem: https://www.google.com/" }); 
    }

    const shortCode = nanoid(6); 

    await pool.query(
      "INSERT INTO urls (original_url, short_code) VALUES ($1, $2)", 
      [originalUrl, shortCode]
    );

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`; 
    const qrCode = await QRCode.toDataURL(shortUrl); 

    res.json({ originalUrl, shortUrl, qr: qrCode }); 
  } catch (error) { 
    res.status(500).json({ error: "Error interno" }); 
  }
};

// Reporte Agrupado (Vista General)
exports.getGlobalStats = async (req, res) => {
  const { sortBy, search } = req.query;
  
  let orderBy = "total_clicks DESC";
  if (sortBy === "url") orderBy = "original_url ASC";

  let whereClause = "";
  let queryParams = [];

  if (search) {
    // coincidencia en la URL original o un codigo ya acortado
    whereClause = "WHERE original_url ILIKE $1 OR short_code ILIKE $1";
    queryParams.push(`%${search}%`);
  }

  try {
    const query = `
      SELECT 
        original_url, 
        SUM(clicks) as total_clicks, 
        COUNT(short_code) as versions_count
      FROM urls 
      ${whereClause}
      GROUP BY original_url
      ORDER BY ${orderBy} 
      LIMIT 10`;
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al filtrar datos" });
  }
};

// Detalle de códigos (Vista de Desglose)
exports.getUrlDetails = async (req, res) => {
  const { url } = req.query;

  try {
    const query = `
      SELECT 
        u.short_code, 
        u.clicks, 
        u.created_at,
        (SELECT MAX(clicked_at) FROM click_logs WHERE url_id = u.id) as last_click
      FROM urls u
      WHERE u.original_url = $1
      ORDER BY u.clicks DESC`;
    
    const result = await pool.query(query, [url]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en getUrlDetails:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
};
exports.getCodeTimeline = async (req, res) => {
  const { shortCode } = req.query;

  try {
    const query = `
      SELECT 
        TO_CHAR(clicked_at, 'YYYY-MM-DD') as date, 
        COUNT(*) as click_count
      FROM click_logs cl
      JOIN urls u ON cl.url_id = u.id
      WHERE u.short_code = $1
      GROUP BY date
      ORDER BY date ASC`;
    
    const result = await pool.query(query, [shortCode]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener línea de tiempo" });
  }
};