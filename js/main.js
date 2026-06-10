
(function(){
  'use strict';

  const sections = document.querySelectorAll('.scroll-section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.style.animationDelay = '0.1s'; });
  }, { threshold: 0.15 });
  sections.forEach(s => observer.observe(s));

  if (document.body.classList.contains('style-physics')) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      document.querySelectorAll('.parallax-section').forEach((el, i) => {
        el.style.transform = `translateY(${y * (0.02 + i * 0.01)}px)`;
      });
    }, { passive: true });
  }

  function postBridge(payload) {
    if (window.dripzoneBridge) {
      window.dripzoneBridge(JSON.stringify(payload));
    } else if (window.chrome && window.chrome.webview) {
      window.chrome.webview.postMessage(JSON.stringify(payload));
    }
  }

  function dzInitEdit() {
    document.querySelectorAll('[data-dz-editable]').forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('dz-editable');
      el.addEventListener('blur', () => {
        postBridge({ type: 'content', id: el.dataset.dzId || el.dataset.dzEditable, content: el.innerText });
      });
    });

    document.querySelectorAll('.dz-draggable, [data-dz-id]').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', el.dataset.dzId || 'section');
        el.style.opacity = '0.5';
      });
      el.addEventListener('dragend', () => { el.style.opacity = '1'; });
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', e => {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        postBridge({
          type: 'move',
          id: e.dataTransfer.getData('text/plain'),
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          width: rect.width,
          height: rect.height
        });
      });
    });

    document.addEventListener('click', e => {
      const target = e.target.closest('[data-dz-id]');
      if (target) postBridge({ type: 'select', id: target.dataset.dzId });
    });
  }

  window.__dzInitEdit = dzInitEdit;
  if (window.__DRIPZONE_EDIT_MODE__ === true) {
    dzInitEdit();
  }
})();
