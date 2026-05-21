// Configurações do mapa - parâmetros globais para o mapa, como centro, zoom e camadas.
const MAP_CONFIG = {
  center: [-19.971175446951637, -43.963693397748266], // Coordenadas centrais do mapa
  zoom: 20, // Zoom inicial do mapa
  zoomMax: 25, // Zoom máximo permitido
  zoomMin: 17, // Zoom mínimo permitido

  // Limites geográficos para restringir a área visível do mapa
  bounds: L.latLngBounds(
    L.latLng(-19.969562054271996, -43.96529199424035),
    L.latLng(-19.97262748624759, -43.961837309203744)
  ),
  tileLayers: {
    // URL da camada de satélite (imagens de satélite)
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    // URL da camada OpenStreetMap (mapa de ruas)
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
};

// Variáveis globais para o mapa e a rota atual
let map; // Instância do mapa Leaflet
let currentRoute = null; // Armazena a rota atualmente desenhada no mapa

// Inicializa o mapa com as configurações definidas.
function initMap() {
  map = L.map("map", {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    zoomMax: MAP_CONFIG.zoomMax,
    zoomMin: MAP_CONFIG.zoomMin,
    zoomControl: false, // Desabilita o controle de zoom padrão do Leaflet
  });

  // Adiciona as camadas de satélite e OpenStreetMap ao mapa
  L.tileLayer(MAP_CONFIG.tileLayers.satellite, { attribution: "© Esri" }).addTo(
    map
  );

  // A camada OSM é adicionada com baixa opacidade para sobrepor a de satélite
  L.tileLayer(MAP_CONFIG.tileLayers.osm, {
    attribution: "© OpenStreetMap",
    opacity: 0.1,
  }).addTo(map);

  // Configurações de restrição e eventos do mapa
  map.setMaxBounds(MAP_CONFIG.bounds); // Restringe o mapa aos limites definidos
  map.on("drag", ajustarMapa); // Ajusta o mapa ao arrastar para manter dentro dos limites
  map.on("zoomend", ajustarMapa); // Ajusta o mapa ao finalizar o zoom

  // Desabilita o zoom da roda do mouse se o mapa sair dos limites
  map.on(
    "mouseout",
    () =>
      !map.getBounds().intersects(MAP_CONFIG.bounds) &&
      map.scrollWheelZoom.disable()
  );
  // Habilita o zoom da roda do mouse quando o mouse está sobre o mapa
  map.on("mouseover", () => map.scrollWheelZoom.enable());
}

// Ajusta o mapa para que ele sempre fique dentro dos limites definidos.
function ajustarMapa() {
  // Reajuste de mapa de acordo com o zoom e limite
  if (!map.getBounds().intersects(MAP_CONFIG.bounds)) {
    map.fitBounds(MAP_CONFIG.bounds);
  }
  // Se o zoom for menor que o mínimo, ele é redefinido para o mínimo
  if (map.getZoom() < MAP_CONFIG.zoomMin) {
    map.setZoom(MAP_CONFIG.zoomMin);
  }
}

// --- Configuração de Botões e Eventos ---

// Comportamento do botão que abre/fecha o menu de busca.
function setupToggleMenu() {
  document
    .getElementById("toggle-search")
    .addEventListener("click", function () {
      const searchBox = document.getElementById("search-box");
      const isAberto = searchBox.classList.toggle("aberto");
      this.classList.toggle("active", isAberto);
    });
}

// Configura o botão que redireciona para a página de ajuda.
function setupHelpButton() {
  document.getElementById("toggle-help").addEventListener("click", function () {
    window.location.href = "ajuda.html"; // Redireciona para a página de ajuda
  });
}

// Configura a seleção de locais frequentes na lista.
function setupLocalSelection() {
  document.querySelectorAll(".locais-list li").forEach((item) => {
    item.addEventListener("click", function () {
      const local = this.getAttribute("data-local"); // Pega o nome do local
      const campo = this.getAttribute("data-campo"); // Pega qual campo preencher (origem/destino)
      selecionarLocal(local, campo); // Chama a função para preencher o campo
    });
  });
}

// Configura o botão de limpar rota atual do mapa.
function setupClearRouteButton() {
  document.getElementById("toggle-route").addEventListener("click", limparRota); // Adiciona evento de clique para limpar a rota
}

// Executa setupHelpButton quando o DOM é carregado.
window.addEventListener("DOMContentLoaded", setupHelpButton);

// Preenche um campo de input com o nome do local e foca no próximo campo.
function selecionarLocal(nome, campo) {
  document.getElementById(campo).value = nome; // Preenche o campo de input

  // Determina qual será o próximo campo a focar (origem ou destino)
  const nextField = campo === "origem" ? "destino" : "origem";
  document.getElementById(nextField).focus(); // Foca no próximo campo

  // Fecha o menu de busca em telas menores (mobile)
  if (window.innerWidth < 768) {
    document.getElementById("search-box").classList.remove("aberto");
    document.getElementById("toggle-search").classList.remove("active");
  }
}

// Configura os eventos para os botões de GPS.
function setupGPSButtons() {
  document
    .getElementById("ativar-gps")
    .addEventListener("click", pedirPermissao); // Ativa permissão de GPS
  // Adiciona evento de clique aos ícones de GPS para buscar localização
  document.querySelectorAll(".gps-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      const campo = this.getAttribute("data-campo"); // Pega qual campo preencher (origem/destino)
      buscarLocalizacaoAtual(campo); // Busca e preenche a localização atual
    });
  });
}

// Configura o botão de limpar campos de origem/destino.
function setupClearFieldsButton() {
  // Seleciona todos os spans com a classe 'clear-input-icon'
  document.querySelectorAll(".clear-input-icon").forEach((btn) => {
    // Adiciona um 'click listener' a cada botão
    btn.addEventListener("click", function () {
      // Pega o ID do input alvo do atributo 'data-target'
      const campoId = this.getAttribute("data-target");
      limparCampo(campoId); // Chama a função para limpar o campo
    });
  });
}

// --- Funções de Geolocalização ---

// Solicita permissão do usuário para acessar a localização.
function pedirPermissao() {
  // Verifica se o navegador suporta geolocalização
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  // Tenta obter a localização atual para verificar a permissão
  navigator.geolocation.getCurrentPosition(
    () => {
      // Se a permissão for concedida, esconde a mensagem e alerta o usuário
      document.getElementById("permissao-gps").style.display = "none";
      alert(
        "Permissão concedida! Clique no ícone 📍 para usar sua localização."
      );
    },
    (erro) => {
      // Se a permissão for negada ou ocorrer erro, alerta o usuário
      alert(
        "Por favor, permita o acesso à localização nas configurações do seu navegador."
      );
    },
    { maximumAge: 0 } // Não usa cache de localização antiga
  );
}

// Busca a localização atual do usuário e preenche o campo correspondente.
async function buscarLocalizacaoAtual(campo) {
  document.getElementById("permissao-gps").style.display = "none"; // Esconde a mensagem de permissão
  const input = document.getElementById(campo);
  input.value = "Buscando..."; // Exibe "Buscando..." enquanto aguarda

  // Verifica novamente se o navegador suporta geolocalização
  if (!navigator.geolocation) {
    input.value = "";
    alert("Geolocalização não é suportada pelo seu navegador.");
    return;
  }

  try {
    // Obtém a posição atual do usuário usando Promises para async/await
    const posicao = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, // Tenta obter a localização mais precisa
        timeout: 10000, // Tempo máximo para obter a localização (10 segundos)
      });
    });

    const lat = posicao.coords.latitude;
    const lng = posicao.coords.longitude;
    // Exibe a localização formatada no campo de input
    input.value = `📍 Minha Localização (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

    const localizacaoAtual = L.latLng(lat, lng);
    // Adiciona um marcador de "Você está aqui" se a localização estiver dentro dos limites do mapa
    if (MAP_CONFIG.bounds.contains(localizacaoAtual)) {
      L.marker(localizacaoAtual, {
        icon: L.icon({
          iconUrl: "./mymarker.png", // ícone do marcador
          iconAnchor: [15, 30], // Ponto de ancoragem do ícone
          iconSize: [30, 30],
        }),
      })
        .addTo(map)
        .bindPopup("Você está aqui!")
        .openPopup();
    }
  } catch (erro) {
    input.value = ""; // Limpa o campo em caso de erro
    handleGeolocationError(erro, campo); // Lida com o erro de geolocalização
  }
}

// Exibe mensagens de erro específicas para problemas de geolocalização.
function handleGeolocationError(erro, campo) {
  const erros = {
    PERMISSION_DENIED:
      "Por favor, permita o acesso à localização nas configurações do seu navegador.",
    POSITION_UNAVAILABLE:
      "Não foi possível detectar sua localização (sem GPS/Wi-Fi).",
    TIMEOUT: "A busca demorou muito. Verifique sua conexão.",
    UNKNOWN_ERROR: "Erro inesperado. Tente em um celular ou outro navegador.",
  };

  alert(erros[erro.code] || `Erro: ${erro.message}`);
  document.getElementById(campo).placeholder = "Ex: Raizes 1, Raizes 2, etc.";
}

// --- Funções de Marcadores e Rotas ---

// Cria um marcador personalizado (origem ou destino) no mapa.
function criarMarcador(posicao, tipo) {
  return L.marker(posicao, {
    icon: L.icon({
      iconUrl: "./marker.png", // ícone do marcador
      iconSize: [48, 48], // Tamanho do ícone
      iconAnchor: [24, 48], // Ponto de ancoragem do ícone
      popupAnchor: [0, -48], // Ponto de ancoragem do popup
      className: `marcador-${tipo}`, // Classe CSS para estilização
    }),
    zIndexOffset: 1000, // Garante que o marcador fique acima de outros elementos
  }).bindPopup(tipo === "origem" ? "Origem" : "Destino"); // Adiciona um popup simples
}

// Desenha a rota no mapa, removendo a rota anterior se houver.
function desenharRota(pontos, origem, destino) {
  // Remove a rota e marcadores anteriores do mapa
  if (currentRoute) {
    map.removeLayer(currentRoute.linhaContorno);
    map.removeLayer(currentRoute.linhaPrincipal);
    currentRoute.marcadores.forEach((m) => map.removeLayer(m));
  }

  // Desenha a linha de contorno branca (para destaque)
  const linhaContorno = L.polyline(pontos, {
    color: "white",
    weight: 9,
    opacity: 0.8,
  }).addTo(map);

  // Desenha a linha principal da rota (azul)
  const linhaPrincipal = L.polyline(pontos, {
    color: "#0066ff",
    weight: 6,
    opacity: 1,
  }).addTo(map);

  // Adiciona marcadores de origem e destino
  const origemMarker = criarMarcador(pontos[0], "origem").addTo(map);
  const destinoMarker = criarMarcador(
    pontos[pontos.length - 1],
    "destino"
  ).addTo(map);

  // Armazena a rota atual para remoção futura
  currentRoute = {
    linhaContorno,
    linhaPrincipal,
    marcadores: [origemMarker, destinoMarker],
  };
}

// Calcula a rota entre dois pontos usando a API de backend.
async function calcularRota() {
  const btn = document.getElementById("calcRota");
  const origem = document.getElementById("origem").value.trim();
  const destino = document.getElementById("destino").value.trim();

  // Valida se ambos os campos foram preenchidos
  if (!origem || !destino) {
    alert("Por favor, preencha ambos os campos");
    return;
  }

  // Altera o texto do botão e o desabilita durante o cálculo
  btn.innerHTML = '<span class="spinner">⌛</span> Calculando...';
  btn.disabled = true;

  try {
    try {
      // Faz uma requisição POST para a API de rota
      const response = await fetch(
        `${API_BASE}/api/rota`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origem, destino }), // Envia origem e destino no corpo
        }
      );

      const data = await response.json();
      // Verifica se houve erro na resposta da API
      if (data.error) throw new Error(data.error);

      // Lança erro se a resposta não for OK (status 2xx)
      if (!response.ok) {
        throw new Error("Erro ao calcular rota");
      }

      // Converte os pontos da rota para o formato Leaflet LatLng
      const pontosLatLng = data.pontos.map((p) => L.latLng(p[0], p[1]));
      desenharRota(pontosLatLng, data.origem, data.destino); // Desenha a rota no mapa

      // Fecha o menu de busca
      document.getElementById("search-box").classList.remove("aberto");
      document.getElementById("toggle-search").classList.remove("active");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao calcular rota: " + error.message);
    }
  } finally {
    // Restaura o texto e habilita o botão após o cálculo (sucesso ou erro)
    btn.innerHTML = "Calcular Rota";
    btn.disabled = false;
  }
}

// Busca as coordenadas de um local específico através da API.
async function getCoordinates(local) {
  try {
    // Faz uma requisição GET para a API de busca de local
    const response = await fetch(
      `${API_BASE}/api/buscar-local?local=${encodeURIComponent(local)}`
    );
    const data = await response.json();

    if (!data) throw new Error("Local não encontrado"); // Lança erro se o local não for encontrado
    return L.latLng(data.lat, data.lon); // Retorna as coordenadas em formato Leaflet
  } catch (error) {
    console.error("Erro ao buscar coordenadas:", error);
    throw error; // Propaga o erro
  }
}

// Função com button para limpar a rota atual do mapa.
function limparRota() {
  if (currentRoute) {
    // Remove a rota e os marcadores do mapa
    map.removeLayer(currentRoute.linhaContorno);
    map.removeLayer(currentRoute.linhaPrincipal);
    currentRoute.marcadores.forEach((m) => map.removeLayer(m));
    currentRoute = null; // Reseta a rota atual
  }
}

// Detecta o tipo de dispositivo (mobile vs. desktop) e ajusta a visibilidade do botão de GPS.
function detectarDispositivo() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  // Se não for mobile, mostra a mensagem/botão para ativar o GPS (já que pode não ter GPS nativo)
  if (!isMobile) {
    document.getElementById("permissao-gps").style.display = "block";
  }
}

// --- Função de Compartilhamento via WhatsApp ---

// Compartilha a localização atual do usuário via WhatsApp.
function compartilharLocalizacao() {
  // Verifica se a API de Geolocalização é suportada pelo navegador
  if (navigator.geolocation) {
    // Obtém a posição atual do usuário
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log(
          `Localização atual: Latitude ${latitude}, Longitude ${longitude}`
        );

        // Cria a URL do Google Maps com as coordenadas
        const urlGoogleMaps = `http://maps.google.com/maps?q=${latitude},${longitude}`; // URL corrigida do Google Maps

        // Monta a mensagem para o WhatsApp, codificando a URL para ser segura em URL
        const mensagemWhatsApp = encodeURIComponent(
          `Olá! Estou compartilhando minha localização atual com você. Confira no link: ${urlGoogleMaps}`
        );

        // Cria o link final para o WhatsApp (API oficial)
        const linkWhatsApp = `https://api.whatsapp.com/send?text=${mensagemWhatsApp}`;

        // Abre o link do WhatsApp em uma nova aba/janela
        window.open(linkWhatsApp, "_blank");
      },
      // Callback para lidar com erros na obtenção da localização
      (error) => {
        console.error("Erro ao obter a localização:", error);
        let mensagemErro = "Não foi possível obter sua localização. ";

        // Mapeia os códigos de erro da geolocalização para mensagens amigáveis
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensagemErro += "Por favor, permita o acesso à localização.";
            break;
          case error.POSITION_UNAVAILABLE:
            mensagemErro += "A informação de localização está indisponível.";
            break;
          case error.TIMEOUT:
            mensagemErro +=
              "A requisição para obter a localização excedeu o tempo limite.";
            break;
          case error.UNKNOWN_ERROR:
            mensagemErro += "Ocorreu um erro desconhecido.";
            break;
        }
        alert(mensagemErro);
      },
      // Opções para getCurrentPosition
      {
        enableHighAccuracy: true, // Tenta obter a localização mais precisa
        timeout: 10000, // Tempo máximo para obter a localização (10 segundos)
        maximumAge: 0, // Não usa cache de localização antiga
      }
    );
  } else {
    // Se o navegador não suportar geolocalização
    alert("Seu navegador não suporta a geolocalização.");
  }
}

// --- Função para limpar campo de origem/destino ---
function limparCampo(campoId) {
  const input = document.getElementById(campoId);
  if (input) {
    input.value = ""; // Limpa o valor do campo
    input.focus(); // Foca no campo após limpar

    // Oculta o botão de limpar após o campo ser esvaziado
    const parentDiv = input.closest(".input-with-icon");
    if (parentDiv) {
      const clearButton = parentDiv.querySelector(".clear-input-icon");
      if (clearButton) {
        clearButton.style.display = "none"; // Oculta o botão
      }
    }
  } else {
    console.warn(`Campo com ID '${campoId}' não encontrado.`);
  }
}

// --- Função para controlar a visibilidade do botão de limpar ---
function setupClearButtonVisibility() {
  // Itera sobre todos os inputs que podem ter um botão de limpar associado
  document.querySelectorAll(".input-with-icon input").forEach((input) => {
    // Encontra o botão de limpar que pertence a este input
    const clearButton = input
      .closest(".input-with-icon")
      .querySelector(".clear-input-icon");

    if (clearButton) {
      // Inicializa a visibilidade do botão ao carregar a página
      if (input.value.length === 0) {
        clearButton.style.display = "none";
      } else {
        clearButton.style.display = "block";
      }

      // Adiciona um listener para o evento 'input'
      input.addEventListener("input", () => {
        if (input.value.length > 0) {
          clearButton.style.display = "block";
        } else {
          clearButton.style.display = "none";
        }
      });
    }
  });
}

const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://mapa-unibh-backend.onrender.com";

// Busca os locais da API e popula datalists e lista de atalhos.
async function carregarLocais() {
  try {
    const res = await fetch(`${API_BASE}/api/locais`);
    const locais = await res.json();
    const nomes = Object.keys(locais);

    const capitalizar = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

    ["sugestoes-origem", "sugestoes-destino"].forEach((id) => {
      const dl = document.getElementById(id);
      if (!dl) return;
      dl.innerHTML = "";
      nomes.forEach((nome) => {
        const opt = document.createElement("option");
        opt.value = capitalizar(nome);
        dl.appendChild(opt);
      });
    });

    const lista = document.querySelector(".locais-list ul");
    if (lista) {
      lista.innerHTML = "";
      nomes.forEach((nome) => {
        const li = document.createElement("li");
        li.dataset.local = capitalizar(nome);
        li.dataset.campo = "origem";
        li.textContent = capitalizar(nome);
        li.addEventListener("click", function () {
          selecionarLocal(this.dataset.local, this.dataset.campo);
        });
        lista.appendChild(li);
      });
    }
  } catch (err) {
    console.warn("Não foi possível carregar locais da API:", err.message);
  }
}

// --- Inicialização do DOM e Event Listeners ---

// Garante que o script só execute após o DOM estar completamente carregado.
document.addEventListener("DOMContentLoaded", () => {
  // Inicialização do mapa
  initMap();
  carregarLocais();

  // Configuração dos botões e menus
  setupToggleMenu(); // Menu retrátil de busca
  setupHelpButton(); // Botão de ajuda
  setupLocalSelection(); // Seleção de locais frequentes
  setupGPSButtons(); // Botões de GPS
  setupClearRouteButton(); // Botão para limpar rota atual
  setupClearButtonVisibility(); // Configuração de visibilidade do botão de limpar
  setupClearFieldsButton(); // Botões de limpar campos de origem/destino
  detectarDispositivo(); // Detecta o dispositivo para exibir/esconder o GPS

  // Adiciona evento de clique ao botão de calcular rota
  document.getElementById("calcRota").addEventListener("click", calcularRota);

  // Configuração do botão de compartilhar localização
  const shareButton = document.getElementById("toggle-share");
  if (shareButton) {
    shareButton.addEventListener("click", compartilharLocalizacao);
  } else {
    console.warn("Elemento com ID 'toggle-share' não encontrado no DOM.");
  }

  // Botão de fechar (X) dentro do painel
  const searchBox = document.getElementById("search-box");
  const toggleSearchBtn = document.getElementById("toggle-search");
  const closeBtn = document.querySelector("#search-box .close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      searchBox.classList.remove("aberto");
      toggleSearchBtn.classList.remove("active");
    });
  }
});
