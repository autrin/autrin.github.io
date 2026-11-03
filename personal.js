(() => {
  const dialog = document.querySelector('.photo-dialog');
  const image = document.querySelector('#expanded-photo');
  const viewport = document.querySelector('.photo-viewport');
  const zoom = document.querySelector('#zoom-photo');
  let opener;
  const setZoom = (active) => {
    dialog.classList.toggle('is-zoomed', active);
    zoom.setAttribute('aria-pressed', String(active));
    zoom.textContent = active ? 'Fit image' : 'Zoom in';
    viewport.scrollTo(0, 0);
  };
  document.querySelectorAll('.photo-open').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      image.src = button.querySelector('img').src;
      image.alt = button.querySelector('img').alt;
      document.querySelector('#photo-title').textContent = button.dataset.caption;
      setZoom(false);
      dialog.showModal();
    });
  });
  zoom.addEventListener('click', () => setZoom(!dialog.classList.contains('is-zoomed')));
  image.addEventListener('click', () => setZoom(!dialog.classList.contains('is-zoomed')));
  document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
})();
