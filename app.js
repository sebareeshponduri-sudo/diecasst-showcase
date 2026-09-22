/**
 * Diecast Archive - Core Application Logic
 * PRD Specification v2.0 (Clean Architectural Edition)
 */

// Global State
window.appState = {
  cars: [],
  isAdminAuthenticated: false,
  adminPin: '1234',
  isShutterOpen: false,
  activeCarId: null,
  currentScaleFilter: 'All',
  searchQuery: ''
};

// Memory variable for uploaded base64 image
let tempBase64Image = '';

// DOM Elements
let splashScreen, garageShutter, mainContent;
let carsGrid, carCounter, searchInput, scaleFilterButtons;
let adminPanel, adminLoginBtn, adminLogoutBtn, adminStatusBadge, adminToggleBtn;
let loginModal, adminPinInput, loginSubmitBtn, loginCancelBtn, loginAlert;
let carForm, carIdInput, carNameInput, carBrandInput, carScaleInput, carMakerInput, carYearInput, carColorInput, carNotesInput, carImageInput;
let carFormSubmit, carFormCancel, carFormAlert, imagePreview, imagePreviewContainer, removeImageBtn;
let passwordChangeForm, currentPinInput, newPinInput, confirmPinInput, pinFormAlert;

document.addEventListener('DOMContentLoaded', () => {
  initDOMReferences();
  initLocalStorage();
  initShutterEngine();
  initAuthentication();
  initImageProcessor();
  initCrudForm();
  initPasswordChangeForm();
  initSearchAndFilters();
  renderCarGrid();
});

function initDOMReferences() {
  splashScreen = document.getElementById('splash-screen');
  garageShutter = document.getElementById('garage-shutter');
  mainContent = document.getElementById('main-content');

  carsGrid = document.getElementById('cars-grid');
  carCounter = document.getElementById('car-counter');
  searchInput = document.getElementById('search-input');
  scaleFilterButtons = document.querySelectorAll('.scale-filter-btn');

  adminPanel = document.getElementById('admin-panel');
  adminLoginBtn = document.getElementById('admin-login-btn');
  adminLogoutBtn = document.getElementById('admin-logout-btn');
  adminStatusBadge = document.getElementById('admin-status-badge');
  adminToggleBtn = document.getElementById('admin-toggle-btn');

  loginModal = document.getElementById('login-modal');
  adminPinInput = document.getElementById('admin-pin-input');
  loginSubmitBtn = document.getElementById('login-submit-btn');
  loginCancelBtn = document.getElementById('login-cancel-btn');
  loginAlert = document.getElementById('login-alert');

  carForm = document.getElementById('car-form');
  carIdInput = document.getElementById('car-id-input');
  carNameInput = document.getElementById('car-name-input');
  carBrandInput = document.getElementById('car-brand-input');
  carScaleInput = document.getElementById('car-scale-input');
  carMakerInput = document.getElementById('car-maker-input');
  carYearInput = document.getElementById('car-year-input');
  carColorInput = document.getElementById('car-color-input');
  carNotesInput = document.getElementById('car-notes-input');
  carImageInput = document.getElementById('car-image-input');
  carFormSubmit = document.getElementById('car-form-submit');
  carFormCancel = document.getElementById('car-form-cancel');
  carFormAlert = document.getElementById('car-form-alert');
  imagePreview = document.getElementById('image-preview');
  imagePreviewContainer = document.getElementById('image-preview-container');
  removeImageBtn = document.getElementById('remove-image-btn');

  passwordChangeForm = document.getElementById('password-change-form');
  currentPinInput = document.getElementById('current-pin-input');
  newPinInput = document.getElementById('new-pin-input');
  confirmPinInput = document.getElementById('confirm-pin-input');
  pinFormAlert = document.getElementById('pin-form-alert');
}

/* ===================================================================
   1. STATE & LOCALSTORAGE PERSISTENCE
   =================================================================== */

function initLocalStorage() {
  // Load Admin PIN
  const storedPin = localStorage.getItem('diecast_archive_pin');
  if (!storedPin) {
    localStorage.setItem('diecast_archive_pin', '1234');
    window.appState.adminPin = '1234';
  } else {
    window.appState.adminPin = storedPin;
  }

  // Load Cars Array
  const storedCars = localStorage.getItem('diecast_archive_cars');
  if (storedCars) {
    try {
      window.appState.cars = JSON.parse(storedCars);
    } catch (e) {
      console.error('Failed to parse diecast_archive_cars', e);
      loadSeedData();
    }
  } else {
    loadSeedData();
  }
}

function loadSeedData() {
  if (typeof getInitialSeedCars === 'function') {
    window.appState.cars = getInitialSeedCars();
    saveCarsToStorage();
  }
}

function saveCarsToStorage() {
  try {
    localStorage.setItem('diecast_archive_cars', JSON.stringify(window.appState.cars));
  } catch (err) {
    console.warn('LocalStorage quota warning, cars saved in memory', err);
  }
}

/* ===================================================================
   4.1 SPLASH SCREEN & SHUTTER ROLL ENGINE
   =================================================================== */

function initShutterEngine() {
  if (!splashScreen || !garageShutter) return;

  let touchStartY = 0;
  const triggerShutterOpen = () => {
    if (window.appState.isShutterOpen) return;
    window.appState.isShutterOpen = true;

    // Execute CSS transition: translate -100% over 0.8s
    garageShutter.style.transform = 'translateY(-100%)';

    setTimeout(() => {
      splashScreen.style.pointerEvents = 'none';
      splashScreen.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 800);
  };

  // Click anywhere on splash screen / shutter
  splashScreen.addEventListener('click', triggerShutterOpen);

  // Wheel listener
  window.addEventListener('wheel', (e) => {
    if (!window.appState.isShutterOpen && e.deltaY > 0) {
      triggerShutterOpen();
    }
  }, { passive: true });

  // Touch listener
  window.addEventListener('touchstart', (e) => {
    if (!window.appState.isShutterOpen && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!window.appState.isShutterOpen && e.touches.length > 0) {
      const touchEndY = e.touches[0].clientY;
      if (touchStartY - touchEndY > 20) {
        triggerShutterOpen();
      }
    }
  }, { passive: true });

  // Keyboard shortcut (Space, Enter, Down Arrow)
  window.addEventListener('keydown', (e) => {
    if (!window.appState.isShutterOpen && (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown')) {
      triggerShutterOpen();
    }
  });
}

/* ===================================================================
   2. AUTHENTICATION & ADMIN SECURITY MODULE
   =================================================================== */

function initAuthentication() {
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      openLoginModal();
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      logoutAdmin();
    });
  }

  if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', () => {
      if (adminPanel) {
        adminPanel.classList.toggle('hidden');
        adminPanel.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', handleAdminLogin);
  }

  if (loginCancelBtn) {
    loginCancelBtn.addEventListener('click', closeLoginModal);
  }

  if (adminPinInput) {
    adminPinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdminLogin();
      if (e.key === 'Escape') closeLoginModal();
    });
  }
}

function openLoginModal() {
  if (!loginModal) return;
  loginModal.classList.remove('hidden');
  loginModal.classList.add('flex');
  if (loginAlert) loginAlert.classList.add('hidden');
  if (adminPinInput) {
    adminPinInput.value = '';
    setTimeout(() => adminPinInput.focus(), 50);
  }
}

function closeLoginModal() {
  if (!loginModal) return;
  loginModal.classList.add('hidden');
  loginModal.classList.remove('flex');
}

function handleAdminLogin() {
  const inputPin = (adminPinInput ? adminPinInput.value : '').trim();
  const activeStoredPin = localStorage.getItem('diecast_archive_pin') || '1234';

  if (inputPin === activeStoredPin) {
    window.appState.isAdminAuthenticated = true;
    closeLoginModal();
    updateAdminUI();
    renderCarGrid();
    showToast('Admin access unlocked successfully', 'success');
  } else {
    if (loginAlert) {
      loginAlert.textContent = 'Invalid Passcode';
      loginAlert.classList.remove('hidden');
    } else {
      alert('Invalid Passcode');
    }
  }
}

function logoutAdmin() {
  window.appState.isAdminAuthenticated = false;
  updateAdminUI();
  renderCarGrid();
  showToast('Admin session ended', 'info');
}

function updateAdminUI() {
  const isAuth = window.appState.isAdminAuthenticated;

  if (adminPanel) {
    if (isAuth) {
      adminPanel.classList.remove('hidden');
    } else {
      adminPanel.classList.add('hidden');
    }
  }

  if (adminLoginBtn) {
    if (isAuth) adminLoginBtn.classList.add('hidden');
    else adminLoginBtn.classList.remove('hidden');
  }

  if (adminStatusBadge) {
    if (isAuth) adminStatusBadge.classList.remove('hidden');
    else adminStatusBadge.classList.add('hidden');
  }

  if (adminLogoutBtn) {
    if (isAuth) adminLogoutBtn.classList.remove('hidden');
    else adminLogoutBtn.classList.add('hidden');
  }

  if (adminToggleBtn) {
    if (isAuth) adminToggleBtn.classList.remove('hidden');
    else adminToggleBtn.classList.add('hidden');
  }
}

/* ===================================================================
   2.2 PASSWORD CHANGE LOGIC
   =================================================================== */

function initPasswordChangeForm() {
  if (!passwordChangeForm) return;

  passwordChangeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentPin = currentPinInput ? currentPinInput.value.trim() : '';
    const newPin = newPinInput ? newPinInput.value.trim() : '';
    const confirmPin = confirmPinInput ? confirmPinInput.value.trim() : '';
    const activeStoredPin = localStorage.getItem('diecast_archive_pin') || '1234';

    // Validation 1: currentPin === activeStoredPin
    if (currentPin !== activeStoredPin) {
      showPinAlert('Current passcode incorrect.', 'error');
      return;
    }

    // Validation 2: newPin === confirmPin
    if (newPin !== confirmPin) {
      showPinAlert('New passcodes do not match.', 'error');
      return;
    }

    // Validation 3: newPin.length >= 4
    if (newPin.length < 4) {
      showPinAlert('Passcode must be at least 4 digits.', 'error');
      return;
    }

    // Save newPinInput to localStorage
    localStorage.setItem('diecast_archive_pin', newPin);
    window.appState.adminPin = newPin;

    passwordChangeForm.reset();
    showPinAlert('Admin passcode updated successfully!', 'success');
    showToast('Passcode updated successfully', 'success');
  });
}

function showPinAlert(msg, type) {
  if (!pinFormAlert) {
    alert(msg);
    return;
  }
  pinFormAlert.textContent = msg;
  pinFormAlert.className = `p-3.5 rounded-xl text-sm font-semibold mb-4 ${
    type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  }`;
  pinFormAlert.classList.remove('hidden');

  setTimeout(() => {
    pinFormAlert.classList.add('hidden');
  }, 4000);
}

/* ===================================================================
   4.3 IMAGE PROCESSING ENGINE (ADMIN INPUT)
   =================================================================== */

function initImageProcessor() {
  if (!carImageInput) return;

  carImageInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Strict validation: Reject if not image/jpeg or image/png
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      showCarFormAlert('Invalid format. Only .jpg, .jpeg, and .png are supported.', 'error');
      carImageInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      tempBase64Image = event.target.result;
      if (imagePreview) {
        imagePreview.src = tempBase64Image;
      }
      if (imagePreviewContainer) {
        imagePreviewContainer.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(file);
  });

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      tempBase64Image = '';
      if (carImageInput) carImageInput.value = '';
      if (imagePreview) imagePreview.src = '';
      if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
    });
  }
}

/* ===================================================================
   5. CRUD OPERATIONS (CREATE / UPDATE / DELETE)
   =================================================================== */

function initCrudForm() {
  if (!carForm) return;

  carForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = carIdInput ? carIdInput.value.trim() : '';
    const name = carNameInput ? carNameInput.value.trim() : '';
    const brand = carBrandInput ? carBrandInput.value.trim() : '';
    const scale = carScaleInput ? carScaleInput.value : '1:64';
    const maker = carMakerInput ? carMakerInput.value.trim() : '';
    const year = carYearInput ? carYearInput.value.trim() : '';
    const color = carColorInput ? carColorInput.value.trim() : '';
    const notes = carNotesInput ? carNotesInput.value.trim() : '';
    const imageData = tempBase64Image;

    // Validate Required Fields: name, brand, scale, imageData
    if (!name || !brand || !scale || !imageData) {
      let missing = [];
      if (!name) missing.push('Model Name');
      if (!brand) missing.push('Brand');
      if (!scale) missing.push('Scale');
      if (!imageData) missing.push('Photo/Image');
      showCarFormAlert(`Missing required field(s): ${missing.join(', ')}`, 'error');
      return;
    }

    if (!id) {
      // CREATE OPERATION
      const newCar = {
        id: Date.now().toString(),
        name,
        brand,
        scale,
        maker,
        year,
        color,
        imageData,
        notes,
        createdAt: Date.now()
      };
      window.appState.cars.unshift(newCar);
      showToast(`Specimen '${name}' cataloged to archive!`, 'success');
    } else {
      // UPDATE OPERATION
      const index = window.appState.cars.findIndex(c => c.id === id);
      if (index !== -1) {
        window.appState.cars[index] = {
          ...window.appState.cars[index],
          name,
          brand,
          scale,
          maker,
          year,
          color,
          notes,
          imageData
        };
        showToast(`Specimen '${name}' updated successfully!`, 'success');
      }
    }

    // Persist to localStorage & Re-render
    saveCarsToStorage();
    renderCarGrid();
    resetCarForm();
  });

  if (carFormCancel) {
    carFormCancel.addEventListener('click', resetCarForm);
  }
}

function resetCarForm() {
  if (carForm) carForm.reset();
  if (carIdInput) carIdInput.value = '';
  tempBase64Image = '';
  if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
  if (imagePreview) imagePreview.src = '';
  if (carFormSubmit) {
    carFormSubmit.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
      Add Specimen to Archive
    `;
  }
  if (carFormCancel) carFormCancel.classList.add('hidden');
  if (carFormAlert) carFormAlert.classList.add('hidden');
}

function startEditCar(carId) {
  const car = window.appState.cars.find(c => c.id === carId);
  if (!car) return;

  if (carIdInput) carIdInput.value = car.id;
  if (carNameInput) carNameInput.value = car.name;
  if (carBrandInput) carBrandInput.value = car.brand;
  if (carScaleInput) carScaleInput.value = car.scale;
  if (carMakerInput) carMakerInput.value = car.maker || '';
  if (carYearInput) carYearInput.value = car.year || '';
  if (carColorInput) carColorInput.value = car.color || '';
  if (carNotesInput) carNotesInput.value = car.notes || '';

  tempBase64Image = car.imageData;
  if (imagePreview) imagePreview.src = car.imageData;
  if (imagePreviewContainer) imagePreviewContainer.classList.remove('hidden');

  if (carFormSubmit) {
    carFormSubmit.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      Save Specimen Changes
    `;
  }
  if (carFormCancel) carFormCancel.classList.remove('hidden');

  if (adminPanel) {
    adminPanel.classList.remove('hidden');
    adminPanel.scrollIntoView({ behavior: 'smooth' });
  }
}

function deleteCar(targetId) {
  if (!window.appState.isAdminAuthenticated) return;
  const car = window.appState.cars.find(c => c.id === targetId);
  const name = car ? car.name : 'this model';

  const confirmed = window.confirm(`Delete "${name}" permanently?`);
  if (!confirmed) return;

  window.appState.cars = window.appState.cars.filter(c => c.id !== targetId);
  saveCarsToStorage();
  renderCarGrid();
  showToast(`Specimen deleted from archive`, 'info');
}

function showCarFormAlert(msg, type) {
  if (!carFormAlert) {
    alert(msg);
    return;
  }
  carFormAlert.textContent = msg;
  carFormAlert.className = `p-3.5 rounded-xl text-sm font-semibold mb-4 ${
    type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  }`;
  carFormAlert.classList.remove('hidden');
}

/* ===================================================================
   5.3 PUBLIC SEARCH & FILTER ENGINE
   =================================================================== */

function initSearchAndFilters() {
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      window.appState.searchQuery = searchInput.value.toLowerCase().trim();
      renderCarGrid();
    });
  }

  scaleFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scaleFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.appState.currentScaleFilter = btn.dataset.scale || 'All';
      renderCarGrid();
    });
  });
}

function getFilteredCars() {
  const q = window.appState.searchQuery;
  const scale = window.appState.currentScaleFilter;

  return window.appState.cars.filter(car => {
    const matchesSearch = !q || 
      (car.name && car.name.toLowerCase().includes(q)) ||
      (car.brand && car.brand.toLowerCase().includes(q)) ||
      (car.maker && car.maker.toLowerCase().includes(q)) ||
      (car.color && car.color.toLowerCase().includes(q));

    const matchesScale = scale === 'All' || car.scale === scale;

    return matchesSearch && matchesScale;
  });
}

/* ===================================================================
   GRID VIEW RENDERER (Clean High-Contrast Precision)
   =================================================================== */

function renderCarGrid() {
  if (!carsGrid) return;
  const filteredCars = getFilteredCars();

  if (carCounter) {
    carCounter.textContent = filteredCars.length;
  }

  const emptyMsg = document.getElementById('empty-grid-msg');

  if (filteredCars.length === 0) {
    carsGrid.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    return;
  }

  if (emptyMsg) emptyMsg.classList.add('hidden');

  const isAdmin = window.appState.isAdminAuthenticated;

  carsGrid.innerHTML = filteredCars.map(car => `
    <article 
      class="car-card glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col relative"
      data-car-id="${car.id}"
    >
      <!-- Scale Pill & Brand Badge -->
      <div class="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none">
        <span class="scale-badge">${escapeHtml(car.scale)}</span>
        <span class="bg-[#0f141c]/90 text-xs md:text-sm font-bold text-slate-200 px-2.5 py-1 rounded-md border border-slate-700/60">
          ${escapeHtml(car.brand)}
        </span>
      </div>

      <!-- Admin Actions Overlay -->
      ${isAdmin ? `
        <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-[#0f141c]/95 p-1.5 rounded-xl border border-slate-700 shadow-xl">
          <button 
            type="button" 
            class="admin-edit-btn p-2 text-cyan-300 hover:text-white hover:bg-cyan-950/80 rounded-lg transition-colors"
            data-id="${car.id}" 
            title="Edit Specimen"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button 
            type="button" 
            class="admin-delete-btn p-2 text-rose-400 hover:text-white hover:bg-rose-950/80 rounded-lg transition-colors"
            data-id="${car.id}" 
            title="Delete Specimen"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      ` : ''}

      <!-- Specimen Visual -->
      <div class="h-60 bg-gradient-to-b from-[#18212e] to-[#0d121a] flex items-center justify-center p-5 relative overflow-hidden">
        <img 
          src="${car.imageData}" 
          alt="${escapeHtml(car.name)}"
          class="w-full h-full object-contain filter drop-shadow-md transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <!-- Card Metadata Footer (Enlarged font size, clean text) -->
      <div class="p-5 flex-1 flex flex-col justify-between border-t border-slate-800/80">
        <div>
          <div class="flex items-center justify-between text-xs md:text-sm text-slate-400 mb-1.5">
            <span class="font-semibold text-slate-300">${escapeHtml(car.maker || 'Precision Diecast')}</span>
            <span class="font-mono-num font-medium">${escapeHtml(car.year || '')}</span>
          </div>
          <h3 class="text-lg md:text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 font-tech">
            ${escapeHtml(car.name)}
          </h3>
          ${car.color ? `
            <p class="text-xs md:text-sm text-slate-400 mt-1.5 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
              ${escapeHtml(car.color)}
            </p>
          ` : ''}
        </div>

        <div class="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs md:text-sm text-slate-400">
          <span class="font-mono-num text-xs text-slate-500 font-semibold">ID: ${(car.id || '').slice(-6).toUpperCase()}</span>
          <span class="text-cyan-300 group-hover:translate-x-1 transition-transform flex items-center gap-1.5 font-bold">
            Inspect Plate
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </article>
  `).join('');

  // Attach card click handlers
  document.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.admin-edit-btn') || e.target.closest('.admin-delete-btn')) {
        return;
      }
      const carId = card.dataset.carId;
      if (window.flipModal) {
        window.flipModal.open(carId, card);
      }
    });
  });

  // Attach admin action buttons
  document.querySelectorAll('.admin-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      startEditCar(btn.dataset.id);
    });
  });

  document.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCar(btn.dataset.id);
    });
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `p-4 px-6 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${
    type === 'success' ? 'bg-cyan-500 text-slate-950' :
    type === 'error' ? 'bg-rose-500 text-white' :
    'bg-slate-800 text-slate-100 border border-slate-700'
  }`;

  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
