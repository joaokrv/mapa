const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let poolPromise;

async function connect() {
  if (!poolPromise) {
    try {
      poolPromise = await sql.connect(config);
      console.log('Conectado ao banco de dados!');
    } catch (err) {
      console.error('Erro ao conectar:', err);
      throw err;
    }
  }
  return poolPromise;
}

module.exports = { connect };
