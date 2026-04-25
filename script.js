
// Smooth Scroll to Section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function requireAuthAndGo(targetPath) {
    const token = localStorage.getItem('cyberaware_token');
    if (token) {
        window.location.href = targetPath;
        return;
    }

    localStorage.setItem('cyberaware_post_auth_redirect', targetPath);
    window.location.href = 'auth.html';
}

(function initAuthButtonsVisibility() {
    const token = localStorage.getItem('cyberaware_token');
    if (!token) return;

    const headerRight = document.querySelector('.header-right');
    const loginButtons = document.querySelectorAll('[data-i18n="btn_login"]');
    const registerButtons = document.querySelectorAll('[data-i18n="btn_register"]');

    [...loginButtons, ...registerButtons].forEach((button) => {
        button.style.display = 'none';
    });

    if (!headerRight || document.getElementById('logout-btn')) return;

    const logoutButton = document.createElement('button');
    logoutButton.id = 'logout-btn';
    logoutButton.type = 'button';
    logoutButton.className = 'btn btn-secondary';
    logoutButton.setAttribute('data-i18n', 'btn_logout');
    logoutButton.textContent = 'Выйти';
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('cyberaware_token');
        localStorage.removeItem('cyberaware_post_auth_redirect');
        window.location.href = 'index.html';
    });

    headerRight.appendChild(logoutButton);
})();

// Navigation Logic
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.page-section');

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            scrollToSection(targetId);
        }
    });
});

// =====================
// PROFILE DRAWER MENU
// =====================
(function initProfileDrawer() {
    const drawer = document.querySelector('[data-profile-drawer]');
    const overlay = document.querySelector('[data-drawer-overlay]');
    const openBtn = document.querySelector('[data-drawer-open]');
    const closeBtn = document.querySelector('[data-drawer-close]');

    if (!drawer || !overlay || !openBtn || !closeBtn) return;

    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('drawer-open');
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('drawer-open');
    }

    openBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDrawer();
        }
    });
})();

// =====================
// SCROLL PROGRESS BAR
// =====================
function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const bar = document.querySelector('.scroll-progress-bar');
    if (bar) {
        bar.style.width = scrolled + '%';
    }
}
window.addEventListener('scroll', updateScrollProgress);

// =====================
// PARTICLES CANVAS
// =====================
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 168, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 168, 255, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        animationId = requestAnimationFrame(animate);
    }
    animate();
})();

// =====================
// ANIMATED COUNTERS
// =====================
(function initCounters() {
    const counters = document.querySelectorAll('.stat-card h4');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const num = parseFloat(text);
                const suffix = text.replace(/[0-9.]/g, '');
                if (!isNaN(num)) {
                    let current = 0;
                    const step = num / 50;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= num) {
                            el.textContent = text;
                            clearInterval(timer);
                        } else {
                            el.textContent = Math.floor(current) + suffix;
                        }
                    }, 30);
                }
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
})();

// =====================
// SCROLL REVEAL ANIMATIONS
// =====================
(function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.feature-card, .teach-card, .benefit-item, .section-header, .stat-card'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });
})();

// =====================
// PARALLAX HERO BACKGROUND
// =====================
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = (scrolled * 0.4) + 'px';
});

// Learning Modules Logic
const modal = document.getElementById('module-modal');
const closeModal = document.querySelector('.close-modal');
const moduleBody = document.getElementById('module-body');

const moduleContent = {
    basics: `
        <h2>Basics of Cybersecurity</h2>
        <p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.</p>
        <ul>
            <li><strong>Confidentiality:</strong> Only authorized users can access the data.</li>
            <li><strong>Integrity:</strong> Data is accurate and hasn't been tampered with.</li>
            <li><strong>Availability:</strong> Systems are accessible when needed.</li>
        </ul>
    `,
    phishing: `
        <h2>Phishing Attacks</h2>
        <p>Phishing is a type of social engineering where an attacker sends a fraudulent message designed to trick a person into revealing sensitive information or to deploy malicious software on the victim's infrastructure, such as ransomware.</p>
        <p>Common signs of phishing:</p>
        <ul>
            <li>Generic greetings like "Dear Valued Customer".</li>
            <li>Sense of urgency or threats.</li>
            <li>Mismatched sender email addresses.</li>
            <li>Suspicious links or unexpected attachments.</li>
        </ul>
    `,
    passwords: `
        <h2>Password Security</h2>
        <p>Strong passwords are your first line of defense. A weak password can be cracked in seconds using "brute force" attacks.</p>
        <ul>
            <li>Use at least 12 characters.</li>
            <li>Mix uppercase, lowercase, numbers, and symbols.</li>
            <li>Avoid personal information like birthdays.</li>
            <li><strong>2FA:</strong> Enable Multi-Factor Authentication everywhere!</li>
        </ul>
    `,
    data: `
        <h2>Data Protection</h2>
        <p>Your digital footprint is everywhere. Protecting your personal data means being careful about what you share online.</p>
        <ul>
            <li>Check your social media privacy settings.</li>
            <li>Be wary of "over-sharing" locations or personal details.</li>
            <li>Understand how companies use your data (Privacy Policies).</li>
            <li>Use encrypted messaging apps like Signal or WhatsApp.</li>
        </ul>
    `
};

function openModule(moduleId) {
    if (!moduleBody || !modal) return;
    moduleBody.innerHTML = moduleContent[moduleId];
    modal.style.display = 'block';
}

if (closeModal && modal) {
    closeModal.onclick = () => modal.style.display = 'none';
}
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Phishing Game Logic
const phishingEmails = [
    { sender: 'admin@amaz0n-support.com', subject: 'Urgent: Account Locked', body: 'Click here to verify your identity now!', isPhishing: true },
    { sender: 'support@bank.com', subject: 'Monthly Statement', body: 'Your monthly statement is ready for viewing in the portal.', isPhishing: false },
    { sender: 'hr@yourcompany.co', subject: 'New Benefits Policy', body: 'Please review the attached PDF for 2026 benefits updates.', isPhishing: false },
    { sender: 'no-reply@netfIix-billing.net', subject: 'Payment Failed', body: 'Update your credit card info to keep watching.', isPhishing: true }
];

let currentEmailIndex = 0;

function checkPhishing(userSaysPhishing) {
    const feedback = document.getElementById('phishing-feedback');
    const isPhishing = phishingEmails[currentEmailIndex].isPhishing;

    if (userSaysPhishing === isPhishing) {
        feedback.innerText = "Correct! " + (isPhishing ? "That was a phishing attempt." : "That was a legitimate email.");
        feedback.style.color = "green";
    } else {
        feedback.innerText = "Wrong! " + (isPhishing ? "That was actually phishing." : "That was a safe email.");
        feedback.style.color = "red";
    }

    setTimeout(() => {
        currentEmailIndex = (currentEmailIndex + 1) % phishingEmails.length;
        updateEmailUI();
        feedback.innerText = "";
    }, 2000);
}

function updateEmailUI() {
    const email = phishingEmails[currentEmailIndex];
    document.getElementById('email-sender').innerText = `From: ${email.sender}`;
    document.getElementById('email-subject').innerText = `Subject: ${email.subject}`;
    document.querySelector('.email-body p').innerText = email.body;
}

// Password Checker Logic
const pwdInput = document.getElementById('pwd-input');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

if (pwdInput && strengthFill && strengthText) {
    pwdInput.addEventListener('input', () => {
        const val = pwdInput.value;
        let strength = 0;

        if (val.length > 8) strength += 20;
        if (val.length > 12) strength += 20;
        if (/[A-Z]/.test(val)) strength += 20;
        if (/[0-9]/.test(val)) strength += 20;
        if (/[^A-Za-z0-9]/.test(val)) strength += 20;

        strengthFill.style.width = strength + '%';

        if (strength <= 40) {
            strengthFill.style.backgroundColor = 'red';
            strengthText.innerText = 'Strength: Weak';
        } else if (strength <= 80) {
            strengthFill.style.backgroundColor = 'orange';
            strengthText.innerText = 'Strength: Moderate';
        } else {
            strengthFill.style.backgroundColor = 'green';
            strengthText.innerText = 'Strength: Strong';
        }
    });
}

// Quiz Logic
const quizData = [
    { q: "What does the 'S' in HTTPS stand for?", a: ["Static", "Secure", "Simple", "System"], correct: 1 },
    { q: "Which of these is the strongest password?", a: ["123456", "Password123", "P@ssw0rd!2026", "admin"], correct: 2 },
    { q: "What is 2FA?", a: ["Two-Factor Authentication", "Two-File Access", "Total Fire Alarm", "None"], correct: 0 },
    { q: "If you receive a suspicious email, what should you do?", a: ["Reply to it", "Click the links", "Report/Delete it", "Forward to friends"], correct: 2 },
    { q: "What is Malware?", a: ["Friendly software", "Malicious software", "Hardware tool", "Web browser"], correct: 1 }
];

let currentQuizIndex = 0;
let score = 0;

function loadQuiz() {
    const q = quizData[currentQuizIndex];
    document.getElementById('quiz-question').innerText = q.q;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    
    q.a.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => selectOption(index);
        optionsDiv.appendChild(btn);
    });
}

function selectOption(index) {
    if (index === quizData[currentQuizIndex].correct) {
        score++;
    }
    
    currentQuizIndex++;
    if (currentQuizIndex < quizData.length) {
        loadQuiz();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    document.getElementById('score-val').innerText = score;
}

function restartQuiz() {
    score = 0;
    currentQuizIndex = 0;
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    loadQuiz();
}

// Initialize
window.onload = () => {
    if (document.getElementById('quiz-question')) {
        loadQuiz();
    }
};

// Footer scroll animation
const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.footer-section').forEach(section => {
    footerObserver.observe(section);
});

window.onscroll = function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    
    let bar = document.querySelector(".progress-bar");
    if(bar) {
        bar.style.width = scrolled + "%";
    }
};

// Lenis smooth scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Sidebar Active Link Highlighting on Scroll
(function initSidebarHighlight() {
    const sidebarLinks = document.querySelectorAll('.guide-sidebar-nav a');
    const sections = document.querySelectorAll('.guide-subsection');
    
    if (!sidebarLinks.length || !sections.length) return;

    function highlightSidebar() {
        let current = "";
        const scrollPosition = window.scrollY + 150; // Offset for better detection

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        sidebarLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", highlightSidebar);
    highlightSidebar(); // Initial check
})();

// =====================
// AUTHENTICATION LOGIC
// =====================
(function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginFormElement = document.getElementById('login-form-element');
    const registerFormElement = document.getElementById('register-form-element');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    if (!loginFormElement && !registerFormElement) return;

    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) loginError.textContent = '';

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    if (loginError) loginError.textContent = (data.message || 'Ошибка входа') + '. Попробуйте снова.';
                    return;
                }

                localStorage.setItem('cyberaware_token', data.token);
                const redirectAfterLogin = localStorage.getItem('cyberaware_post_auth_redirect');
                if (redirectAfterLogin) {
                    localStorage.removeItem('cyberaware_post_auth_redirect');
                    window.location.href = redirectAfterLogin;
                    return;
                }

                window.location.href = 'index.html';
            } catch (err) {
                if (loginError) loginError.textContent = 'Ошибка: Сервер недоступен. Попробуйте позже.';
            }
        });
    }

    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (registerError) {
                registerError.textContent = '';
                registerError.style.color = '#dc2626';
            }

            const emailInput = document.getElementById('register-email');
            const passwordInput = document.getElementById('register-password');
            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    if (registerError) registerError.textContent = (data.message || 'Ошибка регистрации') + '. Попробуйте снова.';
                    return;
                }

                if (registerError) {
                    registerError.style.color = '#16a34a';
                    registerError.textContent = 'Регистрация успешна! Перенаправление на вход...';
                }
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 2000);
            } catch (err) {
                if (registerError) registerError.textContent = 'Ошибка: Сервер недоступен. Попробуйте позже.';
            }
        });
    }
})();
