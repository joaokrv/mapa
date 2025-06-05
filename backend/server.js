const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { connect } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const locais = require(path.join(__dirname, "locais.json"));

app.get("/api/locais", (req, res) => {
  res.json(locais);
});

function normalizarNomeLocal(nome, locais) {
  if (!nome || typeof nome !== "string") return null;

  if (
    Array.isArray(nome) &&
    nome.length === 2 &&
    typeof nome[0] === "number" &&
    typeof nome[1] === "number"
  ) {
    return nome;
  }

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

app.post("/api/rota", async (req, res) => {
  try {
    const { origem, destino } = req.body;
    const locais = await obterLocaisDoBanco();

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
