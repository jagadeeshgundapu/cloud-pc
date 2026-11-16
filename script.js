
// ==========================================
// CLOUD PC - FRONT PAGE JAVASCRIPT
// ==========================================

// ELEMENTS
const authModal = document.getElementById("authModal");
const infoModal = document.getElementById("infoModal");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmit = document.getElementById("authSubmit");
const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");

const nameField = document.getElementById("nameField");
const switchText = document.getElementById("switchText");
const switchAuth = document.getElementById("switchAuth");

let isSignup = false;

// ==========================================
// OPEN LOGIN / SIGNUP
// ==========================================

function openAuth(type) {
    if (getLoggedInUser()) {
        window.location.href = DASHBOARD_PAGE;
        return;
    }

    isSignup = type === "signup";

    authMessage.textContent = "";
    authForm.reset();

    updateAuthForm();

    authModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function updateAuthForm() {
    if (isSignup) {
        authTitle.textContent = "Create Account";
        authSubtitle.textContent = "Create your account to get started with Cloud PC.";
        authSubmit.textContent = "CREATE ACCOUNT";
        nameField.classList.remove("hidden");
        document.getElementById("userName").required = true;
        switchText.textContent = "Already have an account?";
        switchAuth.textContent = "Login";
    } else {
        authTitle.textContent = "Welcome Back";
        authSubtitle.textContent = "Login to access your cloud desktop.";
        authSubmit.textContent = "LOGIN";
        nameField.classList.add("hidden");
        document.getElementById("userName").required = false;
        switchText.textContent = "Don't have an account?";
        switchAuth.textContent = "Sign Up";
    }
}

document.getElementById("navLogin").addEventListener("click", () => {
    openAuth("login");
});

document.getElementById("navSignup").addEventListener("click", () => {
    openAuth("signup");
});

document.getElementById("heroLogin").addEventListener("click", () => {
    openAuth("login");
});

document.getElementById("heroSignup").addEventListener("click", () => {
    openAuth("signup");
});

document.getElementById("bottomSignup").addEventListener("click", () => {
    openAuth("signup");
});

switchAuth.addEventListener("click", () => {
    openAuth(isSignup ? "login" : "signup");
});

// ==========================================
// CLOSE MODALS
// ==========================================

document.getElementById("closeAuth").addEventListener("click", closeModals);
document.getElementById("closeInfo").addEventListener("click", closeModals);

function closeModals() {
    closeHow();
    authModal.classList.remove("show");
    infoModal.classList.remove("show");
    document.body.style.overflow = "";
}

[authModal, infoModal].forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModals();
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModals();
    }
});

// ==========================================
// DEMO LOGIN AND SIGNUP
// ==========================================

// Demonstration-only authentication. Data is shared with dashboard.html
// through localStorage using the same keys that dashboard.js reads.
// Do not store real passwords in localStorage; use a secure backend in production.

const STORAGE = {
    users: "cloudpc_users",
    session: "cloudpc_session",
    credits: "cloudpc_credits",
    pcs: "cloudpc_pcs",
    history: "cloudpc_history",
    profile: "cloudpc_profile"
};

const DASHBOARD_PAGE = "dashboard.html";

function readStore(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function addHistoryEntry(title, description, icon) {
    const history = readStore(STORAGE.history, []);
    history.unshift({ title, description, icon, time: new Date().toLocaleString() });
    writeStore(STORAGE.history, history.slice(0, 100));
}

function getLoggedInUser() {
    const session = readStore(STORAGE.session, null);
    if (!session) return null;
    return readStore(STORAGE.users, []).find(user => user.loginId === session) || null;
}

authForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim().toLowerCase();
    const password = document.getElementById("userPassword").value;

    if (!email || !password) {
        authMessage.textContent = "Please fill in all required fields.";
        return;
    }

    const users = readStore(STORAGE.users, []);

    if (isSignup) {
        if (!name) {
            authMessage.textContent = "Please enter your name.";
            return;
        }

        if (users.some(user => user.loginId === email)) {
            authMessage.textContent = "An account with this email already exists.";
            return;
        }

        users.push({ loginId: email, password: password, name: name });
        writeStore(STORAGE.users, users);

        writeStore(STORAGE.credits, 100);
        writeStore(STORAGE.pcs, []);
        writeStore(STORAGE.history, []);
        addHistoryEntry("Account created", "Your Cloud PC account was created.", "✦");

        authMessage.textContent = "Account created successfully. You can now login.";

        setTimeout(() => {
            openAuth("login");
            document.getElementById("userEmail").value = email;
        }, 1200);

    } else {
        const user = users.find(item => item.loginId === email && item.password === password);

        if (!user) {
            authMessage.textContent = "Invalid email or password.";
            return;
        }

        writeStore(STORAGE.session, user.loginId);
        writeStore(STORAGE.profile, { name: user.name, contact: user.loginId });

        if (localStorage.getItem(STORAGE.credits) === null) writeStore(STORAGE.credits, 100);
        if (localStorage.getItem(STORAGE.pcs) === null) writeStore(STORAGE.pcs, []);
        if (localStorage.getItem(STORAGE.history) === null) writeStore(STORAGE.history, []);

        addHistoryEntry("Logged in", "You signed in to your Cloud PC account.", "↪");

        authMessage.textContent = "Login successful. Redirecting...";

        setTimeout(() => {
            window.location.href = DASHBOARD_PAGE;
        }, 800);
    }
});

// ==========================================
// ABOUT / SETTINGS / PROFILE NAVIGATION
// ==========================================

const infoTitle = document.getElementById("infoTitle");
const infoContent = document.getElementById("infoContent");

const infoPages = {
    about: {
        title: "About Cloud PC",
        content: `
            <div class="info-content">
                <p>
                    Cloud PC is a browser-based computing platform that allows
                    users to access a desktop environment through the internet.
                </p>

                <h3>Our Purpose</h3>
                <p>
                    We aim to make high-performance computing accessible to
                    people who do not own expensive physical computers.
                </p>

                <h3>What We Offer</h3>
                <ul>
                    <li>Access your desktop from laptops, tablets and mobiles.</li>
                    <li>Choose computing specifications based on your needs.</li>
                    <li>Use your desktop for gaming, editing and development.</li>
                    <li>Usage-based pricing according to the selected plan.</li>
                    <li>Cloud-based workspace and data-management features.</li>
                </ul>

                <h3>Our Goal</h3>
                <p>
                    Deliver powerful, flexible and affordable computing
                    without requiring users to purchase expensive hardware.
                </p>
            </div>
        `
    },

    settings: {
        title: "Settings",
        content: `
            <div class="info-content">
                <p>Manage your Cloud PC preferences.</p>

                <h3>Available Settings</h3>
                <ul>
                    <li>Appearance and theme customization.</li>
                    <li>Notification preferences.</li>
                    <li>Security and account preferences.</li>
                    <li>Display and accessibility settings.</li>
                    <li>Cloud PC performance preferences.</li>
                </ul>

                <p>
                    Detailed settings will be available after entering
                    your Cloud PC account.
                </p>
            </div>
        `
    },

    profile: {
        title: "Your Profile",
        content: `
            <div class="info-content" id="profileContent">
                <p>Login to view your account details and manage your profile.</p>
            </div>
        `
    }
};

document.querySelectorAll(".nav-btn[data-info]").forEach(button => {
    button.addEventListener("click", () => {
        openInfo(button.dataset.info);
    });
});

function openInfo(type) {
    const page = infoPages[type];

    if (!page) return;

    infoTitle.textContent = page.title;
    infoContent.innerHTML = page.content;

    if (type === "profile") {
        loadProfile();
    }

    infoModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function loadProfile() {
    const profileContent = document.getElementById("profileContent");

    const currentUser = getLoggedInUser();

    if (!currentUser) {
        profileContent.innerHTML = `
            <p>You are not currently logged in.</p>
            <h3>Access Your Account</h3>
            <p>Login to view your profile and Cloud PC information.</p>
            <button class="btn btn-gold" id="profileLogin">
                LOGIN
            </button>
        `;

        document.getElementById("profileLogin").addEventListener("click", () => {
            closeModals();
            openAuth("login");
        });

        return;
    }

    profileContent.innerHTML = `
        <h3>Account Information</h3>
        <p><strong>Name:</strong> ${escapeHTML(currentUser.name)}</p>
        <p><strong>Email:</strong> ${escapeHTML(currentUser.loginId)}</p>
        <h3>Account Status</h3>
        <p>Logged in</p>
        <button class="btn btn-gold" id="profileDashboard">OPEN DASHBOARD</button>
        <button class="btn btn-outline" id="profileLogout">
            LOGOUT
        </button>
    `;

    document.getElementById("profileDashboard").addEventListener("click", () => {
        window.location.href = DASHBOARD_PAGE;
    });

    document.getElementById("profileLogout").addEventListener("click", () => {
        localStorage.removeItem(STORAGE.session);
        closeModals();
        alert("You have been logged out.");
    });
}

// Escape user-provided text before inserting it into HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const navbar = document.querySelector(".navbar");

menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("menu-open");
});

document.querySelectorAll(".nav-links button, .nav-auth button").forEach(button => {
    button.addEventListener("click", () => {
        navbar.classList.remove("menu-open");
    });
});

// ==========================================
// GOLDEN PARTICLE ANIMATION
// ==========================================

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrame;

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.35 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.phase = Math.random() * Math.PI * 2;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.phase += 0.02;

        if (this.y < -5) {
            this.y = window.innerHeight + 5;
            this.x = Math.random() * window.innerWidth;
        }

        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
    }

    draw() {
        const glow = this.opacity * (0.7 + Math.sin(this.phase) * 0.3);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 196, 81, ${glow})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f5c451";
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function createParticles() {
    const count = Math.min(
        90,
        Math.floor(window.innerWidth / 13)
    );

    particles = [];

    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    animationFrame = requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animateParticles();

// Reduce animation work when the page is not visible.
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        cancelAnimationFrame(animationFrame);
    } else {
        animateParticles();
    }
});


// ==========================================
// GOLDEN CPU (SVG BUILDER)
// ==========================================

function buildChipSVG(id) {
    const gold = `url(#${id}-gold)`;
    const pos = i => 124 + i * 22;
    let pins = "", traces = "", pulses = "", nodes = "", cells = "";

    for (let i = 0; i < 8; i++) {
        const a = pos(i);
        const dx = (i - 3.5) * 9;

        pins += `<line class="chip-pin" style="--i:${i}" x1="${a}" y1="110" x2="${a}" y2="90"/>`;
        pins += `<line class="chip-pin" style="--i:${i}" x1="${a}" y1="290" x2="${a}" y2="310"/>`;
        pins += `<line class="chip-pin" style="--i:${i}" x1="110" y1="${a}" x2="90" y2="${a}"/>`;
        pins += `<line class="chip-pin" style="--i:${i}" x1="290" y1="${a}" x2="310" y2="${a}"/>`;

        // paths run from the outer edge INTO the chip so the pulses flow inward
        const paths = [
            { d: `M${a + dx} 32 V54 L${a} 72 V90`, x: a + dx, y: 32 },
            { d: `M${a + dx} 368 V346 L${a} 328 V310`, x: a + dx, y: 368 },
            { d: `M32 ${a + dx} H54 L72 ${a} H90`, x: 32, y: a + dx },
            { d: `M368 ${a + dx} H346 L328 ${a} H310`, x: 368, y: a + dx }
        ];

        paths.forEach((path, side) => {
            traces += `<path class="chip-trace" d="${path.d}"/>`;

            if (i % 2 === side % 2) {
                const delay = -((i * 4 + side) * 0.17).toFixed(2);
                pulses += `<path class="chip-pulse" d="${path.d}" style="animation-delay:${delay}s"/>`;
            }

            nodes += `<circle class="chip-node" cx="${path.x}" cy="${path.y}" r="3" style="animation-delay:-${((i + side) * 0.23).toFixed(2)}s"/>`;
        });
    }

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if ((r === 1 || r === 2) && (c === 1 || c === 2)) continue;
            cells += `<rect class="chip-cell" x="${150 + c * 26}" y="${150 + r * 26}" width="18" height="18" rx="3" style="animation-delay:-${((r * 4 + c) * 0.31).toFixed(2)}s"/>`;
        }
    }

    return `
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
        <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff0bd"/><stop offset=".5" stop-color="#f5c451"/><stop offset="1" stop-color="#b77b18"/>
        </linearGradient>
        <linearGradient id="${id}-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#211d13"/><stop offset="1" stop-color="#0a0a0a"/>
        </linearGradient>
        <radialGradient id="${id}-glow">
            <stop offset="0" stop-color="#f5c451" stop-opacity=".9"/><stop offset="1" stop-color="#f5c451" stop-opacity="0"/>
        </radialGradient>
    </defs>

    <g class="chip-rings">
        <circle class="chip-ring-a" cx="200" cy="200" r="196"/>
        <circle class="chip-ring-b" cx="200" cy="200" r="184"/>
        <circle class="chip-arc" cx="200" cy="200" r="150"/>
        <circle class="chip-arc-b" cx="200" cy="200" r="138"/>
    </g>

    <g class="chip-flow">${traces}${pulses}${nodes}</g>
    ${pins}

    <rect class="chip-body" x="110" y="110" width="180" height="180" rx="18" fill="url(#${id}-dark)" stroke="${gold}" stroke-width="3" pathLength="1000"/>
    <rect class="chip-die" x="140" y="140" width="120" height="120" rx="10" fill="none" stroke="rgba(245,196,81,.55)" stroke-width="1.5" pathLength="1000"/>
    <circle cx="124" cy="124" r="3" fill="#f5c451"/>

    <g class="chip-inner">
        ${cells}
        <circle class="chip-halo" cx="200" cy="200" r="46" fill="url(#${id}-glow)"/>
        <rect class="chip-scan" x="150" y="150" width="100" height="2" rx="1"/>
        <rect class="chip-core" x="178" y="178" width="44" height="44" rx="8" fill="${gold}"/>
        <text class="chip-text" x="200" y="205" text-anchor="middle">CPU</text>
    </g>
</svg>`;
}

const bgChipBox = document.getElementById("bgChip");
if (bgChipBox) bgChipBox.innerHTML = buildChipSVG("bg");

// ==========================================
// OPENING ANIMATION
// ==========================================

(function openingAnimation() {
    const root = document.documentElement;
    const intro = document.getElementById("intro");

    function pageReady() {
        root.classList.add("page-ready");
    }

    if (!intro) {
        pageReady();
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        intro.remove();
        pageReady();
        return;
    }

    document.getElementById("introChip").innerHTML = buildChipSVG("in");
    document.body.style.overflow = "hidden";

    const status = document.getElementById("introStatus");
    const percent = document.getElementById("introPercent");
    const messages = [
        "INITIALIZING CORE",
        "CONNECTING TO CLOUD",
        "ALLOCATING MEMORY",
        "SECURING WORKSPACE",
        "SYSTEM READY"
    ];

    const duration = 3000;
    const startTime = performance.now();
    let finished = false;

    function finish() {
        if (finished) return;
        finished = true;

        intro.classList.add("done");
        document.body.style.overflow = "";
        pageReady();

        setTimeout(() => intro.remove(), 1300);
    }

    function tick(now) {
        if (finished) return;

        const t = Math.min((now - startTime) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const value = Math.round(eased * 100);

        percent.textContent = value + "%";
        status.textContent = messages[Math.min(messages.length - 1, Math.floor(t * messages.length))];

        if (t >= 1) {
            finish();
        } else {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);

    document.getElementById("introSkip").addEventListener("click", finish);
})();

// ==========================================
// SCROLL REVEAL
// ==========================================

(function scrollReveal() {
    const targets = document.querySelectorAll(
        ".section-heading, .feature-card, .step-card, .trust-strip, .cta-content"
    );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            el.classList.remove("reveal-init");
            el.classList.add("reveal-in");
            observer.unobserve(el);
        });
    }, { threshold: 0.15 });

    targets.forEach((el, index) => {
        el.classList.add("reveal-init");
        el.style.animationDelay = ((index % 3) * 0.12) + "s";
        observer.observe(el);
    });
})();

// ==========================================
// HOW IT WORKS - SLIDING WINDOW
// ==========================================

const howSteps = [
    {
        icon: "👤",
        title: "Create your account",
        text: "Sign up with your name, email and password. It only takes a few seconds and your workspace is created for you.",
        tags: ["Free sign up", "Email & password", "Ready in seconds"]
    },
    {
        icon: "🖥",
        title: "Choose your Cloud PC",
        text: "Pick the configuration that matches your work, from everyday browsing to gaming and heavy video editing.",
        tags: ["Basic · 5 CR/hr", "Professional · 10 CR/hr", "Gaming · 20 CR/hr"]
    },
    {
        icon: "◈",
        title: "Add credits",
        text: "Credits pay for the time you use. Top up whenever you need and only pay for the hours you run.",
        tags: ["100 CR starter", "500 CR standard", "1000 CR power"]
    },
    {
        icon: "🚀",
        title: "Launch your desktop",
        text: "Press Launch and your Cloud PC desktop opens right in the browser, with apps ready to use.",
        tags: ["File Manager", "Notepad", "Paint & more"]
    },
    {
        icon: "☁",
        title: "Work from anywhere",
        text: "Move files between your device and your Cloud PC, and continue from a laptop, tablet or mobile.",
        tags: ["Upload files", "Download anytime", "Any device"]
    }
];

const howDrawer = document.getElementById("howDrawer");
const howTrack = document.getElementById("howTrack");
const howDots = document.getElementById("howDots");
const howProgress = document.getElementById("howProgress");
const howPrev = document.getElementById("howPrev");
const howNext = document.getElementById("howNext");

let howIndex = 0;
let howTimer = null;

howSteps.forEach((step, index) => {
    const slide = document.createElement("div");
    slide.className = "how-slide";
    slide.innerHTML = `
        <div class="how-visual">
            <div class="how-ring"></div>
            <div class="how-orb">${step.icon}</div>
            ${step.tags.map(tag => `<span class="how-tag">${escapeHTML(tag)}</span>`).join("")}
        </div>
        <div class="how-step-label">STEP ${String(index + 1).padStart(2, "0")} / ${String(howSteps.length).padStart(2, "0")}</div>
        <h3>${escapeHTML(step.title)}</h3>
        <p>${escapeHTML(step.text)}</p>
    `;
    howTrack.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Go to step " + (index + 1));
    dot.addEventListener("click", () => goHow(index));
    howDots.appendChild(dot);
});

function restartHowTimer() {
    clearTimeout(howTimer);

    howProgress.classList.remove("running", "paused");
    void howProgress.offsetWidth;

    if (!howDrawer.classList.contains("open")) return;

    howProgress.classList.add("running");

    howTimer = setTimeout(() => {
        goHow((howIndex + 1) % howSteps.length);
    }, 5500);
}

function goHow(index) {
    howIndex = Math.max(0, Math.min(howSteps.length - 1, index));

    howTrack.style.transform = `translateX(-${howIndex * 100}%)`;

    Array.from(howTrack.children).forEach((slide, i) => {
        slide.classList.toggle("active", i === howIndex);
    });

    Array.from(howDots.children).forEach((dot, i) => {
        dot.classList.toggle("active", i === howIndex);
    });

    howPrev.disabled = howIndex === 0;
    howNext.textContent = howIndex === howSteps.length - 1 ? "GET STARTED →" : "NEXT ›";

    restartHowTimer();
}

function openHow() {
    authModal.classList.remove("show");
    infoModal.classList.remove("show");

    howDrawer.classList.add("open");
    howDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    goHow(0);
}

function closeHow() {
    if (!howDrawer) return;

    howDrawer.classList.remove("open");
    howDrawer.setAttribute("aria-hidden", "true");
    clearTimeout(howTimer);
    document.body.style.overflow = "";
}

document.getElementById("navHow").addEventListener("click", openHow);
document.getElementById("heroHow").addEventListener("click", openHow);
document.getElementById("howClose").addEventListener("click", closeHow);
document.getElementById("howBackdrop").addEventListener("click", closeHow);

howPrev.addEventListener("click", () => goHow(howIndex - 1));

howNext.addEventListener("click", () => {
    if (howIndex === howSteps.length - 1) {
        closeHow();
        openAuth("signup");
    } else {
        goHow(howIndex + 1);
    }
});

// pause the auto-slide while the pointer is over the window
const howPanel = document.querySelector(".how-panel");

howPanel.addEventListener("mouseenter", () => {
    clearTimeout(howTimer);
    howProgress.classList.add("paused");
});

howPanel.addEventListener("mouseleave", () => {
    if (howDrawer.classList.contains("open")) restartHowTimer();
});

// swipe support
let howSwipeX = null;
const howViewport = document.getElementById("howViewport");

howViewport.addEventListener("pointerdown", event => {
    howSwipeX = event.clientX;
});

howViewport.addEventListener("pointerup", event => {
    if (howSwipeX === null) return;

    const distance = event.clientX - howSwipeX;
    howSwipeX = null;

    if (distance < -50) goHow(howIndex + 1);
    if (distance > 50) goHow(howIndex - 1);
});

document.addEventListener("keydown", event => {
    if (!howDrawer.classList.contains("open")) return;

    if (event.key === "ArrowRight") goHow(howIndex + 1);
    if (event.key === "ArrowLeft") goHow(howIndex - 1);
});
