// Configurações do mapa
const MAP_CONFIG = {
  center: [-19.9716538355151, -43.96324375462156],
  zoom: 20,
  zoomMax: 20,
  zoomMin: 19,
  bounds: L.latLngBounds(
    L.latLng(-19.96967239132942, -43.96451512163013),
    L.latLng(-19.972541764414082, -43.962061590405)
  ),
  tileLayers: {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }
};

// Locais mapeados do campus
const LOCAIS_UNIBH = {
  "raizes 1": [-19.969856109489676, -43.96367690076781],
            "raízes 1": [-19.969856109489676, -43.96367690076781],
            "raiz 1": [-19.969856109489676, -43.96367690076781],
            "raíz 1": [-19.969856109489676, -43.96367690076781],
            "raizes 2": [-19.96987750032474, -43.963388616338555],
            "raízes 2": [-19.96987750032474, -43.963388616338555],
            "raiz 2": [-19.96987750032474, -43.963388616338555],
            "raíz 2": [-19.96987750032474, -43.963388616338555],
            "raizes 3": [-19.96989176087983, -43.96317998944897],
            "raízes 3": [-19.96989176087983, -43.96317998944897],
            "raiz 3": [-19.96989176087983, -43.96317998944897],
            "raíz 3": [-19.96989176087983, -43.96317998944897],
            "raizes 4": [-19.969824023231656, -43.96278170175067],
            "raízes 4": [-19.969824023231656, -43.96278170175067],
            "raiz 4": [-19.969824023231656, -43.96278170175067],
            "raíz 4": [-19.969824023231656, -43.96278170175067],
            "raizes 5": [-19.970159146048992, -43.96249721053759],
            "raízes 5": [-19.970159146048992, -43.96249721053759],
            "raiz 5": [-19.970159146048992, -43.96249721053759],
            "raíz 5": [-19.970159146048992, -43.96249721053759],
            "raizes 6": [-19.970419400511535, -43.963289992718025],
            "raízes 6": [-19.970419400511535, -43.963289992718025],
            "raiz 6": [-19.970419400511535, -43.963289992718025],
            "raíz 6": [-19.970419400511535, -43.963289992718025],
            "raizes 7": [-19.970651133575544, -43.96321412839454],
            "raízes 7": [-19.970651133575544, -43.96321412839454],
            "raiz 7": [-19.970651133575544, -43.96321412839454],
            "raíz 7": [-19.970651133575544, -43.96321412839454],
            "raizes 8": [-19.970979124407023, -43.96275894245362],
            "raízes 8": [-19.970979124407023, -43.96275894245362],
            "raiz 8": [-19.970979124407023, -43.96275894245362],
            "raíz 8": [-19.970979124407023, -43.96275894245362],
            "capela": [-19.970651133575544, -43.96266790526544],
            "capela unibh": [-19.970651133575544, -43.96266790526544],
            "são judas tadeu": [-19.970651133575544, -43.96266790526544],
            "sao judas": [-19.970651133575544, -43.96266790526544],
            "sao judas tadeu": [-19.970651133575544, -43.96266790526544],
            "biblioteca": [-19.971538846326318, -43.96317619620943],
            "portaria": [-19.97070507005798, -43.9647914402454],
            "entrada": [-19.97070507005798, -43.9647914402454],
            "lanchonete": [-19.970848762471537, -43.96404176283281],
            "lanchonete zito": [-19.971775933000565, -43.96389248930361],
            "zito": [-19.971775933000565, -43.96389248930361],
            "estacionamento": [-19.970560117051964, -43.963819139495826],
            "cafeteria": [-19.970837639210675, -43.96361509017953],
};

// Variáveis globais
let map;
let currentRoute = null;

// Inicialização do mapa
function initMap() {
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    zoomMax: MAP_CONFIG.zoomMax,
    zoomMin: MAP_CONFIG.zoomMin,
    zoomControl: false
  });

  // Camadas do mapa
  L.tileLayer(MAP_CONFIG.tileLayers.satellite, { attribution: '© Esri' }).addTo(map);
  L.tileLayer(MAP_CONFIG.tileLayers.osm, {
    attribution: '© OpenStreetMap',
    opacity: 0.1
  }).addTo(map);

  // Configurações de restrição
  map.setMaxBounds(MAP_CONFIG.bounds);
  map.on('drag', ajustarMapa);
  map.on('zoomend', ajustarMapa);
  map.on('mouseout', () => !map.getBounds().intersects(MAP_CONFIG.bounds) && map.scrollWheelZoom.disable());
  map.on('mouseover', () => map.scrollWheelZoom.enable());

  // Adiciona marcador da faculdade
  addUniversityMarker();
}

function addUniversityMarker() {
  const studyIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2231/2231549.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  L.marker(MAP_CONFIG.center, { icon: studyIcon })
    .addTo(map)
    .bindPopup('Faculdade UniBH')
    .openPopup();
}

function ajustarMapa() {
  if (!map.getBounds().intersects(MAP_CONFIG.bounds)) {
    map.fitBounds(MAP_CONFIG.bounds);
  }
  if (map.getZoom() < 19) map.setZoom(19);
}

// Controle do menu retrátil
function setupToggleMenu() {
  document.getElementById('toggle-search').addEventListener('click', function() {
    const searchBox = document.getElementById('search-box');
    searchBox.classList.toggle('aberto');
    this.textContent = searchBox.classList.contains('aberto') ? '✕ Ocultar' : '☰ Busca';
  });
}

// Seleção de locais frequentes
function setupLocalSelection() {
  document.querySelectorAll('.locais-list li').forEach(item => {
    item.addEventListener('click', function() {
      const local = this.getAttribute('data-local');
      const campo = this.getAttribute('data-campo');
      selecionarLocal(local, campo);
    });
  });
}

function selecionarLocal(nome, campo) {
  document.getElementById(campo).value = nome;
  const nextField = campo === 'origem' ? 'destino' : 'origem';
  document.getElementById(nextField).focus();
  
  // Fecha o menu em mobile (opcional)
  if (window.innerWidth < 768) {
    document.getElementById('search-box').classList.remove('aberto');
    document.getElementById('toggle-search').textContent = '☰ Busca';
  }
}

// Configuração dos botões de GPS
function setupGPSButtons() {
  document.getElementById('ativar-gps').addEventListener('click', pedirPermissao);
  document.querySelectorAll('.gps-icon').forEach(icon => {
    icon.addEventListener('click', function() {
      const campo = this.getAttribute('data-campo');
      buscarLocalizacaoAtual(campo);
    });
  });
}

// Funções de geolocalização
function pedirPermissao() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta geolocalização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    () => {
      document.getElementById('permissao-gps').style.display = 'none';
      alert("Permissão concedida! Clique no ícone 📍 para usar sua localização.");
    },
    (erro) => {
      alert("Por favor, permita o acesso à localização nas configurações do seu navegador.");
    },
    { maximumAge: 0 }
  );
}

async function buscarLocalizacaoAtual(campo) {
  document.getElementById('permissao-gps').style.display = 'none';
  const input = document.getElementById(campo);
  input.value = "Buscando...";

  if (!navigator.geolocation) {
    input.value = "";
    alert("Geolocalização não é suportada pelo seu navegador.");
    return;
  }

  try {
    const posicao = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });

    const lat = posicao.coords.latitude;
    const lng = posicao.coords.longitude;
    input.value = `📍 Minha Localização (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

    const localizacaoAtual = L.latLng(lat, lng);
    if (MAP_CONFIG.bounds.contains(localizacaoAtual)) {
      L.marker(localizacaoAtual, {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/535/535137.png',
          iconSize: [30, 30]
        })
      }).addTo(map).bindPopup("Você está aqui!").openPopup();
    }
  } catch (erro) {
    input.value = "";
    handleGeolocationError(erro, campo);
  }
}

function handleGeolocationError(erro, campo) {
  const erros = {
    "PERMISSION_DENIED": "Por favor, permita o acesso à localização nas configurações do seu navegador.",
    "POSITION_UNAVAILABLE": "Não foi possível detectar sua localização (sem GPS/Wi-Fi).",
    "TIMEOUT": "A busca demorou muito. Verifique sua conexão.",
    "UNKNOWN_ERROR": "Erro inesperado. Tente em um celular ou outro navegador."
  };
  
  alert(erros[erro.code] || `Erro: ${erro.message}`);
  document.getElementById(campo).placeholder = "Ex: Raizes 1, Raizes 2, etc.";
}

// Funções de rota
function criarMarcador(posicao, tipo) {
  const iconeUrl = tipo === 'origem' 
    ? 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png' 
    : 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png';

  return L.marker(posicao, {
    icon: L.icon({
      iconUrl: iconeUrl,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
      className: `marcador-${tipo}`
    }),
    zIndexOffset: 1000
  }).bindPopup(tipo === 'origem' ? "Origem" : "Destino");
}

function criarRotaParabola(origem, destino) {
  if (currentRoute) {
    map.removeLayer(currentRoute.linhaContorno);
    map.removeLayer(currentRoute.linhaPrincipal);
    currentRoute.marcadores.forEach(m => map.removeLayer(m));
  }

  const pontos = [];
  const steps = 20;
  const alturaMaxima = 0.0002;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = origem.lng + t * (destino.lng - origem.lng);
    const latBase = origem.lat + t * (destino.lat - origem.lat);
    const lat = latBase + alturaMaxima * Math.sin(Math.PI * t);
    pontos.push(L.latLng(lat, lng));
  }

  const linhaContorno = L.polyline(pontos, {
    color: 'white',
    weight: 9,
    opacity: 0.8,
    lineJoin: 'round'
  }).addTo(map);
  
  const linhaPrincipal = L.polyline(pontos, {
    color: '#0066ff',
    weight: 6,
    opacity: 1,
    lineJoin: 'round'
  }).addTo(map);

  const origemMarker = criarMarcador(pontos[0], 'origem').addTo(map);
  const destinoMarker = criarMarcador(pontos[pontos.length-1], 'destino').addTo(map);

  map.fitBounds(L.latLngBounds(pontos[0], pontos[pontos.length-1]), {
    padding: [50, 50]
  });

  currentRoute = {
    linhaContorno,
    linhaPrincipal,
    marcadores: [origemMarker, destinoMarker]
  };
}

async function calcularRota() {
  const btn = document.getElementById('calcRota');
  const origem = document.getElementById('origem').value.trim();
  const destino = document.getElementById('destino').value.trim();

  if (!origem || !destino) {
    alert('Por favor, preencha ambos os campos');
    return;
  }

  btn.innerHTML = '<span class="spinner">⌛</span> Calculando...';
  btn.disabled = true;

  try {
    const origemLower = origem.toLowerCase();
    const destinoLower = destino.toLowerCase();

    // Fecha o menu após calcular
    document.getElementById('search-box').classList.remove('aberto');
    document.getElementById('toggle-search').textContent = '☰ Busca';

    // Verifica primeiro nos locais mapeados
    if (LOCAIS_UNIBH[origemLower] && LOCAIS_UNIBH[destinoLower]) {
      const origemCoord = L.latLng(LOCAIS_UNIBH[origemLower]);
      const destinoCoord = L.latLng(LOCAIS_UNIBH[destinoLower]);
      criarRotaParabola(origemCoord, destinoCoord);
      return;
    }

    // Se não encontrou nos mapeados, usa a API
    const [origemCoord, destinoCoord] = await Promise.all([
      getCoordinates(origem, origemLower),
      getCoordinates(destino, destinoLower)
    ]);

    // Verificação de limites
    if (!MAP_CONFIG.bounds.contains(origemCoord) || !MAP_CONFIG.bounds.contains(destinoCoord)) {
      const locaisValidos = Object.keys(LOCAIS_UNIBH).join(', ');
      alert(`Locais devem estar dentro do campus. Tente: ${locaisValidos}`);
      return;
    }

    criarRotaParabola(origemCoord, destinoCoord);

  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao calcular rota: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Calcular Rota';
  }
}

async function getCoordinates(local, localLower) {
  if (LOCAIS_UNIBH[localLower]) {
    return L.latLng(LOCAIS_UNIBH[localLower]);
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}+UniBH+Belo+Horizonte&limit=1`
  );
  const data = await response.json();

  if (!data[0]) throw new Error('Local não encontrado');
  return L.latLng(data[0].lat, data[0].lon);
}

// Detecção de dispositivo
function detectarDispositivo() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) {
    document.getElementById('permissao-gps').style.display = 'block';
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupToggleMenu();
  setupLocalSelection();
  setupGPSButtons();
  detectarDispositivo();

  // Configura o botão de calcular rota
  document.getElementById('calcRota').addEventListener('click', calcularRota);
});