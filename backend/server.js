import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "https://mapa-unibh-backend.onrender.com",
  "https://mapa-two.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizada = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizada)) return callback(null, true);
      console.warn(`Origem ${origin} bloqueada por CORS.`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

const locaisPath = path.join(__dirname, "locais.json");
const locais = JSON.parse(await readFile(locaisPath, "utf8"));
console.log(`Locais carregados: ${Object.keys(locais).length}`);

function normalizarNomeLocal(nome) {
  if (!nome || typeof nome !== "string") return null;

  const coordMatch = nome.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (coordMatch) {
    return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
  }

  const normalizado = nome
    .replace(/[^\w\sáéíóúâêîôûãõàèìòùç-]/gi, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const chaves = Object.keys(locais);

  for (const key of chaves) {
    const k = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (k === normalizado) return locais[key];
  }

  for (const key of chaves) {
    const k = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (k.includes(normalizado) || normalizado.includes(k)) return locais[key];
  }

  return null;
}

app.get("/api/health", (req, res) => res.json({ ok: true, locais: Object.keys(locais).length }));

app.get("/api/locais", (req, res) => res.json(locais));

app.post("/api/rota", async (req, res) => {
  try {
    const { origem, destino } = req.body;

    const coordOrigem = normalizarNomeLocal(origem);
    const coordDestino = normalizarNomeLocal(destino);

    if (!coordOrigem || !coordDestino) {
      const termoOrigem = (origem || "").toLowerCase();
      const termoDestino = (destino || "").toLowerCase();
      const sugestoes = {
        origem: Object.keys(locais).filter((k) => k.toLowerCase().includes(termoOrigem)),
        destino: Object.keys(locais).filter((k) => k.toLowerCase().includes(termoDestino)),
      };
      return res.status(400).json({ error: "Local não encontrado", sugestoes });
    }

    const osrmUrl = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coordOrigem[1]},${coordOrigem[0]};${coordDestino[1]},${coordDestino[0]}?overview=full&geometries=geojson`;

    const response = await axios.get(osrmUrl);

    if (response.data.code !== "Ok" || !response.data.routes?.length) {
      throw new Error("Rota não encontrada");
    }

    const pontos = response.data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);

    res.json({ pontos, origem: coordOrigem, destino: coordDestino });
  } catch (error) {
    console.error("Erro no cálculo da rota:", error.message);
    res.status(500).json({ error: "Erro interno no servidor", detalhes: error.message });
  }
});

app.get("/api/buscar-local", async (req, res) => {
  const { local } = req.query;
  if (!local) return res.status(400).json({ error: "Parâmetro 'local' obrigatório" });

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { format: "json", q: `${local} UniBH Belo Horizonte`, limit: 1 },
      headers: { "User-Agent": "mapa-unibh/1.0" },
    });
    res.json(response.data[0] || null);
  } catch (error) {
    console.error("Erro na busca Nominatim:", error.message);
    res.status(500).json({ error: "Erro na busca" });
  }
});

app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno no servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
