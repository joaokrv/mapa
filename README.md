# 🗺️ Mapa Faculdade

Sistema de mapeamento inteligente e interativo para auxiliar na localização de salas, prédios, setores e espaços comuns dentro do campus universitário.

## 🎯 Objetivo

O **Mapa Faculdade** tem como missão facilitar a locomoção no campus por meio de um sistema acessível e eficiente, ideal para:

- 🧑‍🎓 Calouros e veteranos
- 👩‍🏫 Professores
- 👥 Visitantes
- 📍 Qualquer pessoa que deseje encontrar rapidamente seu destino dentro da faculdade

## 🚀 Funcionalidades planejadas

- 🔐 Sistema de login
- 🧭 Exibição de rotas até o destino
- 🆘 Botão de emergência para situações de risco
- 📞 Canal direto para contato com alguém da instituição
- 📣 Reporte de erros ou ocorrências no mapa
- 🧠 Interface amigável e intuitiva

## 🛠️ Tecnologias

- 🌐 HTML
- 🎨 CSS
- ⚙️ JavaScript (JS)
- 🗺️ API OpenStreetMaps

## 💡 Público-alvo

- Estudantes (novatos e veteranos)
- Professores e funcionários
- Visitantes e prestadores de serviço
- Qualquer pessoa que deseje se orientar dentro do campus

## 📱 Plataforma

O projeto será uma **aplicação web responsiva**, com plano futuro de expansão para dispositivos móveis.

## 🤝 Contribuição

Este projeto está sendo desenvolvido em equipe por alunos do curso de **Engenharia de Software**, com foco na aplicação prática de metodologias de desenvolvimento, usabilidade e design centrado no usuário.

## 🧠 Idealização

A ideia original do projeto **Mapa Faculdade** foi concebida por **Breno**, colega de turma de Engenharia de Software.

## 🔧 Configuração e Execução

### Backend

Para que o sistema de mapeamento funcione corretamente, é necessário iniciar o servidor backend que fornece as APIs de rotas e localização:

1. **Instale as dependências:**
   ```bash
   cd backend
   npm install
   ```
2. **Inicie o servidor**
    ```bash
    node server.js
    ```
3. **Verificação:**
    - O servidor estará rodando em: http://localhost:3000
    - Você verá a mensagem: "Servidor rodando na porta 3000"
    - As seguintes rotas estarão disponíveis:
        - `GET /api/locais` - Lista todos os locais disponíveis
        - `GET /api/buscar-local?local=NOME_DO_LOCAL` - Busca coordenadas de um local específico
        - `POST /api/rota` - Calcula rota entre origem e destino

### Frontend

Após iniciar o backend, você pode acessar o frontend de duas maneiras:

1. **Usando Live Server (VS Code):**
    - Instale a extensão "Live Server" no VS Code
    - Clique com o botão direito no arquivo frontend/docs/index.html
    - Selecione "Open with Live Server"

2. **Usando HTTP Server:**
    ```bash
    cd frontend
    npx http-server
    ```

    - Acesse: `http://localhost:8080/docs/index.html`

### ⚠ Importante
- O backend deve estar rodando para que as funcionalidades de rota e busca funcionem
- O frontend deve ser acessado via servidor HTTP (não abra os arquivos diretamente no navegador)
- Certifique-se de que o arquivo locais.json está presente na pasta backend


## 🧑‍🏫 Professor orientador

Este projeto está sendo desenvolvido sob orientação do professor **Fabrício Valadares**, no curso de **Engenharia de Software**.

## 👨‍💻 Autores

Desenvolvido pela turma de Engenharia de Software.
André, Bernardo, Breno, Eduardo, Guilherme, João Victor, Lay e Maria
