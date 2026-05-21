# Mapa Interativo — UniBH

Sistema de navegação interativa para o campus da UniBH. Permite calcular rotas a pé entre qualquer ponto do campus, com busca inteligente, temas claro/escuro e compartilhamento de localização.

> **Demo:** [mapa-two.vercel.app](https://mapa-two.vercel.app)

---

## Funcionalidades

- Cálculo de rotas pedestres entre pontos do campus via OSRM
- Busca e autocomplete de locais sincronizados com o backend
- Tema claro e escuro com transição animada
- Compartilhamento de localização via WhatsApp
- GPS para preencher origem automaticamente
- Interface responsiva para mobile e desktop

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 · CSS3 · JavaScript (ES Modules) |
| Mapas | [Leaflet.js 1.9.4](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) |
| Roteamento | [OSRM](https://routing.openstreetmap.de/) (pedestres, gratuito) |
| Geocoding | [Nominatim](https://nominatim.openstreetmap.org/) |
| Backend | Node.js · Express 5 |
| Deploy frontend | [Vercel](https://vercel.com/) |
| Deploy backend | [Render](https://render.com/) |

## Como rodar localmente

### Backend

```bash
cd backend
npm install
node server.js
# servidor em http://localhost:3000
```

**Endpoints disponíveis:**

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Status do servidor |
| `GET` | `/api/locais` | Lista todos os pontos do campus |
| `POST` | `/api/rota` | Calcula rota entre origem e destino |
| `GET` | `/api/buscar-local?local=` | Geocoding via Nominatim |

Os pontos do campus ficam em `backend/locais.json` — sem necessidade de banco de dados.

### Frontend

```bash
cd frontend
npx http-server -p 5500
# acesse http://127.0.0.1:5500
```

> O backend precisa estar rodando para que a busca e as rotas funcionem.

## Adicionar ou editar pontos

Edite `backend/locais.json` diretamente. O formato é:

```json
{
  "nome do local": [latitude, longitude]
}
```

O frontend sincroniza os chips e o autocomplete automaticamente ao carregar.

---

## Autoria e contribuições

Projeto iniciado pela turma de Engenharia de Software (5º período) do UniBH, sob orientação do professor Fabrício Valadares. A ideia original foi de Breno Yohan.

**Turma fundadora:** André · Bernardo · Breno · Eduardo · Guilherme · Laysla · Marian · João Victor

**Desenvolvimento contínuo e manutenção:** [João Victor Carvalho](https://github.com/joaokrv)
— Responsável pela refatoração do backend (remoção da dependência MSSQL, migração para JSON local), redesign completo da interface (glassmorphism, sistema de temas, action bar, animações), sistema de autocomplete dinâmico, correções de CORS e performance geral.
