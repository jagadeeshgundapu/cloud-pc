/* =========================================
   CLOUD PC - COMPLETE JAVASCRIPT
========================================= */

const $ = (id) => document.getElementById(id);

const STORAGE = {
    users: "cloudpc_users",
    session: "cloudpc_session",
    credits: "cloudpc_credits",
    pcs: "cloudpc_pcs",
    history: "cloudpc_history",
    profile: "cloudpc_profile",
    settings: "cloudpc_settings",
    notepad: "cloudpc_notepad"
};

const cloudPCPlans = {
    basic: {
        name: "Basic",
        price: 5,
        cpu: "2 vCPU",
        ram: "4 GB",
        storage: "50 GB SSD",
        gpu: "Integrated",
        description: "Suitable for browsing, documents and everyday computing.",
        icon: "▤"
    },
    professional: {
        name: "Professional",
        price: 10,
        cpu: "4 vCPU",
        ram: "8 GB",
        storage: "100 GB SSD",
        gpu: "Standard",
        description: "Suitable for productivity, development and multitasking.",
        icon: "◈"
    },
    gaming: {
        name: "Gaming",
        price: 20,
        cpu: "8 vCPU",
        ram: "16 GB",
        storage: "200 GB SSD",
        gpu: "Dedicated GPU",
        description: "Designed for gaming and GPU-intensive workloads.",
        icon: "▧"
    },
    creator: {
        name: "Creator",
        price: 25,
        cpu: "12 vCPU",
        ram: "32 GB",
        storage: "500 GB SSD",
        gpu: "High-performance GPU",
        description: "Designed for video editing, rendering and creative work.",
        icon: "✦"
    }
};

let isSignup = false;
let currentUser = null;
let selectedCloudPC = "professional";
let transferredFiles = [];
let openWindows = {};
let windowCounter = 0;
let toastTimeout = null;
let calculatorExpression = "";

/* =========================================
   LOCAL STORAGE HELPERS
========================================= */

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCredits() {
    return Number(readStorage(STORAGE.credits, 100)) || 0;
}

function setCredits(value) {
    writeStorage(STORAGE.credits, Math.max(0, Number(value) || 0));
}

function getPCs() {
    return readStorage(STORAGE.pcs, []);
}

function setPCs(pcs) {
    writeStorage(STORAGE.pcs, pcs);
}

function getHistory() {
    return readStorage(STORAGE.history, []);
}

function setHistory(history) {
    writeStorage(STORAGE.history, history);
}

function getProfile() {
    return readStorage(STORAGE.profile, {});
}

/* =========================================
   NOTIFICATIONS
========================================= */

function showToast(message) {
    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

/* =========================================
   SCREEN NAVIGATION
========================================= */

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = $(screenId);

    if (target) {
        target.classList.add("active");
    }
}

function showLogin() {
    showScreen("loginScreen");
}

function showLandingAbout() {
    showToast("Sign in to explore the About section.");
}

function showLandingSettings() {
    showToast("Sign in to access your settings.");
}

/* =========================================
   AUTHENTICATION
========================================= */

function toggleAuth() {
    isSignup = !isSignup;

    $("authTitle").textContent = isSignup ? "Create account" : "Sign in";
    $("authDescription").textContent = isSignup
        ? "Create your Cloud PC account."
        : "Access your cloud computing workspace.";

    $("authSubmit").innerHTML = isSignup
        ? 'Create account <span>→</span>'
        : 'Sign in <span>→</span>';

    $("authSwitch").innerHTML = isSignup
        ? 'Already have an account? <button type="button" onclick="toggleAuth()">Sign in</button>'
        : 'Don\'t have an account? <button type="button" onclick="toggleAuth()">Create account</button>';

    $("nameField").classList.toggle("hidden", !isSignup);
    $("fullName").required = isSignup;
}

$("authForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const loginId = $("loginId").value.trim().toLowerCase();
    const password = $("password").value;
    const fullName = $("fullName").value.trim();

    if (!loginId || !password) {
        showToast("Enter your login details.");
        return;
    }

    let users = readStorage(STORAGE.users, []);

    if (isSignup) {
        if (!fullName) {
            showToast("Enter your full name.");
            return;
        }

        const existing = users.find(user => user.loginId === loginId);

        if (existing) {
            showToast("An account with these details already exists.");
            return;
        }

        const newUser = {
            loginId,
            password,
            name: fullName
        };

        users.push(newUser);
        writeStorage(STORAGE.users, users);

        currentUser = newUser;
        writeStorage(STORAGE.profile, {
            name: fullName,
            contact: loginId
        });

        setCredits(100);
        setPCs([]);
        setHistory([]);

        addHistory("Account created", "Your Cloud PC account was created.", "✦");

    } else {
        const user = users.find(item =>
            item.loginId === loginId && item.password === password
        );

        if (!user) {
            showToast("Incorrect login details.");
            return;
        }

        currentUser = user;

        writeStorage(STORAGE.profile, {
            name: user.name,
            contact: user.loginId
        });

        if (localStorage.getItem(STORAGE.credits) === null) {
            setCredits(100);
        }

        if (localStorage.getItem(STORAGE.pcs) === null) {
            setPCs([]);
        }

        if (localStorage.getItem(STORAGE.history) === null) {
            setHistory([]);
        }

        addHistory("Logged in", "You signed in to your Cloud PC account.", "↪");
    }

    writeStorage(STORAGE.session, currentUser.loginId);

    $("authForm").reset();

    openCloudDashboard();
});

/* =========================================
   LOGOUT AND SESSION RESTORATION
========================================= */

function logout() {
    if (currentUser) {
        addHistory("Logged out", "You signed out of your Cloud PC account.", "↪");
    }

    localStorage.removeItem(STORAGE.session);

    currentUser = null;
    openWindows = {};

    showScreen("loginScreen");
    showToast("You have been logged out.");
}

function restoreSession() {
    const session = readStorage(STORAGE.session, null);

    if (!session) {
        showScreen("loginScreen");
        return;
    }

    const users = readStorage(STORAGE.users, []);
    const user = users.find(item => item.loginId === session);

    if (!user) {
        localStorage.removeItem(STORAGE.session);
        showScreen("loginScreen");
        return;
    }

    currentUser = user;
    openCloudDashboard();
}

/* =========================================
   DASHBOARD INITIALIZATION
========================================= */

function openCloudDashboard() {
    if (!currentUser) {
        showScreen("loginScreen");
        return;
    }

    showScreen("cloudDashboard");

    const profile = getProfile();
    const name = profile.name || currentUser.name || "User";
    const initial = name.charAt(0).toUpperCase();

    $("sidebarUserName").textContent = name;
    $("sidebarAvatar").textContent = initial;
    $("headerAvatar").textContent = initial;
    $("welcomeName").textContent = name;
    $("profileAvatar").textContent = initial;
    $("profileName").value = name;
    $("profileContact").value = currentUser.loginId;

    updateDashboard();
    renderAllPlans();
    displayMyPCs();
    displayHistory();
    displayRecentActivity();
    displayTransferredFiles();

    const settings = readStorage(STORAGE.settings, {
        accent: "gold",
        animations: true
    });

    changeAccent(settings.accent || "gold", false);

    $("animationToggle").checked = settings.animations !== false;
    toggleAnimations(settings.animations !== false, false);

    document.querySelectorAll(".side-link[data-panel]").forEach(button => {
        button.classList.remove("active");
    });

    const overviewButton = document.querySelector('[data-panel="overview"]');

    if (overviewButton) {
        overviewButton.classList.add("active");
    }

    document.querySelectorAll(".dashboard-panel").forEach(panel => {
        panel.classList.remove("active");
    });

    $("panel-overview").classList.add("active");
    $("panelHeading").textContent = "Dashboard";
}

/* =========================================
   DASHBOARD SIDEBAR
========================================= */

document.querySelectorAll(".side-link[data-panel]").forEach(button => {
    button.addEventListener("click", () => {
        showDashboardPanel(button.dataset.panel);
    });
});

const panelTitles = {
    overview: "Dashboard",
    plans: "Choose Cloud PC",
    "my-pcs": "My Cloud PCs",
    transfer: "File Transfer",
    credits: "Credits",
    history: "Activity History",
    profile: "My Profile",
    settings: "Settings",
    about: "About Cloud PC"
};

function showDashboardPanel(panelName) {
    document.querySelectorAll(".dashboard-panel").forEach(panel => {
        panel.classList.remove("active");
    });

    const target = $("panel-" + panelName);

    if (!target) return;

    target.classList.add("active");

    document.querySelectorAll(".side-link[data-panel]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.panel === panelName
        );
    });

    $("panelHeading").textContent = panelTitles[panelName] || "Dashboard";

    if (panelName === "my-pcs") displayMyPCs();
    if (panelName === "history") displayHistory();
    if (panelName === "transfer") displayTransferredFiles();
    if (panelName === "credits") updateDashboard();
}

/* =========================================
   DASHBOARD DATA
========================================= */

function updateDashboard() {
    const credits = getCredits();
    const pcs = getPCs();
    const history = getHistory();

    $("sidebarCredits").textContent = credits;
    $("overviewCredits").textContent = credits + " CR";
    $("creditBalance").textContent = credits;
    $("overviewPCs").textContent = pcs.length;
    $("overviewHistory").textContent = history.length;
}

/* =========================================
   HISTORY
========================================= */

function addHistory(title, description, icon = "◷") {
    const history = getHistory();

    history.unshift({
        title,
        description,
        icon,
        time: new Date().toLocaleString()
    });

    writeStorage(STORAGE.history, history.slice(0, 100));

    updateDashboard();
    displayHistory();
    displayRecentActivity();
}

function createActivityRow(item) {
    const row = document.createElement("div");
    row.className = "activity-row";

    const symbol = document.createElement("div");
    symbol.className = "activity-symbol";
    symbol.textContent = item.icon || "◷";

    const info = document.createElement("div");
    info.className = "activity-info";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const description = document.createElement("small");
    description.textContent = item.description;

    info.append(title, description);

    const time = document.createElement("span");
    time.className = "activity-time";
    time.textContent = item.time || "";

    row.append(symbol, info, time);

    return row;
}

function displayHistory() {
    const container = $("historyList");
    const history = getHistory();

    container.replaceChildren();

    if (!history.length) {
        container.innerHTML = '<div class="empty-state">No activity records yet.</div>';
        return;
    }

    history.forEach(item => {
        container.appendChild(createActivityRow(item));
    });
}

function displayRecentActivity() {
    const container = $("recentActivity");
    const history = getHistory();

    container.replaceChildren();

    if (!history.length) {
        container.innerHTML = '<div class="activity-row">No recent activity.</div>';
        return;
    }

    history.slice(0, 4).forEach(item => {
        container.appendChild(createActivityRow(item));
    });
}

function clearActivityHistory() {
    if (!confirm("Clear all activity history?")) return;

    setHistory([]);
    displayHistory();
    displayRecentActivity();
    updateDashboard();

    showToast("Activity history cleared.");
}

/* =========================================
   CLOUD PC PLANS
========================================= */

function renderAllPlans() {
    const container = $("allPlansGrid");
    container.replaceChildren();

    Object.entries(cloudPCPlans).forEach(([id, plan]) => {
        const card = document.createElement("article");
        card.className = "full-plan-card";

        if (id === selectedCloudPC) {
            card.classList.add("selected");
        }

        const icon = document.createElement("div");
        icon.className = "plan-icon";
        icon.textContent = plan.icon;

        const title = document.createElement("h3");
        title.textContent = plan.name;

        const description = document.createElement("p");
        description.textContent = plan.description;

        const price = document.createElement("div");
        price.className = "plan-price";
        price.textContent = plan.price + " ";

        const priceUnit = document.createElement("small");
        priceUnit.textContent = "CR / hour";
        price.appendChild(priceUnit);

        const specs = document.createElement("div");
        specs.className = "spec-list";

        const specItems = [
            ["Processor", plan.cpu],
            ["Memory", plan.ram],
            ["Storage", plan.storage],
            ["Graphics", plan.gpu]
        ];

        specItems.forEach(([label, value]) => {
            const item = document.createElement("span");
            item.textContent = label;

            const bold = document.createElement("b");
            bold.textContent = value;

            item.appendChild(bold);
            specs.appendChild(item);
        });

        const button = document.createElement("button");
        button.className = id === selectedCloudPC ? "primary-btn" : "outline-btn";
        button.textContent = id === selectedCloudPC ? "Selected" : "Select this PC";
        button.addEventListener("click", () => selectCloudPC(id));

        card.append(icon, title, description, price, specs, button);
        container.appendChild(card);
    });
}

function selectCloudPC(planId) {
    if (!cloudPCPlans[planId]) return;

    selectedCloudPC = planId;

    const plan = cloudPCPlans[planId];

    const pcs = getPCs();

    const existing = pcs.find(pc => pc.planId === planId);

    if (!existing) {
        pcs.push({
            id: Date.now(),
            planId,
            name: plan.name + " Cloud PC",
            created: new Date().toLocaleString()
        });

        setPCs(pcs);

        addHistory(
            "Cloud PC configuration saved",
            plan.name + " configuration was added to your account.",
            "▣"
        );
    }

    renderAllPlans();
    displayMyPCs();
    updateDashboard();

    showToast(plan.name + " Cloud PC selected.");

    showDashboardPanel("my-pcs");
}

/* =========================================
   MY CLOUD PCS
========================================= */

function displayMyPCs() {
    const container = $("myPCList");
    const pcs = getPCs();

    container.replaceChildren();

    if (!pcs.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Cloud PCs yet</h3>
                <p>Select a Cloud PC configuration to add one to your account.</p>
            </div>
        `;
        return;
    }

    pcs.forEach(pc => {
        const plan = cloudPCPlans[pc.planId];

        if (!plan) return;

        const item = document.createElement("div");
        item.className = "my-pc-item";

        const symbol = document.createElement("div");
        symbol.className = "pc-symbol";
        symbol.textContent = plan.icon;

        const info = document.createElement("div");
        info.className = "my-pc-info";

        const heading = document.createElement("h3");
        heading.textContent = pc.name;

        const details = document.createElement("p");
        details.textContent =
            `${plan.cpu} · ${plan.ram} RAM · ${plan.storage} · ${plan.price} CR/hour`;

        info.append(heading, details);

        const actions = document.createElement("div");
        actions.className = "my-pc-actions";

        const launch = document.createElement("button");
        launch.className = "primary-btn";
        launch.textContent = "Launch";
        launch.addEventListener("click", () => {
            selectedCloudPC = pc.planId;
            launchSelectedPC();
        });

        const remove = document.createElement("button");
        remove.className = "outline-btn";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => removePC(pc.id));

        actions.append(launch, remove);
        item.append(symbol, info, actions);

        container.appendChild(item);
    });
}

function removePC(pcId) {
    if (!confirm("Remove this saved Cloud PC configuration?")) return;

    const pcs = getPCs().filter(pc => pc.id !== pcId);

    setPCs(pcs);

    addHistory(
        "Cloud PC removed",
        "A saved Cloud PC configuration was removed.",
        "▤"
    );

    displayMyPCs();
    updateDashboard();

    showToast("Cloud PC removed.");
}

/* =========================================
   LAUNCH CLOUD PC
========================================= */

function launchSelectedPC() {
    const plan = cloudPCPlans[selectedCloudPC];

    if (!plan) {
        showToast("Select a Cloud PC first.");
        return;
    }

    const pcs = getPCs();
    const saved = pcs.find(pc => pc.planId === selectedCloudPC);

    if (!saved) {
        showToast("Save a Cloud PC configuration first.");
        return;
    }

    const credits = getCredits();

    if (credits < plan.price) {
        showToast("Not enough credits. Add credits to continue.");
        showDashboardPanel("credits");
        return;
    }

    setCredits(credits - plan.price);

    addHistory(
        "Cloud PC launched",
        `${plan.name} Cloud PC demo session started. One hour's demo charge: ${plan.price} credits.`,
        "▶"
    );

    $("desktopWelcome").textContent =
        `${plan.name} · ${plan.cpu} · ${plan.ram} RAM`;

    showScreen("desktopScreen");

    startDesktopClock();

    showToast(plan.name + " Cloud PC started. Demo credits deducted.");
}

function returnToDashboard() {
    openWindows = {};
    $("windowLayer").replaceChildren();

    showScreen("cloudDashboard");
    updateDashboard();
    displayMyPCs();
}

/* =========================================
   DEMO CREDITS
========================================= */

function addDemoCredits(amount) {
    const current = getCredits();

    setCredits(current + amount);

    addHistory(
        "Demo credits added",
        amount + " demo credits were added to your balance.",
        "◈"
    );

    updateDashboard();

    showToast(amount + " demo credits added.");
}

/* =========================================
   FILE TRANSFER
========================================= */

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function uploadCloudFiles() {
    const input = $("uploadInput");
    const files = Array.from(input.files || []);

    if (!files.length) {
        showToast("Select files before uploading.");
        return;
    }

    files.forEach(file => {
        transferredFiles.push({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file,
            uploaded: new Date().toLocaleString()
        });
    });

    addHistory(
        "Files selected for transfer",
        files.length + " file(s) added to the local transfer list.",
        "⇧"
    );

    input.value = "";

    displayTransferredFiles();

    showToast(files.length + " file(s) added to transfer list.");
}

function displayTransferredFiles() {
    const container = $("transferredFiles");

    if (!container) return;

    container.replaceChildren();

    if (!transferredFiles.length) {
        container.innerHTML = '<div class="file-row"><span class="file-name">No files in the transfer list.</span></div>';
        return;
    }

    transferredFiles.forEach(file => {
        const row = document.createElement("div");
        row.className = "file-row";

        const icon = document.createElement("span");
        icon.textContent = "📄";

        const name = document.createElement("span");
        name.className = "file-name";
        name.textContent = file.name;

        const size = document.createElement("small");
        size.textContent = formatFileSize(file.size);

        const download = document.createElement("button");
        download.textContent = "Download";
        download.addEventListener("click", () => downloadTransferredFile(file.id));

        row.append(icon, name, size, download);

        container.appendChild(row);
    });
}

function downloadTransferredFile(fileId) {
    const fileItem = transferredFiles.find(item => item.id === fileId);

    if (!fileItem) return;

    const url = URL.createObjectURL(fileItem.file);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileItem.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    addHistory(
        "File downloaded",
        fileItem.name + " was downloaded to your local device.",
        "⇩"
    );
}

function downloadCloudBackup() {
    const backup = {
        platform: "Cloud PC Demo",
        created: new Date().toISOString(),
        files: transferredFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            uploaded: file.uploaded
        }))
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cloudpc-transfer-list.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    addHistory(
        "Transfer list downloaded",
        "Your file transfer list was downloaded as a JSON file.",
        "⇩"
    );

    showToast("Transfer list downloaded.");
}

/* =========================================
   PROFILE
========================================= */

function saveProfile() {
    const name = $("profileName").value.trim();

    if (!name) {
        showToast("Enter a valid name.");
        return;
    }

    const profile = getProfile();

    profile.name = name;
    profile.contact = currentUser.loginId;

    writeStorage(STORAGE.profile, profile);

    const users = readStorage(STORAGE.users, []);

    const user = users.find(item => item.loginId === currentUser.loginId);

    if (user) {
        user.name = name;
        writeStorage(STORAGE.users, users);
        currentUser.name = name;
    }

    $("sidebarUserName").textContent = name;
    $("welcomeName").textContent = name;

    const initial = name.charAt(0).toUpperCase();

    $("sidebarAvatar").textContent = initial;
    $("headerAvatar").textContent = initial;
    $("profileAvatar").textContent = initial;

    addHistory(
        "Profile updated",
        "Your profile name was updated.",
        "◉"
    );

    showToast("Profile updated.");
}

/* =========================================
   SETTINGS
========================================= */

function changeAccent(color, save = true) {
    const colors = {
        gold: "#d9ad55",
        blue: "#62a7e8",
        purple: "#ad8be8",
        green: "#66c69a"
    };

    const selected = colors[color] ? color : "gold";

    document.documentElement.style.setProperty(
        "--accent",
        colors[selected]
    );

    const lightColors = {
        gold: "#f5d58c",
        blue: "#a3d0fa",
        purple: "#d0baff",
        green: "#a1e5c3"
    };

    document.documentElement.style.setProperty(
        "--accent-light",
        lightColors[selected]
    );

    $("accentSelect").value = selected;

    if (save) {
        const settings = readStorage(STORAGE.settings, {});
        settings.accent = selected;
        writeStorage(STORAGE.settings, settings);

        showToast("Accent color updated.");
    }
}

function toggleAnimations(enabled, save = true) {
    document.body.classList.toggle("no-animations", !enabled);

    if (save) {
        const settings = readStorage(STORAGE.settings, {});
        settings.animations = enabled;
        writeStorage(STORAGE.settings, settings);

        showToast(enabled ? "Animations enabled." : "Animations disabled.");
    }
}

function resetDemoData() {
    if (!confirm("This will clear your saved PCs, credits, history, settings and local account data. Continue?")) {
        return;
    }

    Object.values(STORAGE).forEach(key => {
        localStorage.removeItem(key);
    });

    transferredFiles = [];
    openWindows = {};
    currentUser = null;

    showScreen("loginScreen");

    showToast("Demo data reset.");
}

/* =========================================
   DESKTOP CLOCK
========================================= */

function updateDesktopClock() {
    const clock = $("desktopClock");

    if (!clock) return;

    const now = new Date();

    clock.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    }) + " · " + now.toLocaleDateString();
}

function startDesktopClock() {
    updateDesktopClock();

    if (window.desktopClockInterval) {
        clearInterval(window.desktopClockInterval);
    }

    window.desktopClockInterval = setInterval(updateDesktopClock, 1000);
}

/* =========================================
   START MENU
========================================= */

function toggleStartMenu() {
    $("startMenu").classList.toggle("hidden");
}

/* =========================================
   DESKTOP APPLICATIONS
========================================= */

const appDetails = {
    fileManager: { title: "File Manager", icon: "📁" },
    notepad: { title: "Notepad", icon: "📝" },
    calculator: { title: "Calculator", icon: "🧮" },
    browser: { title: "Browser", icon: "🌐" },
    terminal: { title: "Terminal", icon: "⌨" },
    settings: { title: "Settings", icon: "⚙" },
    about: { title: "About Cloud PC", icon: "ⓘ" },
    paint: { title: "Paint", icon: "🎨" }
};

function openApp(appName) {
    const app = appDetails[appName];

    if (!app) return;

    if (openWindows[appName]) {
        const existing = $("window-" + appName);

        if (existing) {
            existing.style.display = "flex";
            existing.style.zIndex = ++windowCounter;
        }

        return;
    }

    const windowElement = document.createElement("div");

    windowElement.className = "app-window";
    windowElement.id = "window-" + appName;
    windowElement.style.zIndex = ++windowCounter;

    const titlebar = document.createElement("div");
    titlebar.className = "window-titlebar";

    const title = document.createElement("strong");
    title.textContent = app.icon + "  " + app.title;

    const controls = document.createElement("div");
    controls.className = "window-controls";

    const minimize = document.createElement("button");
    minimize.textContent = "−";
    minimize.title = "Minimize";
    minimize.addEventListener("click", () => minimizeWindow(appName));

    const close = document.createElement("button");
    close.textContent = "×";
    close.title = "Close";
    close.addEventListener("click", () => closeWindow(appName));

    controls.append(minimize, close);
    titlebar.append(title, controls);

    const content = document.createElement("div");
    content.className = "window-content";
    content.innerHTML = getAppContent(appName);

    windowElement.append(titlebar, content);

    $("windowLayer").appendChild(windowElement);

    openWindows[appName] = true;

    titlebar.addEventListener("mousedown", (event) => {
        if (event.target.closest("button")) return;
        makeWindowDraggable(windowElement, event);
    });

    titlebar.addEventListener("touchstart", (event) => {
        if (event.target.closest("button")) return;
        makeWindowDraggable(windowElement, event.touches[0]);
    }, { passive: true });

    addTaskbarApp(appName);

    windowElement.addEventListener("mousedown", () => {
        windowElement.style.zIndex = ++windowCounter;
    });

    if (appName === "notepad") {
        loadNotepad();
    }

    if (appName === "calculator") {
        calculatorExpression = "";
    }

    if (appName === "terminal") {
        setupTerminal();
    }

    if (appName === "paint") {
        setupPaint();
    }
}

function closeWindow(appName) {
    const element = $("window-" + appName);

    if (element) element.remove();

    delete openWindows[appName];

    const taskbarButton = $("task-" + appName);

    if (taskbarButton) taskbarButton.remove();
}

function minimizeWindow(appName) {
    const element = $("window-" + appName);

    if (element) {
        element.style.display = "none";
    }
}

function addTaskbarApp(appName) {
    const container = $("taskbarApps");

    const button = document.createElement("button");
    button.className = "taskbar-app active";
    button.id = "task-" + appName;
    button.textContent = appDetails[appName].icon + " " + appDetails[appName].title;

    button.addEventListener("click", () => {
        const windowElement = $("window-" + appName);

        if (!windowElement) return;

        windowElement.style.display = "flex";
        windowElement.style.zIndex = ++windowCounter;
    });

    container.appendChild(button);
}

function makeWindowDraggable(element, startEvent) {
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;

    const rect = element.getBoundingClientRect();

    const originalLeft = rect.left;
    const originalTop = rect.top;

    element.style.transform = "none";
    element.style.left = originalLeft + "px";
    element.style.top = originalTop + "px";

    function move(event) {
        const x = event.clientX || event.touches?.[0]?.clientX;
        const y = event.clientY || event.touches?.[0]?.clientY;

        if (x === undefined || y === undefined) return;

        const maxLeft = window.innerWidth - element.offsetWidth;
        const maxTop = window.innerHeight - element.offsetHeight - 55;

        element.style.left = Math.max(0, Math.min(maxLeft, originalLeft + x - startX)) + "px";
        element.style.top = Math.max(55, Math.min(maxTop, originalTop + y - startY)) + "px";
    }

    function stop() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", stop);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", stop);
}

/* =========================================
   APPLICATION CONTENT
========================================= */

function getAppContent(appName) {
    switch (appName) {
        case "fileManager":
            return `
                <h3 style="margin-bottom:15px">This PC</h3>
                <div class="file-manager-list">
                    <div class="file-manager-item"><span>📁</span>Documents<small>Folder</small></div>
                    <div class="file-manager-item"><span>📁</span>Downloads<small>Folder</small></div>
                    <div class="file-manager-item"><span>📁</span>Pictures<small>Folder</small></div>
                    <div class="file-manager-item"><span>💽</span>Local Disk (C:)<small>System drive</small></div>
                    <div class="file-manager-item"><span>☁</span>Cloud Storage<small>Demo storage</small></div>
                </div>
                <p style="color:#888;margin-top:20px;font-size:10px">
                    This is a simulated file manager. It does not access a remote server.
                </p>
            `;

        case "notepad":
            return `
                <div style="height:100%;display:flex;flex-direction:column;gap:8px">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <span>Untitled document</span>
                        <button onclick="saveNotepad()">Save</button>
                    </div>
                    <textarea id="notepadText" placeholder="Start typing..."></textarea>
                </div>
            `;

        case "calculator":
            return `
                <div class="calculator">
                    <input id="calculatorDisplay" class="calculator-display" readonly value="0">
                    <div class="calculator-grid">
                        <button onclick="calculatorClear()">C</button>
                        <button onclick="calculatorAppend('/')">÷</button>
                        <button onclick="calculatorAppend('*')">×</button>
                        <button onclick="calculatorBackspace()">⌫</button>

                        <button onclick="calculatorAppend('7')">7</button>
                        <button onclick="calculatorAppend('8')">8</button>
                        <button onclick="calculatorAppend('9')">9</button>
                        <button onclick="calculatorAppend('-')">−</button>

                        <button onclick="calculatorAppend('4')">4</button>
                        <button onclick="calculatorAppend('5')">5</button>
                        <button onclick="calculatorAppend('6')">6</button>
                        <button onclick="calculatorAppend('+')">+</button>

                        <button onclick="calculatorAppend('1')">1</button>
                        <button onclick="calculatorAppend('2')">2</button>
                        <button onclick="calculatorAppend('3')">3</button>
                        <button onclick="calculatorCalculate()" style="grid-row:span 2">=</button>

                        <button onclick="calculatorAppend('0')" style="grid-column:span 2">0</button>
                        <button onclick="calculatorAppend('.')">.</button>
                    </div>
                </div>
            `;

        case "browser":
            return `
                <div class="browser-bar">
                    <input id="browserAddress" placeholder="Enter a website address">
                    <button onclick="browserSearch()">Go</button>
                </div>
                <div id="browserMessage" class="browser-message">
                    <h2 style="color:var(--accent-light);margin-bottom:10px">Cloud Browser</h2>
                    This is a demonstration browser interface. Enter a website address to open it in a new browser tab.
                </div>
            `;

        case "terminal":
            return `
                <div id="terminalOutput" class="terminal-output">
Cloud PC Demo Terminal
Type help to see available commands.

            </div>
            <input id="terminalInput" class="terminal-input" placeholder="Enter command and press Enter">
            `;

        case "settings":
            return `
                <h3>Desktop Settings</h3>
                <p style="color:#999;margin:12px 0">Customize the demo desktop.</p>
                <button onclick="changeAccent('gold')">Gold theme</button>
                <button onclick="changeAccent('blue')">Blue theme</button>
                <button onclick="changeAccent('purple')">Purple theme</button>
                <button onclick="changeAccent('green')">Green theme</button>
                <p style="margin-top:20px;color:#999">Account settings are available in the Cloud PC Dashboard.</p>
            `;

        case "about":
            return `
                <h2 style="color:var(--accent-light);margin-bottom:12px">Cloud PC</h2>
                <p style="line-height:1.8;color:#aaa">
                    Cloud PC is a browser-based desktop demonstration.
                    It illustrates how users could access remote computing resources
                    from different devices.
                </p>
                <p style="margin-top:15px;color:#888">
                    This desktop is a front-end simulation, not a live virtual machine.
                </p>
            `;

        case "paint":
            return `
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
                    <label>Brush color</label>
                    <input type="color" id="paintColor" value="#111111">
                    <button onclick="clearPaint()">Clear canvas</button>
                    <button onclick="downloadPaint()">Download image</button>
                </div>
                <canvas id="paintCanvas" class="paint-canvas" width="900" height="450"></canvas>
            `;

        default:
            return "<p>Application not found.</p>";
    }
}

/* =========================================
   NOTEPAD
========================================= */

function loadNotepad() {
    const textarea = $("notepadText");

    if (!textarea) return;

    textarea.value = readStorage(STORAGE.notepad, "");
}

function saveNotepad() {
    const textarea = $("notepadText");

    if (!textarea) return;

    writeStorage(STORAGE.notepad, textarea.value);

    addHistory(
        "Notepad saved",
        "Your demo Notepad document was saved in this browser.",
        "📝"
    );

    showToast("Document saved.");
}

/* =========================================
   CALCULATOR
========================================= */

function calculatorAppend(value) {
    const display = $("calculatorDisplay");

    if (!display) return;

    calculatorExpression += value;
    display.value = calculatorExpression;
}

function calculatorClear() {
    calculatorExpression = "";

    const display = $("calculatorDisplay");

    if (display) display.value = "0";
}

function calculatorBackspace() {
    calculatorExpression = calculatorExpression.slice(0, -1);

    const display = $("calculatorDisplay");

    if (display) display.value = calculatorExpression || "0";
}

function calculatorCalculate() {
    const display = $("calculatorDisplay");

    if (!display) return;

    try {
        if (!calculatorExpression || !/^[0-9+\-*/().\s]+$/.test(calculatorExpression)) {
            throw new Error("Invalid expression");
        }

        const result = Function('"use strict"; return (' + calculatorExpression + ')')();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        calculatorExpression = String(result);
        display.value = calculatorExpression;

    } catch (error) {
        display.value = "Error";
        calculatorExpression = "";
    }
}

/* =========================================
   BROWSER DEMO
========================================= */

function browserSearch() {
    const input = $("browserAddress");

    if (!input) return;

    let address = input.value.trim();

    if (!address) {
        showToast("Enter a website address.");
        return;
    }

    if (!/^https?:\/\//i.test(address)) {
        address = "https://" + address;
    }

    try {
        const url = new URL(address);

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid protocol");
        }

        const message = $("browserMessage");

        if (message) {
            message.textContent = "Opening " + url.hostname + " in a new browser tab.";
        }

        window.open(url.href, "_blank", "noopener,noreferrer");

    } catch (error) {
        showToast("Enter a valid website address.");
    }
}

/* =========================================
   TERMINAL DEMO
========================================= */

function setupTerminal() {
    const input = $("terminalInput");

    if (!input) return;

    input.addEventListener("keydown", function(event) {
        if (event.key !== "Enter") return;

        const command = input.value.trim().toLowerCase();
        const output = $("terminalOutput");

        const commands = {
            help: "Available commands: help, date, time, whoami, clear, credits, pc, version",
            whoami: "cloud-user",
            credits: "Available demo credits: " + getCredits() + " CR",
            pc: "Current PC: " + (cloudPCPlans[selectedCloudPC]?.name || "Not selected"),
            version: "Cloud PC Demo OS version 1.0",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        if (command === "clear") {
            output.textContent = "";
        } else {
            output.textContent +=
                "\n> " + command + "\n" +
                (commands[command] || "Command not recognized. Type help.") +
                "\n";
        }

        input.value = "";
        output.scrollTop = output.scrollHeight;
    });
}

/* =========================================
   PAINT
========================================= */

let paintDrawing = false;

function setupPaint() {
    const canvas = $("paintCanvas");

    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    function getPosition(event) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height
        };
    }

    canvas.onpointerdown = function(event) {
        paintDrawing = true;

        const position = getPosition(event);

        context.beginPath();
        context.moveTo(position.x, position.y);

        canvas.setPointerCapture(event.pointerId);
    };

    canvas.onpointermove = function(event) {
        if (!paintDrawing) return;

        const position = getPosition(event);

        context.strokeStyle = $("paintColor").value;
        context.lineWidth = 5;
        context.lineCap = "round";

        context.lineTo(position.x, position.y);
        context.stroke();
    };

    canvas.onpointerup = function() {
        paintDrawing = false;
    };

    canvas.onpointercancel = function() {
        paintDrawing = false;
    };
}

function clearPaint() {
    const canvas = $("paintCanvas");

    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function downloadPaint() {
    const canvas = $("paintCanvas");

    if (!canvas) return;

    const anchor = document.createElement("a");
    anchor.download = "cloudpc-paint.png";
    anchor.href = canvas.toDataURL("image/png");
    anchor.click();
}

/* =========================================
   PARTICLE BACKGROUND
========================================= */

function setupParticles() {
    const canvas = $("particleCanvas");

    if (!canvas) return;

    const context = canvas.getContext("2d");

    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;

        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * ratio;
        canvas.height = height * ratio;

        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        particles = [];

        const count = Math.min(65, Math.floor(width / 20));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + .4,
                speed: Math.random() * .25 + .08,
                opacity: Math.random() * .45 + .1
            });
        }
    }

    function animate() {
        context.clearRect(0, 0, width, height);

        particles.forEach(particle => {
            particle.y -= particle.speed;

            if (particle.y < 0) {
                particle.y = height;
                particle.x = Math.random() * width;
            }

            context.beginPath();
            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            context.fillStyle = `rgba(217,173,85,${particle.opacity})`;
            context.fill();
        });

        requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
}

/* =========================================
   INITIALIZE PROJECT
========================================= */

document.addEventListener("DOMContentLoaded", function() {
    setupParticles();
    restoreSession();
    updateDesktopClock();
});