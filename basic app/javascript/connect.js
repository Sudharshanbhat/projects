document.addEventListener('DOMContentLoaded', function () {
    // Login form handler (demo credentials)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const errorEl = document.getElementById('error');
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = (document.getElementById('email') || {}).value || '';
            const pass = (document.getElementById('password') || {}).value || '';
            if (email.trim().toLowerCase() === 'user@example.com' && pass === 'password123') {
                window.location.href = 'basicapp.html';
            } else {
                if (errorEl) errorEl.style.display = 'block';
            }
        });
    }

    // Contact form handler (demo)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const sentEl = document.getElementById('sent');
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // In a real app you'd POST this to a server. Here we just show a demo confirmation.
            if (sentEl) sentEl.style.display = 'block';
            contactForm.reset();
        });
    }

    // Add event listeners for any element with data-contact attribute to navigate to contact page
    document.querySelectorAll('[data-contact]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            // If it's a link, let the default behavior occur
            if (el.tagName.toLowerCase() === 'a' && el.getAttribute('href')) return;
            window.location.href = 'contact.html';
        });
    });
});
