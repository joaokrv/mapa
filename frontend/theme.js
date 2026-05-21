document.addEventListener("DOMContentLoaded", () => {
  const themeToggle    = document.getElementById("theme-toggle");
  const themeStylesheet = document.getElementById("theme-stylesheet");
  const logoImage      = document.querySelector(".logo");

  const v = "?v=6";
  const pageThemesConfig = {
    "index-light": { cssFile: `style-index-light.css${v}`, logoSrc: "logo-unibh.jpg" },
    "index-dark":  { cssFile: `style-index-dark.css${v}`,  logoSrc: "logo-fundopng.png" },
    "ajuda-light": { cssFile: `style-ajuda-light.css${v}`, logoSrc: null },
    "ajuda-dark":  { cssFile: `style-ajuda-dark.css${v}`,  logoSrc: null },
    "maps-light":  { cssFile: `style-maps-light.css${v}`,  logoSrc: null },
    "maps-dark":   { cssFile: `style-maps-dark.css${v}`,   logoSrc: null },
  };

  function getCurrentPageName() {
    const path = window.location.pathname;
    if (path.includes("ajuda.html"))  return "ajuda";
    if (path.includes("maps.html"))   return "maps";
    return "index";
  }

  const currentPageName = getCurrentPageName();

  function applyTheme(themeName, animate = true) {
    if (!currentPageName || !themeStylesheet) return;

    const config = pageThemesConfig[`${currentPageName}-${themeName}`];
    if (!config) return;

    const doSwap = () => {
      themeStylesheet.href = config.cssFile;
      localStorage.setItem("theme", themeName);
      if (logoImage && config.logoSrc) logoImage.src = config.logoSrc;
      document.body.classList.toggle("theme-dark",  themeName === "dark");
      document.body.classList.toggle("theme-light", themeName === "light");
    };

    if (!animate) {
      doSwap(); // aplica CSS, classe body e logo imediatamente
      return;
    }

    // fade out → swap → fade in
    document.body.style.transition = "opacity 0.18s ease";
    document.body.style.opacity    = "0";

    setTimeout(() => {
      doSwap();
      // próximo frame para garantir que o novo CSS foi aplicado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.style.opacity = "1";
          setTimeout(() => {
            document.body.style.transition = "";
            document.body.style.opacity    = "";
          }, 200);
        });
      });
    }, 180);
  }

  // --- Inicialização ---
  const savedTheme = localStorage.getItem("theme")
    || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  applyTheme(savedTheme, false); // primeira carga sem animação

  // --- Toggle ---
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = localStorage.getItem("theme")
        || (themeStylesheet.href.includes("dark") ? "dark" : "light");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
});
