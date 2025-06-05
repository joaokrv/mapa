const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { connect } = require("./db");

const app = express();

app.use(cors());
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

// Rota temporária para testar se está pegando os dados da tabela dbo.Pontos
app.get("/api/test-pontos", async (req, res) => {
  try {
    const pool = await connect();
    const result = await pool.request().query("SELECT * FROM dbo.Pontos");
    res.json(result.recordset);
  } catch (error) {
    console.error("Erro ao buscar pontos:", error);
    res.status(500).json({ error: "Erro ao buscar pontos do banco" });
  }
});

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

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await connect();
    const result = await pool.request().query("SELECT 1 as teste");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erro ao acessar banco", detalhes: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno no servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));