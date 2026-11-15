
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

document.querySelectorAll(".nav-btn").forEach(button => {
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
