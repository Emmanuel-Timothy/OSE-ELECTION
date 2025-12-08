const fullscreenBtn = document.getElementById('fullscreenBtn');

// Check if fullscreen was previously enabled
function checkFullscreenState() {
  const wasFullscreen = localStorage.getItem('isFullscreen') === 'true';
  if (wasFullscreen && !document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  }
}

// Initialize fullscreen state on page load
document.addEventListener('DOMContentLoaded', checkFullscreenState);

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Update button icon and save state when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  if (fullscreenBtn) {
    fullscreenBtn.textContent = document.fullscreenElement ? '⛶' : '⛶';
  }
  // Save fullscreen state to localStorage
  localStorage.setItem('isFullscreen', document.fullscreenElement ? 'true' : 'false');
});
