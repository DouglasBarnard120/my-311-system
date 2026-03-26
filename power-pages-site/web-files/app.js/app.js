/**
 * 311 Citizen Services Portal – main application script
 */
(function () {
  'use strict';

  /* ======================================================
     Utility helpers
     ====================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Show a lightweight toast notification */
  function showToast(message, type = 'info', duration = 4000) {
    let container = $('#toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all .3s ease';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  /* ======================================================
     Navigation – active link + mobile hamburger
     ====================================================== */
  function initNav() {
    const toggle = $('.menu-toggle');
    const navList = $('nav ul');

    if (toggle && navList) {
      toggle.addEventListener('click', () => {
        const open = navList.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      // close on outside click
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navList.contains(e.target)) {
          navList.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Mark current page link active
    const current = location.pathname.split('/').pop() || 'index.html';
    $$('nav a').forEach((a) => {
      if (a.getAttribute('href') === current) a.classList.add('active');
    });
  }

  /* ======================================================
     Service-request form (submit-request.html)
     ====================================================== */
  function initSubmitForm() {
    const form = $('#submit-request-form');
    if (!form) return;

    const successPanel = $('#form-success');

    // Character counter for description
    const desc = $('#description');
    const counter = $('#desc-counter');
    if (desc && counter) {
      desc.addEventListener('input', () => {
        counter.textContent = desc.value.length;
      });
    }

    // Location auto-fill via Geolocation API
    const locBtn = $('#use-location');
    if (locBtn) {
      locBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          showToast('Geolocation is not supported by your browser.', 'error');
          return;
        }
        locBtn.textContent = '📍 Detecting…';
        locBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lon = pos.coords.longitude.toFixed(6);
            const addrField = $('#location-address');
            if (addrField && !addrField.value) {
              addrField.value = `Near coordinates: ${lat}, ${lon}`;
            }
            $('#location-lat') && ($('#location-lat').value = lat);
            $('#location-lon') && ($('#location-lon').value = lon);
            locBtn.textContent = '📍 Location detected';
            showToast('Location detected successfully!', 'success');
          },
          () => {
            locBtn.textContent = '📍 Use My Location';
            locBtn.disabled = false;
            showToast('Could not detect location. Please enter your address manually.', 'warning');
          }
        );
      });
    }

    // Category → request type dependency
    const catSelect = $('#category');
    const typeSelect = $('#request-type');
    const typeMap = {
      roads: ['Pothole', 'Street Light', 'Road Damage', 'Sign Issue'],
      sanitation: ['Missed Pickup', 'Illegal Dumping', 'Recycling Issue', 'Bulk Item'],
      parks: ['Park Maintenance', 'Equipment Damage', 'Graffiti – Parks', 'Tree Issue'],
      noise: ['Loud Music', 'Construction Noise', 'Animal Noise', 'Vehicle Noise'],
      utilities: ['Water Leak', 'Sewer Issue', 'Street Flooding', 'Power Issue'],
      other: ['General Inquiry', 'Complaint', 'Compliment', 'Other'],
    };
    if (catSelect && typeSelect) {
      catSelect.addEventListener('change', () => {
        const types = typeMap[catSelect.value] || [];
        typeSelect.innerHTML = '<option value="">Select type…</option>';
        types.forEach((t) => {
          const opt = document.createElement('option');
          opt.value = t.toLowerCase().replace(/\s+/g, '-');
          opt.textContent = t;
          typeSelect.appendChild(opt);
        });
        typeSelect.disabled = types.length === 0;
      });
    }

    // Simple client-side validation
    function validateForm() {
      let valid = true;
      const required = $$('[required]', form);
      required.forEach((el) => {
        const group = el.closest('.form-group');
        if (!el.value.trim()) {
          group && group.classList.add('has-error');
          valid = false;
        } else {
          group && group.classList.remove('has-error');
        }
      });
      // Email format
      const emailEl = $('#contact-email');
      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        emailEl.closest('.form-group') && emailEl.closest('.form-group').classList.add('has-error');
        valid = false;
      }
      return valid;
    }

    // Clear error on input
    $$('[required]', form).forEach((el) => {
      el.addEventListener('input', () => {
        el.closest('.form-group') && el.closest('.form-group').classList.remove('has-error');
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm()) {
        showToast('Please fill in all required fields.', 'error');
        const firstErr = $('.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea', form);
        if (firstErr) firstErr.focus();
        return;
      }

      // Simulate submission (replace with real API call)
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Submitting…';

      setTimeout(() => {
        const refNum = 'SR-' + String(Math.floor(Math.random() * 90000) + 10000);
        form.style.display = 'none';
        if (successPanel) {
          successPanel.classList.remove('hidden');
          const refEl = $('#confirmation-number');
          if (refEl) refEl.textContent = refNum;
        }
        showToast('Request submitted successfully! Reference: ' + refNum, 'success', 6000);
        // Store in localStorage for demo tracking
        const requests = JSON.parse(localStorage.getItem('311_requests') || '[]');
        requests.push({
          ref: refNum,
          title: $('#request-title') ? $('#request-title').value : 'Request',
          category: catSelect ? catSelect.options[catSelect.selectedIndex].text : '',
          status: 'New',
          date: new Date().toLocaleDateString(),
        });
        localStorage.setItem('311_requests', JSON.stringify(requests));
      }, 1200);
    });
  }

  /* ======================================================
     Request tracker (track-request.html)
     ====================================================== */
  function initTracker() {
    const trackForm = $('#tracker-form');
    if (!trackForm) return;

    const resultPanel = $('.tracker-result');

    // Demo data keyed by reference number prefix
    const demoStatuses = {
      default: {
        title: 'Pothole on Main Street',
        category: 'Roads & Sidewalks',
        status: 'In Progress',
        statusClass: 'badge-progress',
        step: 2,
        submitted: 'March 20, 2026',
        updated: 'March 24, 2026',
        department: 'Department of Public Works',
        worker: 'Field Crew #4',
        notes: 'Crew scheduled for repair. Materials on order.',
        eta: 'March 28, 2026',
      },
    };

    // Load any locally-stored requests
    function getLocalRequest(ref) {
      const requests = JSON.parse(localStorage.getItem('311_requests') || '[]');
      return requests.find((r) => r.ref === ref);
    }

    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refInput = $('#track-ref');
      if (!refInput || !refInput.value.trim()) {
        showToast('Please enter a reference number.', 'error');
        return;
      }
      const ref = refInput.value.trim().toUpperCase();
      if (!/^SR-\d{5}$/.test(ref)) {
        showToast('Invalid format. Use SR-XXXXX (e.g. SR-12345)', 'error');
        return;
      }

      const local = getLocalRequest(ref);
      const data = local
        ? {
            title: local.title,
            category: local.category,
            status: local.status,
            statusClass: 'badge-new',
            step: 0,
            submitted: local.date,
            updated: local.date,
            department: 'Pending assignment',
            worker: '—',
            notes: 'Your request has been received and is pending review.',
            eta: 'TBD',
          }
        : demoStatuses.default;

      // Populate result panel
      const statusSteps = ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
      if (resultPanel) {
        $('#result-ref', resultPanel).textContent = ref;
        $('#result-title', resultPanel).textContent = data.title;
        $('#result-category', resultPanel).textContent = data.category;
        $('#result-status', resultPanel).textContent = data.status;
        $('#result-status', resultPanel).className = 'badge ' + data.statusClass;
        $('#result-submitted', resultPanel).textContent = data.submitted;
        $('#result-updated', resultPanel).textContent = data.updated;
        $('#result-dept', resultPanel).textContent = data.department;
        $('#result-worker', resultPanel).textContent = data.worker;
        $('#result-notes', resultPanel).textContent = data.notes;
        $('#result-eta', resultPanel).textContent = data.eta;

        // Progress steps
        $$('.progress-step', resultPanel).forEach((step, idx) => {
          step.classList.remove('done', 'active');
          if (idx < data.step) step.classList.add('done');
          if (idx === data.step) step.classList.add('active');
        });

        resultPanel.classList.add('visible');
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ======================================================
     My Requests dashboard (my-requests.html)
     ====================================================== */
  function initMyRequests() {
    const grid = $('#my-requests-grid');
    if (!grid) return;

    const stored = JSON.parse(localStorage.getItem('311_requests') || '[]');
    if (stored.length === 0) {
      grid.innerHTML = `<div class="card text-center" style="grid-column:1/-1;padding:3rem">
        <p style="font-size:2.5rem;margin-bottom:.75rem">📋</p>
        <h3>No requests yet</h3>
        <p style="color:var(--muted);margin:.5rem 0 1.25rem">You haven't submitted any service requests yet.</p>
        <a href="submit-request.html" class="btn btn-primary">Submit a Request</a>
      </div>`;
      return;
    }

    grid.innerHTML = stored
      .slice()
      .reverse()
      .map(
        (r) => `
      <div class="card">
        <div class="d-flex align-center flex-wrap gap-1 mb-2" style="justify-content:space-between">
          <code style="font-size:.85rem;color:var(--muted)">${r.ref}</code>
          <span class="badge badge-new">${r.status}</span>
        </div>
        <h3 style="margin-bottom:.3rem;font-size:1rem">${r.title}</h3>
        <p style="font-size:.88rem;color:var(--muted);margin-bottom:1rem">${r.category} · ${r.date}</p>
        <a href="track-request.html?ref=${r.ref}" class="btn btn-outline btn-sm">Track Status →</a>
      </div>`
      )
      .join('');
  }

  /* ======================================================
     Knowledge base search (knowledge-base.html)
     ====================================================== */
  function initKnowledgeBase() {
    const searchInput = $('#kb-search');
    const articleCards = $$('.kb-article');
    if (!searchInput || articleCards.length === 0) return;

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      let visible = 0;
      articleCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      const noResults = $('#kb-no-results');
      if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
    });

    // Accordion FAQ
    $$('.accordion-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        // close others
        $$('.accordion-btn').forEach((b) => {
          b.setAttribute('aria-expanded', 'false');
          const body = $('#' + b.getAttribute('aria-controls'));
          if (body) body.style.maxHeight = '0';
        });
        if (!expanded) {
          btn.setAttribute('aria-expanded', 'true');
          const body = $('#' + btn.getAttribute('aria-controls'));
          if (body) body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  /* ======================================================
     Auto-fill tracker ref from URL param
     ====================================================== */
  function autoFillTrackerRef() {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      const field = $('#track-ref');
      if (field) {
        field.value = ref;
        const form = $('#tracker-form');
        if (form) form.dispatchEvent(new Event('submit'));
      }
    }
  }

  /* ======================================================
     Home page – category quick-select
     ====================================================== */
  function initHome() {
    $$('.service-card[data-category]').forEach((card) => {
      card.addEventListener('click', () => {
        const cat = card.dataset.category;
        location.href = `submit-request.html?category=${cat}`;
      });
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') card.click();
      });
    });

    // Pre-select category from URL on submit form
    const params = new URLSearchParams(location.search);
    const precat = params.get('category');
    if (precat) {
      const catSel = $('#category');
      if (catSel) {
        catSel.value = precat;
        catSel.dispatchEvent(new Event('change'));
      }
    }
  }

  /* ======================================================
     Boot
     ====================================================== */
  function init() {
    initNav();
    initHome();
    initSubmitForm();
    initTracker();
    autoFillTrackerRef();
    initMyRequests();
    initKnowledgeBase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
