function createAccount() {
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    if (password.length < 6) {
        alert("Password should be at least 6 characters.");
        return;
    }

    localStorage.setItem("apexName", name);
    localStorage.setItem("apexEmail", email);
    localStorage.setItem("apexPassword", password);
    localStorage.setItem("apexLoggedIn", "true");
    localStorage.setItem("apexBalance", "10000");
    localStorage.setItem("apexTradingMode", "demo");

    alert("Account created successfully! Welcome to Apex Markets.");

    window.location.href = "dashboard.html";
}

function login() {
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    const savedEmail = localStorage.getItem("apexEmail");
    const savedPassword = localStorage.getItem("apexPassword");

    if (email === savedEmail && password === savedPassword) {
        localStorage.setItem("apexLoggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect email or password.");
    }
}

function logout() {
    localStorage.setItem("apexLoggedIn", "false");
    window.location.href = "login.html";
}

function setTradingMode(mode) {
    localStorage.setItem("apexTradingMode", mode);

    const demoButton = document.getElementById("demoModeBtn");
    const realButton = document.getElementById("realModeBtn");
    const message = document.getElementById("modeMessage");

    if (demoButton) {
        demoButton.classList.toggle("active", mode === "demo");
    }

    if (realButton) {
        realButton.classList.toggle("active", mode === "real");
    }

    if (message) {
        if (mode === "demo") {
            message.textContent = "Demo Mode — simulated trading only.";
        } else {
            message.textContent =
                "Real Mode — real-money trading is not currently enabled.";
        }
    }
}

function loadTradingMode() {
    const mode =
        localStorage.getItem("apexTradingMode") || "demo";

    setTradingMode(mode);
}

function updateAccountDisplay() {
    const balance =
        Number(localStorage.getItem("apexBalance") || 10000);

    const balanceElement =
        document.getElementById("balance");

    if (balanceElement) {
        balanceElement.textContent =
            "$" + balance.toFixed(2);
    }
}

function placeOrder(side) {
    const mode =
        localStorage.getItem("apexTradingMode") || "demo";

    if (mode !== "demo") {
        alert(
            "Real-money trading is not enabled yet. " +
            "Switch to Demo Mode to place a simulated trade."
        );
        return;
    }

    const market =
        document.getElementById("market")?.value || "BTC/USD";

    const amount =
        Number(document.getElementById("tradeAmount")?.value);

    if (!amount || amount <= 0) {
        alert("Enter a valid trade amount.");
        return;
    }

    let balance =
        Number(localStorage.getItem("apexBalance") || 10000);

    if (amount > balance) {
        alert("Insufficient demo balance.");
        return;
    }

    balance -= amount;

    localStorage.setItem(
        "apexBalance",
        balance.toString()
    );

    alert(
        side + " demo order placed for $" +
        amount.toFixed(2) +
        " on " +
        market +
        "."
    );

    updateAccountDisplay();
}

function showRealFeature(feature) {
    if (feature === "deposit") {
        alert(
            "Deposits are not available yet. " +
            "Real-money payment processing has not been enabled."
        );
    }

    if (feature === "withdraw") {
        alert(
            "Withdrawals are not available yet."
        );
    }
}

function showSecurityMessage() {
    alert(
        "Apex Markets is currently a demo/learning platform. " +
        "Secure server-side authentication and payment systems " +
        "must be added before real-money trading can be enabled."
    );
}
