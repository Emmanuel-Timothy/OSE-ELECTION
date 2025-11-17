const fullscreenBtn = document.getElementById('fullscreenBtn');

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

// Update button icon when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  if (fullscreenBtn) {
    fullscreenBtn.textContent = document.fullscreenElement ? '⛶' : '⛶';
  }
});
