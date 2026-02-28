const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  // Si existe DATABASE_URL la usa (Render), si no, usa los campos separados (Local)
  connectionString: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log("✅ Conexión exitosa a PostgreSQL"))
  .catch(err => {
    console.error("❌ Error de conexión a la base de datos:", err.message);
  });

module.exports = pool;