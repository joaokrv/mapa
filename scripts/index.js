/**
 * Navegação para a página do mapa
 * @function entrar
 */
function entrar() {
  window.location.href = "maps.html";
}

// Configura evento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('entrarBtn').addEventListener('click', () => {
    window.location.href = "maps.html"; // Relativo à pasta docs
  });
});