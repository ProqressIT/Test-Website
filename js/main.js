/* ============================================================
   ProqressIT — main.js
   Navigation, active links, contact form
   ============================================================ */

(function () {
    'use strict';

    /* ---- Elements ---- */
    const header     = document.getElementById('site-header');
    const navToggle  = document.getElementById('nav-toggle');
    const navMenu    = document.getElementById('nav-menu');
    const navLinks   = document.querySelectorAll('.nav-link:not(.nav-link--cta)');
    const footerYear = document.getElementById('footer-year');
    const form       = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const resetBtn   = document.getElementById('reset-form');

    /* ============================================================
       FOOTER YEAR
       ============================================================ */
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    /* ============================================================
       HEADER — scroll shadow
       ============================================================ */
    function onScroll() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ============================================================
       MOBILE NAV TOGGLE
       ============================================================ */
    function openNav() {
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Menu sluiten');
        navMenu.classList.add('is-open');
    }

    function closeNav() {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menu openen');
        navMenu.classList.remove('is-open');
    }

    navToggle.addEventListener('click', function () {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeNav() : openNav();
    });

    /* Close nav when any link inside it is clicked */
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeNav);
    });

    /* Close nav when clicking outside the header */
    document.addEventListener('click', function (e) {
        if (navMenu.classList.contains('is-open') && !header.contains(e.target)) {
            closeNav();
        }
    });

    /* Close nav on Escape key */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
            closeNav();
            navToggle.focus();
        }
    });

    /* ============================================================
       ACTIVE NAV LINK — IntersectionObserver
       ============================================================ */
    var navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
    ) || 72;

    var observerOptions = {
        root: null,
        /* Trigger when the section crosses just below the nav */
        rootMargin: '-' + navHeight + 'px 0px -55% 0px',
        threshold: 0
    };

    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (link) {
                    var href = link.getAttribute('href');
                    link.classList.toggle('is-active', href === '#' + entry.target.id);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('section[id]').forEach(function (section) {
        sectionObserver.observe(section);
    });

    /* ============================================================
       CONTACT FORM — accessible validation
       ============================================================ */
    if (!form) return;

    /**
     * Returns an error message string for a given input,
     * or an empty string if the value is valid.
     */
    function getErrorMessage(input) {
        var labelEl = document.querySelector('label[for="' + input.id + '"]');
        var labelText = labelEl
            ? labelEl.textContent.replace('*', '').replace('(optioneel)', '').trim()
            : input.name;

        if (input.required && !input.value.trim()) {
            return labelText + ' is verplicht.';
        }

        if (input.type === 'email' && input.value.trim()) {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                return 'Vul een geldig e-mailadres in.';
            }
        }

        return '';
    }

    /**
     * Validates a single field and updates ARIA/error state.
     * Returns true when valid.
     */
    function validateField(input) {
        var errorEl = document.getElementById(input.id + '-error');
        if (!errorEl) return true; // no error element = no validation needed

        var message = getErrorMessage(input);

        if (message) {
            errorEl.textContent = message;
            input.setAttribute('aria-invalid', 'true');
            return false;
        } else {
            errorEl.textContent = '';
            input.removeAttribute('aria-invalid');
            return true;
        }
    }

    /* Validate on blur; re-validate on input if already invalid */
    form.querySelectorAll('.form-input').forEach(function (input) {
        input.addEventListener('blur', function () {
            validateField(input);
        });

        input.addEventListener('input', function () {
            if (input.hasAttribute('aria-invalid')) {
                validateField(input);
            }
        });
    });

    /* Form submit */
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var inputs = form.querySelectorAll('.form-input');
        var isValid = true;
        var firstInvalid = null;

        inputs.forEach(function (input) {
            if (!validateField(input)) {
                isValid = false;
                if (!firstInvalid) firstInvalid = input;
            }
        });

        if (!isValid) {
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        /* Show success panel */
        form.hidden = true;
        formSuccess.hidden = false;
        formSuccess.focus();
    });

    /* Reset form — go back to empty form */
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.reset();

            /* Clear validation state */
            form.querySelectorAll('.form-input').forEach(function (input) {
                input.removeAttribute('aria-invalid');
            });
            form.querySelectorAll('.form-error').forEach(function (el) {
                el.textContent = '';
            });

            formSuccess.hidden = true;
            form.hidden = false;

            var firstInput = form.querySelector('.form-input');
            if (firstInput) firstInput.focus();
        });
    }

}());
