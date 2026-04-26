
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

function saveUserProfileToStorage(user) {
    if (!user) return;
    localStorage.setItem('cyberaware_profile', JSON.stringify(user));
}

function readUserProfileFromStorage() {
    try {
        const raw = localStorage.getItem('cyberaware_profile');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getCurrentLang() {
    const savedLang = localStorage.getItem('cyberaware_lang');
    return savedLang === 'en' ? 'en' : 'ru';
}

function t(key, fallback) {
    const lang = getCurrentLang();
    if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
        return translations[lang][key];
    }
    return fallback;
}

function buildLearningInsight(score, totalQuestions) {
    if (!Number.isFinite(score) || !Number.isFinite(totalQuestions) || totalQuestions <= 0) {
        return {
            level: t('trust_level_unknown', 'Не определен'),
            nextStep: t('trust_next_step_default', 'Пройдите тест, чтобы получить персональную рекомендацию.'),
            recommendations: [t('rec_no_data_1', 'Начните с раздела "Угрозы" и базовых правил.')],
        };
    }

    const ratio = score / totalQuestions;
    if (ratio >= 0.85) {
        return {
            level: t('level_advanced', 'Продвинутый'),
            nextStep: t('next_step_advanced', 'Перейдите к практическим сценариям фишинга и закрепите навыки.'),
            recommendations: [
                t('rec_advanced_1', 'Пройдите мини-тренажер "Фишинг или нет?"'),
                t('rec_advanced_2', 'Изучите раздел "Советы" и примените 2FA в важных сервисах'),
                t('rec_advanced_3', 'Повторите тест через 7 дней для контроля результата'),
            ],
        };
    }

    if (ratio >= 0.6) {
        return {
            level: t('level_intermediate', 'Средний'),
            nextStep: t('next_step_intermediate', 'Укрепите слабые места: фишинг, пароли и безопасные привычки.'),
            recommendations: [
                t('rec_intermediate_1', 'Повторите материалы в разделе "Обучение"'),
                t('rec_intermediate_2', 'Проверьте и обновите пароли до уникальных'),
                t('rec_intermediate_3', 'Включите двухфакторную аутентификацию'),
            ],
        };
    }

    return {
        level: t('level_beginner', 'Начальный'),
        nextStep: t('next_step_beginner', 'Начните с основ кибербезопасности и пройдите тест повторно.'),
        recommendations: [
            t('rec_beginner_1', 'Изучите раздел "Угрозы" с примерами атак'),
            t('rec_beginner_2', 'Пройдите базовые модули в "Обучение"'),
            t('rec_beginner_3', 'Потренируйтесь на мини-тренажере перед повторным тестом'),
        ],
    };
}

function buildSevenDayPlan(level) {
    if (level === t('level_advanced', 'Продвинутый')) {
        return [
            t('plan_advanced_d1', 'День 1: Пройдите мини-тренажер 3 раза подряд без ошибок'),
            t('plan_advanced_d2', 'День 2: Проверьте 2FA во всех ключевых аккаунтах'),
            t('plan_advanced_d3', 'День 3: Обновите пароли на 3 важных сервисах'),
            t('plan_advanced_d4', 'День 4: Повторите раздел "Советы" и сохраните чеклист'),
            t('plan_advanced_d5', 'День 5: Отработайте распознавание подозрительных доменов'),
            t('plan_advanced_d6', 'День 6: Проведите мини-аудит личной цифровой гигиены'),
            t('plan_advanced_d7', 'День 7: Пересдайте тест и сравните динамику'),
        ];
    }

    if (level === t('level_intermediate', 'Средний')) {
        return [
            t('plan_intermediate_d1', 'День 1: Повторите тему "Фишинг"'),
            t('plan_intermediate_d2', 'День 2: Усильте пароли и включите менеджер паролей'),
            t('plan_intermediate_d3', 'День 3: Включите 2FA в почте и мессенджерах'),
            t('plan_intermediate_d4', 'День 4: Пройдите мини-тренажер и разберите ошибки'),
            t('plan_intermediate_d5', 'День 5: Повторите раздел "Угрозы"'),
            t('plan_intermediate_d6', 'День 6: Закрепите правила безопасных ссылок и вложений'),
            t('plan_intermediate_d7', 'День 7: Пройдите тест повторно'),
        ];
    }

    return [
        t('plan_beginner_d1', 'День 1: Изучите базовый раздел "Угрозы"'),
        t('plan_beginner_d2', 'День 2: Пройдите тему "Пароли" в разделе "Обучение"'),
        t('plan_beginner_d3', 'День 3: Включите 2FA хотя бы в одном аккаунте'),
        t('plan_beginner_d4', 'День 4: Пройдите мини-тренажер "Фишинг или нет?"'),
        t('plan_beginner_d5', 'День 5: Разберите ошибки и повторите слабые темы'),
        t('plan_beginner_d6', 'День 6: Закрепите правила работы с письмами и ссылками'),
        t('plan_beginner_d7', 'День 7: Пройдите тест заново и сравните результат'),
    ];
}

(function initHomeTrustInsights() {
    const lastResultElement = document.getElementById('home-last-result');
    const bestResultElement = document.getElementById('home-best-result');
    const levelElement = document.getElementById('home-level');
    const nextStepElement = document.getElementById('home-next-step');
    if (!lastResultElement || !bestResultElement || !levelElement || !nextStepElement) return;

    const token = localStorage.getItem('cyberaware_token');
    if (!token) return;

    lastResultElement.textContent = t('common_loading', 'Загрузка...');
    bestResultElement.textContent = t('common_loading', 'Загрузка...');
    levelElement.textContent = t('common_determining', 'Определяем...');
    nextStepElement.textContent = t('common_generating_recommendation', 'Формируем рекомендацию...');

    fetch('/api/auth/test-results', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) throw new Error('Results unavailable');

            const latest = data.latest;
            const best = data.best;
            const latestScore = latest?.score;
            const latestTotal = latest?.total_questions;
            const insight = buildLearningInsight(latestScore, latestTotal);

            lastResultElement.textContent = latest
                ? `${latest.score}/${latest.total_questions}`
                : t('profile_no_data', 'Нет данных');

            bestResultElement.textContent = best
                ? `${best.score}/${best.total_questions}`
                : t('profile_no_data', 'Нет данных');

            levelElement.textContent = insight.level;
            nextStepElement.textContent = insight.nextStep;
        })
        .catch(() => {
            lastResultElement.textContent = t('common_load_error', 'Ошибка загрузки');
            bestResultElement.textContent = t('common_load_error', 'Ошибка загрузки');
            levelElement.textContent = t('trust_level_unknown', 'Не определен');
            nextStepElement.textContent = t('common_recommendation_error', 'Не удалось получить рекомендации. Попробуйте позже.');
        });
})();

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
        localStorage.removeItem('cyberaware_profile');
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
                saveUserProfileToStorage(data.user);
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

            const firstNameInput = document.getElementById('register-first-name');
            const lastNameInput = document.getElementById('register-last-name');
            const emailInput = document.getElementById('register-email');
            const passwordInput = document.getElementById('register-password');
            if (!firstNameInput || !lastNameInput || !emailInput || !passwordInput) return;

            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
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

// =====================
// PROFILE PAGE LOGIC
// =====================
(function initProfilePage() {
    const fullNameElement = document.getElementById('profile-full-name');
    const emailElement = document.getElementById('profile-email');
    const lastResultElement = document.getElementById('profile-last-result');
    const bestResultElement = document.getElementById('profile-best-result');
    const recommendationsContainer = document.getElementById('profile-recommendations');
    const sevenDayPlanContainer = document.getElementById('profile-seven-day-plan');
    const certificateBlock = document.getElementById('profile-certificate-block');
    const certificateName = document.getElementById('certificate-name');
    const certificateScore = document.getElementById('certificate-score');
    const certificateDate = document.getElementById('certificate-date');
    const certificateId = document.getElementById('certificate-id');
    const certificateDownloadBtn = document.getElementById('certificate-download-btn');
    if (!fullNameElement || !emailElement) return;

    const token = localStorage.getItem('cyberaware_token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const storedProfile = readUserProfileFromStorage();
    if (storedProfile?.email) {
        const fullName = `${storedProfile.firstName || ''} ${storedProfile.lastName || ''}`.trim();
        fullNameElement.textContent = fullName || 'Пользователь CyberAware';
        emailElement.textContent = storedProfile.email;
    }

    fetch('/api/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok || !data.user) throw new Error('Unauthorized');

            saveUserProfileToStorage(data.user);
            const fullName = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
            fullNameElement.textContent = fullName || 'Пользователь CyberAware';
            emailElement.textContent = data.user.email || 'user@example.com';
        })
        .catch(() => {
            localStorage.removeItem('cyberaware_token');
            localStorage.removeItem('cyberaware_profile');
            window.location.href = 'auth.html';
        });

    if (!lastResultElement || !bestResultElement) return;

    fetch('/api/auth/test-results', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) throw new Error('Results unavailable');

            const latest = data.latest;
            const best = data.best;
            const insight = buildLearningInsight(latest?.score, latest?.total_questions);

            lastResultElement.textContent = latest
                ? `${latest.score}/${latest.total_questions}`
                : 'Нет данных';

            bestResultElement.textContent = best
                ? `${best.score}/${best.total_questions}`
                : t('profile_no_data', 'Нет данных');

            if (certificateBlock && certificateName && certificateScore && certificateDate) {
                if (latest) {
                    const currentName = fullNameElement.textContent?.trim() || t('profile_user_display', 'Пользователь CyberAware');
                    const issuedAt = latest.created_at
                        ? new Date(latest.created_at).toLocaleDateString(localStorage.getItem('cyberaware_lang') === 'en' ? 'en-US' : 'ru-RU')
                        : new Date().toLocaleDateString(localStorage.getItem('cyberaware_lang') === 'en' ? 'en-US' : 'ru-RU');
                    certificateName.textContent = currentName;
                    certificateScore.textContent = `${latest.score}/${latest.total_questions}`;
                    certificateDate.textContent = issuedAt;
                    certificateId.textContent = `CA-${String(latest.id || latest.created_at || Date.now()).replace(/[^0-9]/g, '').slice(-8) || '00000000'}`;
                    certificateBlock.style.display = 'block';
                } else {
                    certificateBlock.style.display = 'none';
                }
            }

            if (recommendationsContainer) {
                recommendationsContainer.innerHTML = '';
                insight.recommendations.forEach((recommendation, index) => {
                    const row = document.createElement('div');
                    row.className = 'results-row';
                    row.innerHTML = `
                        <span class="results-label">${t('profile_tip_label', 'Совет')} ${index + 1}</span>
                        <span class="results-value">${recommendation}</span>
                    `;
                    recommendationsContainer.appendChild(row);
                });
            }

            if (sevenDayPlanContainer) {
                const planItems = buildSevenDayPlan(insight.level);
                sevenDayPlanContainer.innerHTML = '';
                planItems.forEach((item, index) => {
                    const row = document.createElement('div');
                    row.className = 'results-row';
                    row.innerHTML = `
                        <span class="results-label">${t('profile_day_label', 'День')} ${index + 1}</span>
                        <span class="results-value">${item}</span>
                    `;
                    sevenDayPlanContainer.appendChild(row);
                });
            }
        })
        .catch(() => {
            lastResultElement.textContent = t('common_load_error', 'Ошибка загрузки');
            bestResultElement.textContent = t('common_load_error', 'Ошибка загрузки');
            if (recommendationsContainer) {
                recommendationsContainer.innerHTML = `
                    <div class="results-row">
                        <span class="results-label">${t('profile_recommendations_unavailable', 'Рекомендации недоступны')}</span>
                        <span class="results-value">${t('common_try_later', 'Попробуйте позже')}</span>
                    </div>
                `;
            }
            if (sevenDayPlanContainer) {
                sevenDayPlanContainer.innerHTML = `
                    <div class="results-row">
                        <span class="results-label">${t('profile_plan_unavailable', 'План недоступен')}</span>
                        <span class="results-value">${t('common_try_later', 'Попробуйте позже')}</span>
                    </div>
                `;
            }
            if (certificateBlock) {
                certificateBlock.style.display = 'none';
            }
        });

    if (certificateDownloadBtn) {
        certificateDownloadBtn.addEventListener('click', () => {
            const holderName = certificateName?.textContent?.trim() || t('profile_user_display', 'Пользователь CyberAware');
            const scoreValue = certificateScore?.textContent?.trim() || '-';
            const dateValue = certificateDate?.textContent?.trim() || new Date().toLocaleDateString();
            const idValue = certificateId?.textContent?.trim() || `CA-${Date.now().toString().slice(-8)}`;
            const lang = localStorage.getItem('cyberaware_lang') === 'en' ? 'en' : 'ru';

            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 1100;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#f8fbff');
            gradient.addColorStop(1, '#eef6ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#0b3a63';
            ctx.lineWidth = 10;
            ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 3;
            ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

            ctx.strokeStyle = 'rgba(14, 116, 144, 0.22)';
            ctx.setLineDash([8, 10]);
            ctx.lineWidth = 2;
            ctx.strokeRect(95, 95, canvas.width - 190, canvas.height - 190);
            ctx.setLineDash([]);

            ctx.fillStyle = '#0f172a';
            ctx.font = '700 64px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(lang === 'en' ? 'Completion Certificate' : 'Сертификат о прохождении', canvas.width / 2, 220);

            ctx.fillStyle = '#475569';
            ctx.font = '400 34px Inter, Arial, sans-serif';
            ctx.fillText(lang === 'en' ? 'This certifies that' : 'Настоящим подтверждается, что', canvas.width / 2, 300);

            ctx.fillStyle = '#0b4a6f';
            ctx.font = '700 60px Inter, Arial, sans-serif';
            ctx.fillText(holderName, canvas.width / 2, 410);

            ctx.fillStyle = '#334155';
            ctx.font = '400 34px Inter, Arial, sans-serif';
            ctx.fillText(
                lang === 'en'
                    ? 'successfully completed CyberAware test track'
                    : 'успешно прошел(ла) тестовый трек CyberAware',
                canvas.width / 2,
                490
            );

            ctx.font = '600 33px Inter, Arial, sans-serif';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(`${lang === 'en' ? 'Score' : 'Результат'}: ${scoreValue}`, canvas.width / 2, 590);
            ctx.fillText(`${lang === 'en' ? 'Date' : 'Дата'}: ${dateValue}`, canvas.width / 2, 650);
            ctx.fillText(`ID: ${idValue}`, canvas.width / 2, 710);

            ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(200, 790);
            ctx.lineTo(1400, 790);
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.fillStyle = '#0369a1';
            ctx.font = '700 30px Inter, Arial, sans-serif';
            ctx.fillText('CyberAware Academy', 120, 960);

            ctx.fillStyle = '#64748b';
            ctx.font = '400 24px Inter, Arial, sans-serif';
            ctx.fillText(lang === 'en' ? 'Authorized Signature' : 'Уполномоченная подпись', 120, 995);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#475569';
            ctx.font = '400 24px Inter, Arial, sans-serif';
            ctx.fillText(lang === 'en' ? 'Digital Safety Education' : 'Образование цифровой безопасности', canvas.width - 120, 960);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `cyberaware-certificate-${idValue}.png`;
            link.click();
        });
    }
})();
