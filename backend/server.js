import path from "path";
import express from "express";
import cors from "cors";
import axios from "axios";
import { connect } from "./db.js";

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500", // local frontend
  "https://mapa-unibh-backend.onrender.com", // Render backend
  "https://mapa-two.vercel.app/", // Vercel frontend (com barra)
  "https://mapa-two.vercel.app" // Vercel link alternativo (SEM barra)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // LOG para ver a origem exata que o navegador está enviando
      console.log("Origem da requisição CORS:", origin); 

      if (!origin) {
        console.log("Requisição sem origem (permitida)."); // Opcional, para debug
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log(`Origem ${origin} PERMITIDA.`); // debug
        callback(null, true);
      } else {
        // LOG para ver qual origem foi explicitamente NÃO PERMITIDA
        console.error(`Origem ${origin} NÃO PERMITIDA por CORS. Conteúdo de allowedOrigins:`, allowedOrigins); 
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

// Função para buscar locais da tabela dbo.Pontos
async function obterLocaisDoBanco() {
  const pool = await connect();
  const result = await pool
    .request()
    .query("SELECT nome, latitude, longitude FROM dbo.Pontos");
  const locais = {};
  result.recordset.forEach((row) => {
    locais[row.nome] = [row.latitude, row.longitude];
  });
  return locais;
}

async function getCoordenadasDoLocal(nome) {
  if (!nome || typeof nome !== "string") return null;

    const coordMatch = nome.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (coordMatch) {
        return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
    }

    const pool = await connect();
    const request = pool.request();

    // Limpeza e normalização para a busca no DB
    let normalizado = nome
        .replace(/[^\w\sáéíóúâêîôûãõàèìòùç-]/gi, "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Tenta encontrar a correspondência exata primeiro
    let result = await request
        .input('normalizado', sql.NVarChar, normalizado)
        .query("SELECT nome, latitude, longitude FROM dbo.Pontos WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ã', 'a'), 'õ', 'o'), 'ç', 'c'), 'à', 'a'), 'è', 'e'), 'ì', 'i'), 'ò', 'o'), 'ù', 'u')) = @normalizado");

    if (result.recordset.length > 0) {
        const row = result.recordset[0];
        return [row.latitude, row.longitude];
    }

    // Se não encontrou correspondência exata, tenta com LIKE
    result = await request
        .input('normalizadoLike', sql.NVarChar, `%${normalizado}%`)
        .query("SELECT nome, latitude, longitude FROM dbo.Pontos WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ã', 'a'), 'õ', 'o'), 'ç', 'c'), 'à', 'a'), 'è', 'e'), 'ì', 'i'), 'ò', 'o'), 'ù', 'u')) LIKE @normalizadoLike");

    if (result.recordset.length > 0) {
        const row = result.recordset[0];
        return [row.latitude, row.longitude];
    }

    return null;
}

app.get("/api/locais", async (req, res) => {
    try {
        const pool = await connect();
        const result = await pool
            .request()
            .query("SELECT nome, latitude, longitude FROM dbo.Pontos");
        const locaisArray = result.recordset.map(row => ({ nome: row.nome, lat: row.latitude, lon: row.longitude }));
        res.json(locaisArray); // Retorna um array de objetos, não um mapa
    } catch (error) {
        console.error("Erro ao buscar locais:", error);
        res.status(500).json({ error: "Erro ao buscar locais do banco" });
    }
});

app.post("/api/rota", async (req, res) => {
  try {
    const { origem, destino } = req.body;

    const coordOrigem = await getCoordenadasDoLocal(origem);
    const coordDestino = await getCoordenadasDoLocal(destino);

    if (!coordOrigem || !coordDestino) {
      const pool = await connect();
            const sugestoes = {
                origem: [],
                destino: [],
            };

            if (origem) {
                const resultOrigem = await pool.request()
                    .input('origemLike', sql.NVarChar, `%${origem.toLowerCase()}%`)
                    .query("SELECT nome FROM dbo.Pontos WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ã', 'a'), 'õ', 'o'), 'ç', 'c'), 'à', 'a'), 'è', 'e'), 'ì', 'i'), 'ò', 'o'), 'ù', 'u')) LIKE @origemLike");
                sugestoes.origem = resultOrigem.recordset.map(row => row.nome);
            }
            if (destino) {
                const resultDestino = await pool.request()
                    .input('destinoLike', sql.NVarChar, `%${destino.toLowerCase()}%`)
                    .query("SELECT nome FROM dbo.Pontos WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ã', 'a'), 'õ', 'o'), 'ç', 'c'), 'à', 'a'), 'è', 'e'), 'ì', 'i'), 'ò', 'o'), 'ù', 'u')) LIKE @destinoLike");
                sugestoes.destino = resultDestino.recordset.map(row => row.nome);
            }

            return res.status(400).json({
                error: "Local não encontrado",
                sugestoes,
            });
        }

    const osrmUrl = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordOrigem[1]},${coordOrigem[0]};${coordDestino[1]},${coordDestino[0]}?overview=full&geometries=geojson`;

    const response = await axios.get(osrmUrl);

    if (response.data.code !== "Ok" || !response.data.routes?.length) {
      throw new Error("Rota não encontrada");
    }

    const coordenadasOSRM = response.data.routes[0].geometry.coordinates;
    const pontos = coordenadasOSRM.map(([lon, lat]) => [lat, lon]);

    res.json({
      pontos,
      origem: coordOrigem,
      destino: coordDestino,
    });
  } catch (error) {
    console.error("Erro no cálculo da rota:", error);
    res.status(500).json({
      error: "Erro interno no servidor",
      detalhes: error.message,
    });
  }
});

app.get("/api/buscar-local", async (req, res) => {
  const { local } = req.query;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        local
      )}+UniBH+Belo+Horizonte&limit=1`
    );
    const data = await response.json();
    res.json(data[0] || null);
  } catch (error) {
    res.status(500).json({ error: "Erro na busca" });
  }
});

app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno no servidor" });
});

const LOCAL_PORT = process.env.LOCAL_PORT; // Porta local padrão
const PORT = process.env.PORT || LOCAL_PORT; // Porta do servidor, se definida no ambiente

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
