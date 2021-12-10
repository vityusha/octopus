// preload_board.js
const { webFrame } = require('electron');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  console.log('append click event')
  const div = document.getElementById('mainDiv')
  if (div) {
    div.style.width = '82%';
  }
  const btnDiv = document.getElementById('closeButtonDiv')
  if (btnDiv) {
    btnDiv.style.visibility = 'visible';
  }
  const btn = document.getElementById('closeButton')
  if (btn) {
    btn.style.visibility = 'visible';
  }

  webFrame.setZoomFactor(0.85);
})
