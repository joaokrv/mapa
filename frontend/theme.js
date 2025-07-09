document.addEventListener("DOMContentLoaded", () => {
  // Obtém os elementos HTML relevantes para a troca de tema
  const themeToggle = document.getElementById("theme-toggle"); // Botão de alternar tema
  const themeStylesheet = document.getElementById("theme-stylesheet"); // Link da folha de estilo atual
  const logoImage = document.querySelector(".logo"); // Elemento da logo (presente apenas na index.html)

  // Mapeamento das configurações de CSS e imagens de logo para cada página e tema.
  const pageThemesConfig = {
    // Configurações para a página inicial (index.html)
    "index-light": {
      cssFile: "style-index-light.css", // CSS para tema claro da index
      logoSrc: "logo-unibh.jpg", // Logo para tema claro da index
    },
    "index-dark": {
      cssFile: "style-index-dark.css", // CSS para tema escuro da index
      logoSrc: "logo-fundopng.png", // Logo para tema escuro da index
    },

    // Configurações para a página de ajuda (ajuda.html)
    "ajuda-light": {
      cssFile: "style-ajuda-light.css", // CSS para tema claro da ajuda
      logoSrc: null, // A página de ajuda não tem logo para trocar
    },
    "ajuda-dark": {
      cssFile: "style-ajuda-dark.css", // CSS para tema escuro da ajuda
      logoSrc: null, // A página de ajuda não tem logo para trocar
    },

    // Configurações para a página de mapas (maps.html)
    "maps-light": {
      cssFile: "style-maps-light.css", // CSS para tema claro do mapa
      logoSrc: null, // A página de mapas não tem logo para trocar
    },
    "maps-dark": {
      cssFile: "style-maps-dark.css", // CSS para tema escuro do mapa
      logoSrc: null, // A página de mapas não tem logo para trocar
    },
  };

  // Função para identificar o nome da página atual (ex: "index", "ajuda", "maps")
  function getCurrentPageName() {
    const path = window.location.pathname;
    if (path.includes("index.html") || path === "/" || path === "/frontend/") {
      return "index";
    } else if (path.includes("ajuda.html")) {
      return "ajuda";
    } else if (path.includes("maps.html")) {
      return "maps";
    }
    return null; // Retorna nulo se a página não for reconhecida
  }

  const currentPageName = getCurrentPageName(); // Obtém o nome da página ao carregar

  // Aplica o tema (claro ou escuro) à página atual.
  function applyTheme(themeName) {
    // Verifica se a página e a folha de estilo foram identificadas
    if (!currentPageName || !themeStylesheet) {
      console.warn(
        "Página ou stylesheet não identificado para aplicar o tema. currentPageName:",
        currentPageName,
        "themeStylesheet:",
        themeStylesheet
      );
      return;
    }

    // Cria a chave de configuração (ex: "index-light", "ajuda-dark")
    const configKey = `${currentPageName}-${themeName}`;
    const config = pageThemesConfig[configKey]; // Busca as configurações para a chave

    if (config) {
      themeStylesheet.href = config.cssFile; // Altera o arquivo CSS
      localStorage.setItem("theme", themeName); // Salva o tema no armazenamento local

      // Se houver uma logo na página e uma logo configurada para o tema, a altera
      if (logoImage && config.logoSrc) {
        logoImage.src = config.logoSrc;
      }
    } else {
      console.warn(`Configuração de tema não encontrada para: ${configKey}`);
    }
  }

  // --- Lógica de Inicialização do Tema ---

  // Tenta carregar o tema salvo anteriormente pelo usuário.
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme); // Aplica o tema salvo, se existir
  } else {
    // Se não houver tema salvo, verifica a preferência do sistema operacional
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      applyTheme("dark"); // Aplica tema escuro se o sistema preferir
    } else {
      applyTheme("light"); // Caso contrário, aplica o tema claro
    }
  }

  // --- Lógica de Alternância de Tema via Botão ---

  // Adiciona um listener de clique ao botão de alternar tema, se ele existir.
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      // Obtém o tema atual: verifica o salvo, senão infere do CSS
      const currentTheme =
        localStorage.getItem("theme") ||
        (themeStylesheet.href.includes("dark.css") ? "dark" : "light");

      // Alterna para o tema oposto
      if (currentTheme === "dark") {
        applyTheme("light");
      } else {
        applyTheme("dark");
      }
    });
  }
});
