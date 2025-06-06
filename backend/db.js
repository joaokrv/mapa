import sql from "mssql";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let poolPromise; // Mantém a pool de conexão para reutilização

export async function connect() {
  // Use 'export' aqui!
  if (!poolPromise) {
    try {
      poolPromise = await sql.connect(config);
      console.log("Conectado ao banco de dados!");
    } catch (err) {
      console.error("Erro ao conectar:", err);
      // Se a conexão falhar, resetamos poolPromise para permitir uma nova tentativa
      poolPromise = null;
      throw err;
    }
  }
  return poolPromise;
}
