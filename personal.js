(() => {
  const dialog = document.querySelector('.photo-dialog');
  const image = document.querySelector('#expanded-photo');
  const viewport = document.querySelector('.photo-viewport');
  const zoomButton = document.querySelector('#zoom-photo');
  const closeButton = document.querySelector('#close-photo');
  const previousButton = document.querySelector('#previous-photo');
  const nextButton = document.querySelector('#next-photo');
  const title = document.querySelector('#photo-title');
  const counter = document.querySelector('#photo-counter');

  if (
    !dialog ||
    !image ||
    !viewport ||
    !zoomButton ||
    !closeButton ||
    !previousButton ||
    !nextButton ||
    !title ||
    !counter
  ) {
    return;
  }

  const allPhotoButtons = Array.from(
    document.querySelectorAll('.photo-open')
  );

  let currentGallery = [];
  let currentIndex = 0;
  let opener = null;

  const setZoom = active => {
    dialog.classList.toggle('is-zoomed', active);
    zoomButton.setAttribute('aria-pressed', String(active));
    zoomButton.textContent = active ? 'Fit image' : 'Zoom in';
    viewport.scrollTo(0, 0);
  };

  const getGalleryForButton = button => {
    const galleryName = button.dataset.gallery;

    /*
     * Photos without a data-gallery value, such as the computer-science map,
     * open by themselves and do not join the memories slideshow.
     */
    if (!galleryName) {
      return [button];
    }

    return allPhotoButtons.filter(
      photoButton => photoButton.dataset.gallery === galleryName
    );
  };

  const showPhoto = index => {
    if (!currentGallery.length) {
      return;
    }

    /*
     * Wrap around so Previous on the first photo opens the last photo,
     * and Next on the last photo returns to the first.
     */
    currentIndex =
      (index + currentGallery.length) % currentGallery.length;

    const button = currentGallery[currentIndex];
    const thumbnail = button.querySelector('img');

    if (!thumbnail) {
      return;
    }

    image.src = thumbnail.currentSrc || thumbnail.src;
    image.alt = thumbnail.alt;
    title.textContent = button.dataset.gallery === 'memories'
      ? 'Photo gallery'
      : button.dataset.caption || thumbnail.alt || 'Photo';

    const hasMultiplePhotos = currentGallery.length > 1;

    previousButton.hidden = !hasMultiplePhotos;
    nextButton.hidden = !hasMultiplePhotos;

    counter.textContent = hasMultiplePhotos
      ? `${currentIndex + 1} of ${currentGallery.length}`
      : '';

    setZoom(false);
  };

  const openGallery = button => {
    opener = button;
    currentGallery = getGalleryForButton(button);
    currentIndex = currentGallery.indexOf(button);

    showPhoto(currentIndex);
    dialog.showModal();
  };

  const showPreviousPhoto = () => {
    showPhoto(currentIndex - 1);
  };

  const showNextPhoto = () => {
    showPhoto(currentIndex + 1);
  };

  allPhotoButtons.forEach(button => {
    button.addEventListener('click', () => {
      openGallery(button);
    });
  });

  previousButton.addEventListener('click', showPreviousPhoto);
  nextButton.addEventListener('click', showNextPhoto);

  zoomButton.addEventListener('click', () => {
    setZoom(!dialog.classList.contains('is-zoomed'));
  });

  image.addEventListener('click', () => {
    setZoom(!dialog.classList.contains('is-zoomed'));
  });

  closeButton.addEventListener('click', () => {
    dialog.close();
  });

  dialog.addEventListener('keydown', event => {
    /*
     * Avoid switching photos while someone is activating another control.
     */
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousPhoto();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextPhoto();
    }
  });

  dialog.addEventListener('close', () => {
    setZoom(false);
    opener?.focus();
  });
})();