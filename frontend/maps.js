// Configurações do mapa
const MAP_CONFIG = {
  center: [-19.9716538355151, -43.96324375462156],
  zoom: 20,
  zoomMax: 20,
  zoomMin: 19,
  bounds: L.latLngBounds(
    L.latLng(-19.96967239132942, -43.96451512163013),
    L.latLng(-19.972541764414082, -43.962061590405),
  ),
  tileLayers: {
    satellite:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
}

// Variáveis globais
let map
let currentRoute = null

// Inicialização do mapa
function initMap() {
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    zoomMax: MAP_CONFIG.zoomMax,
    zoomMin: MAP_CONFIG.zoomMin,
    zoomControl: false,
  })

  // Camadas do mapa
  L.tileLayer(MAP_CONFIG.tileLayers.satellite, { attribution: '© Esri' }).addTo(
    map,
  )
  L.tileLayer(MAP_CONFIG.tileLayers.osm, {
    attribution: '© OpenStreetMap',
    opacity: 0.1,
  }).addTo(map)

  // Configurações de restrição
  map.setMaxBounds(MAP_CONFIG.bounds)
  map.on('drag', ajustarMapa)
  map.on('zoomend', ajustarMapa)
  map.on(
    'mouseout',
    () =>
      !map.getBounds().intersects(MAP_CONFIG.bounds) &&
      map.scrollWheelZoom.disable(),
  )
  map.on('mouseover', () => map.scrollWheelZoom.enable())
}

// Ajusta o mapa para manter os limites
function ajustarMapa() {
  if (!map.getBounds().intersects(MAP_CONFIG.bounds)) {
    map.fitBounds(MAP_CONFIG.bounds)
  }
  if (map.getZoom() < 19) map.setZoom(19)
}

// Controle do menu retrátil
function setupToggleMenu() {
  document
    .getElementById('toggle-search')
    .addEventListener('click', function () {
      const searchBox = document.getElementById('search-box')
      searchBox.classList.toggle('aberto')
      this.textContent = searchBox.classList.contains('aberto')
        ? '✕ Ocultar'
        : '☰ Busca'
    })
}

// Página de ajuda
function setupHelpButton() {
  document
    .getElementById('toggle-help')
    .addEventListener('click', function () {
      window.location.href = 'ajuda.html'
    })
}

// Seleção de locais frequentes
function setupLocalSelection() {
  document.querySelectorAll('.locais-list li').forEach((item) => {
    item.addEventListener('click', function () {
      const local = this.getAttribute('data-local')
      const campo = this.getAttribute('data-campo')
      selecionarLocal(local, campo)
    })
  })
}

window.addEventListener('DOMContentLoaded', setupHelpButton);

// Função para selecionar um local
function selecionarLocal(nome, campo) {
  document.getElementById(campo).value = nome
  const nextField = campo === 'origem' ? 'destino' : 'origem'
  document.getElementById(nextField).focus()

  // Fecha o menu em mobile (opcional)
  if (window.innerWidth < 768) {
    document.getElementById('search-box').classList.remove('aberto')
    document.getElementById('toggle-search').textContent = '☰ Busca'
  }
}

// Configuração dos botões de GPS
function setupGPSButtons() {
  document
    .getElementById('ativar-gps')
    .addEventListener('click', pedirPermissao)
  document.querySelectorAll('.gps-icon').forEach((icon) => {
    icon.addEventListener('click', function () {
      const campo = this.getAttribute('data-campo')
      buscarLocalizacaoAtual(campo)
    })
  })
}

// Funções de geolocalização
function pedirPermissao() {
  if (!navigator.geolocation) {
    alert('Seu navegador não suporta geolocalização.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    () => {
      document.getElementById('permissao-gps').style.display = 'none'
      alert(
        'Permissão concedida! Clique no ícone 📍 para usar sua localização.',
      )
    },
    (erro) => {
      alert(
        'Por favor, permita o acesso à localização nas configurações do seu navegador.',
      )
    },
    { maximumAge: 0 },
  )
}

// Função para buscar a localização atual
async function buscarLocalizacaoAtual(campo) {
  document.getElementById('permissao-gps').style.display = 'none'
  const input = document.getElementById(campo)
  input.value = 'Buscando...'

  if (!navigator.geolocation) {
    input.value = ''
    alert('Geolocalização não é suportada pelo seu navegador.')
    return
  }

  try {
    const posicao = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      })
    })

    const lat = posicao.coords.latitude
    const lng = posicao.coords.longitude
    input.value = `📍 Minha Localização (${lat.toFixed(6)}, ${lng.toFixed(6)})`

    const localizacaoAtual = L.latLng(lat, lng)
    if (MAP_CONFIG.bounds.contains(localizacaoAtual)) {
      L.marker(localizacaoAtual, {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/535/535137.png',
          iconSize: [30, 30],
        }),
      })
        .addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup()
    }
  } catch (erro) {
    input.value = ''
    handleGeolocationError(erro, campo)
  }
}

// Função para lidar com erros de geolocalização
function handleGeolocationError(erro, campo) {
  const erros = {
    PERMISSION_DENIED:
      'Por favor, permita o acesso à localização nas configurações do seu navegador.',
    POSITION_UNAVAILABLE:
      'Não foi possível detectar sua localização (sem GPS/Wi-Fi).',
    TIMEOUT: 'A busca demorou muito. Verifique sua conexão.',
    UNKNOWN_ERROR: 'Erro inesperado. Tente em um celular ou outro navegador.',
  }

  alert(erros[erro.code] || `Erro: ${erro.message}`)
  document.getElementById(campo).placeholder = 'Ex: Raizes 1, Raizes 2, etc.'
}

// Funções para criar marcadores
function criarMarcador(posicao, tipo) {
  const iconeUrl =
    tipo === 'origem'
      ? 'https://cdn-icons-png.flaticon.com/512/1912/1912182.png'
      : 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png'

  return L.marker(posicao, {
    icon: L.icon({
      iconUrl: iconeUrl,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
      className: `marcador-${tipo}`,
    }),
    zIndexOffset: 1000,
  }).bindPopup(tipo === 'origem' ? 'Origem' : 'Destino')
}

// Função para desenhar a rota no mapa
function desenharRota(pontos, origem, destino) {
  if (currentRoute) {
    map.removeLayer(currentRoute.linhaContorno)
    map.removeLayer(currentRoute.linhaPrincipal)
    currentRoute.marcadores.forEach((m) => map.removeLayer(m))
  }

  const linhaContorno = L.polyline(pontos, {
    color: 'white',
    weight: 9,
    opacity: 0.8,
  }).addTo(map)

  const linhaPrincipal = L.polyline(pontos, {
    color: '#0066ff',
    weight: 6,
    opacity: 1,
  }).addTo(map)

  const origemMarker = criarMarcador(pontos[0], 'origem').addTo(map)
  const destinoMarker = criarMarcador(
    pontos[pontos.length - 1],
    'destino',
  ).addTo(map)

  currentRoute = {
    linhaContorno,
    linhaPrincipal,
    marcadores: [origemMarker, destinoMarker],
  }
}

// Função para calcular a rota
async function calcularRota() {
  const btn = document.getElementById('calcRota')
  const origem = document.getElementById('origem').value.trim()
  const destino = document.getElementById('destino').value.trim()

  if (!origem || !destino) {
    alert('Por favor, preencha ambos os campos')
    return
  }

  btn.innerHTML = '<span class="spinner">⌛</span> Calculando...'
  btn.disabled = true

  try {
    try {
      const response = await fetch('https://maps-unibh.onrender.com/api/rota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem, destino }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      if (!response.ok) {
        throw new Error('Erro ao calcular rota')
      }

      const pontosLatLng = data.pontos.map((p) => L.latLng(p[0], p[1]))
      desenharRota(pontosLatLng, data.origem, data.destino)

      document.getElementById('search-box').classList.remove('aberto')
      document.getElementById('toggle-search').textContent = '☰ Busca'
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao calcular rota: ' + error.message)
    }
  } finally {
    btn.innerHTML = 'Calcular Rota'
    btn.disabled = false
  }
}

// Função para buscar coordenadas de um local
async function getCoordinates(local) {
  try {
    const response = await fetch(
      `https://maps-unibh.onrender.com/api/buscar-local?local=${encodeURIComponent(
        local,
      )}`,
    )
    const data = await response.json()

    if (!data) throw new Error('Local não encontrado')
    return L.latLng(data.lat, data.lon)
  } catch (error) {
    console.error('Erro ao buscar coordenadas:', error)
    throw error
  }
}

// Detecção de dispositivo
function detectarDispositivo() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  if (!isMobile) {
    document.getElementById('permissao-gps').style.display = 'block'
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initMap()
  setupToggleMenu()
  setupLocalSelection()
  setupGPSButtons()
  detectarDispositivo()

  // Configura o botão de calcular rota
  document.getElementById('calcRota').addEventListener('click', calcularRota)
})