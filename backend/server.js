const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { connect } = require("./db");

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500", // local frontend
  "https://mapa-unibh-backend.onrender.com", // Render backend
  "https://mapa-two.vercel.app/", // Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type"], // Allow these headers
    credentials: true, // Allow cookies if needed
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

// Inicializa os locais do banco de dados
const locais = await obterLocaisDoBanco();

function normalizarNomeLocal(nome, locais) {
  if (!nome || typeof nome !== 'string') return null;

  const coordMatch = nome.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (coordMatch) {
    return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
  }

  let normalizado = nome
    .replace(/[^\w\sáéíóúâêîôûãõàèìòùç-]/gi, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const locaisKeys = Object.keys(locais);

  for (const key of locaisKeys) {
    const keyNormalized = key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (keyNormalized === normalizado) {
      return locais[key];
    }
  }

  for (const key of locaisKeys) {
    const keyNormalized = key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (
      keyNormalized.includes(normalizado) ||
      normalizado.includes(keyNormalized)
    ) {
      return locais[key];
    }
  }

  return null;
}

app.get("/api/locais", async (req, res) => {
  try {
    const locais = await obterLocaisDoBanco();
    res.json(locais);
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    res.status(500).json({ error: "Erro ao buscar locais do banco" });
  }
});

app.post("/api/rota", async (req, res) => {
  try {
    const { origem, destino } = req.body;

    const coordOrigem = normalizarNomeLocal(origem, locais);
    const coordDestino = normalizarNomeLocal(destino, locais);

    if (!coordOrigem || !coordDestino) {
      const sugestoes = {
        origem: Object.keys(locais).filter((k) =>
          k.toLowerCase().includes(origem?.toLowerCase() || "")
        ),
        destino: Object.keys(locais).filter((k) =>
          k.toLowerCase().includes(destino?.toLowerCase() || "")
        ),
      };
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));