/**
 * Shared-Element (FLIP) Morph Modal & Split View Engine
 * PRD Spec 4.4: First-Last-Invert-Play animations + Stamped Metal License Plate Card
 */

class FlipModalController {
  constructor() {
    this.modal = document.getElementById('detail-modal');
    this.modalContent = document.getElementById('modal-content-container');
    this.imageContainer = document.getElementById('modal-image-container');
    this.carImage = document.getElementById('modal-car-image');
    this.plateContainer = document.getElementById('modal-plate-container');
    this.closeBtn = document.getElementById('modal-close-btn');
    this.prevBtn = document.getElementById('modal-prev-btn');
    this.nextBtn = document.getElementById('modal-next-btn');

    this.activeCardElement = null;
    this.isAnimating = false;

    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigate(-1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigate(1);
      });
    }

    // Close on backdrop click (outside content card)
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal || e.target.classList.contains('modal-backdrop-click')) {
          this.close();
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!window.appState || window.appState.activeCarId === null) return;
      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'ArrowLeft') {
        this.navigate(-1);
      } else if (e.key === 'ArrowRight') {
        this.navigate(1);
      }
    });
  }

  open(carId, sourceCardElement) {
    if (this.isAnimating || !window.appState) return;
    const car = window.appState.cars.find(c => c.id === carId);
    if (!car) return;

    this.isAnimating = true;
    this.activeCardElement = sourceCardElement;
    window.appState.activeCarId = carId;

    // FIRST: Measure source card geometry
    const firstRect = sourceCardElement ? sourceCardElement.getBoundingClientRect() : null;

    // Render Car Data inside Modal
    this.populateModalData(car);

    // LAST: Display modal in DOM to calculate final layout
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Update nav buttons disabled state if needed
    this.updateNavButtons();

    if (firstRect && this.imageContainer) {
      const lastRect = this.imageContainer.getBoundingClientRect();

      // INVERT: Calculate position and scale differences
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;
      const scaleX = firstRect.width / Math.max(lastRect.width, 1);
      const scaleY = firstRect.height / Math.max(lastRect.height, 1);

      // Instantly position modal container over the source card without transition
      this.modalContent.style.transition = 'none';
      this.modalContent.style.transformOrigin = 'top left';
      this.modalContent.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      this.modalContent.style.opacity = '0.7';

      if (this.plateContainer) {
        this.plateContainer.style.opacity = '0';
        this.plateContainer.style.transform = 'translateY(20px)';
      }

      // Force layout reflow
      void this.modalContent.offsetHeight;

      // PLAY: Animate transform to none over 350ms ease-out
      this.modalContent.style.transition = 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease-out';
      this.modalContent.style.transform = 'none';
      this.modalContent.style.opacity = '1';

      if (this.plateContainer) {
        this.plateContainer.style.transition = 'opacity 300ms ease-out 120ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) 120ms';
        this.plateContainer.style.opacity = '1';
        this.plateContainer.style.transform = 'none';
      }

      setTimeout(() => {
        this.isAnimating = false;
      }, 350);
    } else {
      this.isAnimating = false;
    }
  }

  close() {
    if (this.isAnimating || !window.appState || window.appState.activeCarId === null) return;
    this.isAnimating = true;

    const sourceCard = this.activeCardElement || document.querySelector(`.car-card[data-car-id="${window.appState.activeCarId}"]`);

    if (sourceCard && this.modalContent) {
      const sourceRect = sourceCard.getBoundingClientRect();
      const currentRect = this.modalContent.getBoundingClientRect();

      const deltaX = sourceRect.left - currentRect.left;
      const deltaY = sourceRect.top - currentRect.top;
      const scaleX = sourceRect.width / Math.max(currentRect.width, 1);
      const scaleY = sourceRect.height / Math.max(currentRect.height, 1);

      this.modalContent.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease-in';
      this.modalContent.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
      this.modalContent.style.opacity = '0';

      setTimeout(() => {
        this.finishClose();
      }, 300);
    } else {
      this.finishClose();
    }
  }

  finishClose() {
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    document.body.style.overflow = '';

    if (this.modalContent) {
      this.modalContent.style.transform = '';
      this.modalContent.style.transition = '';
      this.modalContent.style.opacity = '';
    }

    if (window.appState) {
      window.appState.activeCarId = null;
    }
    this.activeCardElement = null;
    this.isAnimating = false;
  }

  navigate(direction) {
    if (!window.appState || !window.appState.cars.length) return;
    const cars = window.appState.cars;
    const currentIndex = cars.findIndex(c => c.id === window.appState.activeCarId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = cars.length - 1;
    if (nextIndex >= cars.length) nextIndex = 0;

    const nextCar = cars[nextIndex];
    window.appState.activeCarId = nextCar.id;
    this.activeCardElement = document.querySelector(`.car-card[data-car-id="${nextCar.id}"]`);

    // Smooth switch transition
    if (this.imageContainer && this.plateContainer) {
      this.imageContainer.style.opacity = '0.3';
      this.plateContainer.style.opacity = '0.3';

      setTimeout(() => {
        this.populateModalData(nextCar);
        this.updateNavButtons();
        this.imageContainer.style.opacity = '1';
        this.plateContainer.style.opacity = '1';
      }, 120);
    } else {
      this.populateModalData(nextCar);
      this.updateNavButtons();
    }
  }

  updateNavButtons() {
    if (!window.appState) return;
    const cars = window.appState.cars;
    const currentIndex = cars.findIndex(c => c.id === window.appState.activeCarId);
    const counterElem = document.getElementById('modal-index-counter');
    if (counterElem) {
      counterElem.textContent = `${currentIndex + 1} / ${cars.length}`;
    }
  }

  populateModalData(car) {
    if (this.carImage) {
      this.carImage.src = car.imageData;
      this.carImage.alt = car.name;
    }

    const nameElem = document.getElementById('modal-car-name');
    const brandElem = document.getElementById('modal-car-brand');
    const scaleElem = document.getElementById('modal-car-scale');
    const makerElem = document.getElementById('modal-car-maker');
    const yearElem = document.getElementById('modal-car-year');
    const colorElem = document.getElementById('modal-car-color');
    const notesElem = document.getElementById('modal-car-notes');
    const regSerialElem = document.getElementById('modal-plate-serial');

    if (nameElem) nameElem.textContent = car.name || 'Untitled Specimen';
    if (brandElem) brandElem.textContent = car.brand || 'Unknown Brand';
    if (scaleElem) scaleElem.textContent = car.scale || '1:64';
    if (makerElem) makerElem.textContent = car.maker || 'Archive Collection';
    if (yearElem) yearElem.textContent = car.year || 'N/A';
    if (colorElem) colorElem.textContent = car.color || 'Standard';
    if (notesElem) notesElem.textContent = car.notes || 'No archival field notes recorded for this precision casting.';

    if (regSerialElem) {
      const hash = (car.id || '0000').slice(-6).toUpperCase();
      regSerialElem.textContent = `DIE-${hash}`;
    }
  }
}

// Global modal instance
document.addEventListener('DOMContentLoaded', () => {
  window.flipModal = new FlipModalController();
});
