# 🗺️ Mapa Faculdade

Sistema de mapeamento inteligente e interativo para auxiliar na localização de salas, prédios e setores dentro do campus universitário.

> 🔗 **Acesse a demonstração:**  
> 👉 [https://mapa-two.vercel.app](https://mapa-two.vercel.app)

---

## 🎯 Objetivo

O **Mapa Faculdade** tem como missão facilitar a locomoção no campus por meio de um sistema acessível e eficiente, ideal para:

- 🧑‍🎓 Calouros e veteranos
- 👩‍🏫 Professores
- 👥 Visitantes
- 📍 Qualquer pessoa que deseje encontrar rapidamente seu destino dentro da faculdade

---

## 🚀 Funcionalidades planejadas

- 🧭 Cálculo de rotas entre pontos do campus
- 🔍 Busca inteligente por locais
- 🧠 Interface amigável e intuitiva
- 📱 Responsividade para diferentes tamanhos de tela

---

## 🛠️ Tecnologias utilizadas

- 🌐 [HTML5](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
- 🎨 [CSS3](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
- ⚙️ [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- 🗺️ [Leaflet.js](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- 🧭 [OpenRouteService API](https://openrouteservice.org/)
- 🔙 [Node.js](https://nodejs.org/) (para o backend)

---

## 💡 Público-alvo

- Estudantes (novatos e veteranos)
- Professores e funcionários
- Visitantes e prestadores de serviço
- Qualquer pessoa que deseje se orientar dentro do campus

---

## 📱 Plataforma

Este projeto é uma **aplicação web responsiva**, com plano futuro de expansão para dispositivos móveis.

---

## 🔧 Como executar localmente

### 🖥️ Backend

1. **Instale as dependências:**

   ```bash
   cd backend
   npm install
   ```

2. **Inicie o servidor:**

   ```bash
   node server.js
   ```

3. **Verifique o funcionamento:**

- O servidor estará rodando em: http://localhost:3000

- Rotas disponíveis:
  - GET /api/locais — Lista todos os locais disponíveis
  - GET /api/buscar-local?local=NOME_DO_LOCAL — Busca coordenadas de um local específico
  - POST /api/rota — Calcula rota entre origem e destino

### 🌐 Frontend

Após iniciar o backend, abra o frontend:

1. **Opção 1 — VS Code + Live Server**

- Instale a extensão Live Server
- Clique com o botão direito no arquivo frontend/docs/index.html
- Selecione "Open with Live Server"

2. **Opção 2 — HTTP Server (via terminal)**

   ```bash
   cd frontend
   npx http-server
   ```

Acesse em: http://localhost:<porta>/docs/index.html

> ⚠️ **Importante:**
>
> - O **backend deve estar rodando** para que as funcionalidades funcionem.
> - O **frontend deve ser acessado via servidor HTTP**, não diretamente pelo navegador.
> - Verifique se o arquivo **`locais.json`** está presente na pasta `backend`.

## 👨‍🏫 Professor Orientador

Este projeto está sendo desenvolvido sob orientação do professor Fabrício Valadares, no curso de Engenharia de Software.

## 🧠 Idealização

A ideia original do Mapa Faculdade foi concebida por Breno, colega da turma de Engenharia de Software.

## 👨‍💻 Autores

Projeto desenvolvido pela turma de Engenharia de Software:
André, Bernardo, Breno, Eduardo, Guilherme, João Victor, Lay, Maria

## 🤝 Contribuição

Este projeto foi desenvolvido em equipe com foco na aplicação prática de:

- Metodologias ágeis
- Usabilidade e acessibilidade
- Design centrado no usuário
- Integração entre frontend e backend
