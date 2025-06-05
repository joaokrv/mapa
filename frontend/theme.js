
document.addEventListener('DOMContentLoaded', () => {
    console.log("1. DOMContentLoaded acionado.");

    const themeToggle = document.getElementById('theme-toggle');
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const logoImage = document.querySelector('.logo'); // A logo só existe na index.html

    console.log("Variáveis HTML capturadas:");
    console.log("   themeToggle:", themeToggle);
    console.log("   themeStylesheet:", themeStylesheet);
    console.log("   logoImage:", logoImage);

    // Mapeamento dos arquivos CSS e imagens para cada página e tema.
    const pageThemesConfig = {
        'index-light': {
            cssFile: 'style-index-light.css',
            logoSrc: 'logo-unibh.jpg'
        },
        'index-dark': {
            cssFile: 'style-index-dark.css',
            logoSrc: 'logo-fundopng.png'
        },
        'ajuda-light': {
            cssFile: 'style-ajuda-light.css',
            logoSrc: null
        },
        'ajuda-dark': {
            cssFile: 'style-ajuda-dark.css',
            logoSrc: null
        },
        // Configurações para a página de mapas
        'maps-light': {
            cssFile: 'style-maps-light.css',
            logoSrc: null // A página de mapas não tem logo para trocar
        },
        'maps-dark': {
            cssFile: 'style-maps-dark.css',
            logoSrc: null // A página de mapas não tem logo para trocar
        }
    };

    // Função para determinar o nome da página atual
    function getCurrentPageName() {
        const path = window.location.pathname;
        console.log("Caminho da URL dentro da função:", path);
        if (path.includes('index.html') || path === '/' || path === '/frontend/') { // <-- ADICIONADA ESTA CONDIÇÃO
            return 'index';
        } else if (path.includes('ajuda.html')) {
            return 'ajuda';
        } else if (path.includes('maps.html')) {
            return 'maps';
        }
        return null;
    }

    const currentPageName = getCurrentPageName();
    console.log("Nome da página atual:", currentPageName);
    // Função para aplicar o tema à página atual
    function applyTheme(themeName) {
        console.log(`Tentando aplicar o tema: ${themeName} para a página: ${currentPageName}`);
        if (!currentPageName || !themeStylesheet) {
        console.warn('Página ou stylesheet não identificado para aplicar o tema. currentPageName:', currentPageName, 'themeStylesheet:', themeStylesheet);
            return;
        }

        const configKey = `${currentPageName}-${themeName}`;
        const config = pageThemesConfig[configKey];

        if (config) {
            themeStylesheet.href = config.cssFile;
            localStorage.setItem('theme', themeName);

            if (logoImage && config.logoSrc) {
                logoImage.src = config.logoSrc;
            }
        } else {
            console.warn(`Configuração de tema não encontrada para: ${configKey}`);
        }
    }

    // Lógica de inicialização do tema ao carregar a página
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    }

    // Lógica de alternância de tema via botão
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme') ||
                                 (themeStylesheet.href.includes('dark.css') ? 'dark' : 'light');

            if (currentTheme === 'dark') {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }
});