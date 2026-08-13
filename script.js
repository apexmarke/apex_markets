// ================================
// APEX MARKETS - MAIN SCRIPT
// ================================


// ================================
// CREATE ACCOUNT
// ================================

async function createAccount() {

    const name =
        document.getElementById("name")?.value.trim();

    const email =
        document.getElementById("email")?.value.trim();

    const password =
        document.getElementById("password")?.value;


    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }


    if (password.length < 6) {
        alert("Password should be at least 6 characters.");
        return;
    }


    if (typeof supabaseClient === "undefined") {
        alert("Supabase connection is not available.");
        return;
    }


    try {

        // Create Supabase authentication account
        const {
            data,
            error
        } = await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {
                data: {
                    full_name: name
                }
            }

        });


        if (error) {

            alert(error.message);
            return;

        }


        if (!data.user) {

            alert(
                "Account created, but no user was returned."
            );

            return;

        }


        // ==========================================
        // CREATE PROFILE
        // ==========================================

        const {
            error: profileError
        } = await supabaseClient
            .from("Profile")
            .insert({

                id: data.user.id,

                full_name: name,

                email: email,

                balance: 10000

            });


        if (profileError) {

            console.error(
                "Profile creation error:",
                profileError
            );

            alert(
                "Account was created, but profile creation failed:\n\n" +
                profileError.message
            );

            return;

        }


        // ==========================================
        // SAVE LOCAL INFORMATION
        // ==========================================

        localStorage.setItem(
            "apexName",
            name
        );

        localStorage.setItem(
            "apexEmail",
            email
        );

        localStorage.setItem(
            "apexLoggedIn",
            "true"
        );

        localStorage.setItem(
            "apexBalance",
            "10000"
        );

        localStorage.setItem(
            "apexTradingMode",
            "demo"
        );


        alert(
            "Account created successfully!"
        );


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to create account. " +
            error.message
        );

    }

}



// ================================
// LOGIN
// ================================

async function login() {

    const email =
        document.getElementById(
            "loginEmail"
        )?.value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        )?.value;


    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;

    }


    if (
        typeof supabaseClient === "undefined"
    ) {

        alert(
            "Supabase connection is not available."
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


        if (error) {

            alert(error.message);

            return;

        }


        localStorage.setItem(
            "apexLoggedIn",
            "true"
        );


        if (
            data.user?.user_metadata?.full_name
        ) {

            localStorage.setItem(
                "apexName",
                data.user.user_metadata.full_name
            );

        }


        localStorage.setItem(
            "apexEmail",
            data.user?.email || email
        );


        // Get balance from Profile
        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("Profile")
            .select("balance, full_name")
            .eq("id", data.user.id)
            .maybeSingle();


        if (!profileError && profile) {

            localStorage.setItem(
                "apexBalance",
                String(profile.balance ?? 10000)
            );


            if (profile.full_name) {

                localStorage.setItem(
                    "apexName",
                    profile.full_name
                );

            }

        } else {

            if (
                !localStorage.getItem(
                    "apexBalance"
                )
            ) {

                localStorage.setItem(
                    "apexBalance",
                    "10000"
                );

            }

        }


        if (
            !localStorage.getItem(
                "apexTradingMode"
            )
        ) {

            localStorage.setItem(
                "apexTradingMode",
                "demo"
            );

        }


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to sign in. " +
            error.message
        );

    }

}



// ================================
// LOGOUT
// ================================

async function logout() {

    try {

        if (
            typeof supabaseClient !== "undefined"
        ) {

            await supabaseClient.auth.signOut();

        }

    } catch (error) {

        console.error(error);

    }


    localStorage.setItem(
        "apexLoggedIn",
        "false"
    );


    window.location.href =
        "login.html";

}



// ================================
// TRADING MODE
// ================================

function setTradingMode(mode) {

    localStorage.setItem(
        "apexTradingMode",
        mode
    );


    const demoButton =
        document.getElementById(
            "demoModeBtn"
        );

    const realButton =
        document.getElementById(
            "realModeBtn"
        );

    const message =
        document.getElementById(
            "modeMessage"
        );


    if (demoButton) {

        demoButton.classList.toggle(
            "active",
            mode === "demo"
        );

    }


    if (realButton) {

        realButton.classList.toggle(
            "active",
            mode === "real"
        );

    }


    if (message) {

        if (mode === "demo") {

            message.textContent =
                "Demo Mode — simulated trading only.";

        } else {

            message.textContent =
                "Real Mode — real-money trading is not currently enabled.";

        }

    }

}



// ================================
// LOAD TRADING MODE
// ================================

function loadTradingMode() {

    const mode =
        localStorage.getItem(
            "apexTradingMode"
        ) || "demo";


    setTradingMode(mode);

}



// ================================
// ACCOUNT BALANCE
// ================================

function updateAccountDisplay() {

    const balance =
        Number(
            localStorage.getItem(
                "apexBalance"
            ) || 10000
        );


    const balanceElement =
        document.getElementById(
            "balance"
        );


    if (balanceElement) {

        balanceElement.textContent =
            "$" + balance.toFixed(2);

    }

}



// ================================
// PLACE DEMO ORDER
// ================================

function placeOrder(side) {

    const mode =
        localStorage.getItem(
            "apexTradingMode"
        ) || "demo";


    if (mode !== "demo") {

        alert(
            "Real-money trading is not enabled yet. " +
            "Switch to Demo Mode to place a simulated trade."
        );

        return;

    }


    const market =
    document.getElementById(
        "selectedMarket"
    )?.textContent.trim() ||
    "Volatility 10";


    const amount =
        Number(
            document.getElementById(
                "tradeAmount"
            )?.value
        );


    if (!amount || amount <= 0) {

        alert(
            "Enter a valid trade amount."
        );

        return;

    }


    let balance =
        Number(
            localStorage.getItem(
                "apexBalance"
            ) || 10000
        );


    if (amount > balance) {

        alert(
            "Insufficient demo balance."
        );

        return;

    }


    balance -= amount;


    localStorage.setItem(
        "apexBalance",
        balance.toString()
    );


    alert(
        side +
        " demo order placed for $" +
        amount.toFixed(2) +
        " on " +
        market +
        "."
    );


    updateAccountDisplay();

}



// ================================
// DEPOSIT & WITHDRAWAL
// ================================

async function showRealFeature(feature) {

    if (
        typeof supabaseClient === "undefined"
    ) {

        alert(
            "Supabase connection is not available."
        );

        return;

    }


    let user;


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error || !data.user) {

            alert(
                "Please log in again."
            );

            return;

        }


        user = data.user;

    } catch (error) {

        console.error(error);

        alert(
            "Unable to verify your account."
        );

        return;

    }



    // ==============================
    // DEPOSIT
    // ==============================

    if (feature === "deposit") {

        const phone =
            prompt(
                "Enter your M-Pesa phone number:"
            );


        if (!phone) {
            return;
        }


        const amountInput =
            prompt(
                "Enter deposit amount:"
            );


        const amount =
            Number(amountInput);


        if (!amount || amount <= 0) {

            alert(
                "Please enter a valid amount."
            );

            return;

        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("deposits")
                    .insert({

                        user_id: user.id,

                        amount: amount,

                        phone: phone,

                        status: "pending"

                    });


            if (error) {

                console.error(error);

                alert(
                    "Deposit request failed: " +
                    error.message
                );

                return;

            }


            alert(
                "Deposit request submitted successfully!\n\n" +
                "Amount: $" +
                amount.toFixed(2) +
                "\n" +
                "Phone: " +
                phone +
                "\n" +
                "Status: Pending"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Unable to submit deposit: " +
                error.message
            );

        }


        return;

    }



    // ==============================
    // WITHDRAWAL
    // ==============================

    if (feature === "withdraw") {

        const amountInput =
            prompt(
                "Enter withdrawal amount:"
            );


        const amount =
            Number(amountInput);


        if (!amount || amount <= 0) {

            alert(
                "Please enter a valid withdrawal amount."
            );

            return;

        }


        const phone =
            prompt(
                "Enter your M-Pesa phone number:"
            );


        if (!phone) {
            return;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("withdrawals")
                    .insert({

                        user_id: user.id,

                        amount: amount,

                        phone: phone,

                        status: "pending"

                    });


            if (error) {

                console.error(error);

                alert(
                    "Withdrawal request failed: " +
                    error.message
                );

                return;

            }


            alert(
                "Withdrawal request submitted successfully!\n\n" +
                "Amount: $" +
                amount.toFixed(2) +
                "\n" +
                "Phone: " +
                phone +
                "\n" +
                "Status: Pending"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Unable to submit withdrawal: " +
                error.message
            );

        }


        return;

    }

}



// ================================
// SECURITY MESSAGE
// ================================

function showSecurityMessage() {

    alert(
        "Apex Markets is currently a demo/learning platform. " +
        "Secure server-side payment processing must be added " +
        "before real-money transactions can be enabled."
    );

}



// ================================
// ADMIN DASHBOARD
// ================================

async function loadAdminDashboard() {

    const usersTable =
        document.getElementById(
            "usersTable"
        );

    const totalUsers =
        document.getElementById(
            "totalUsers"
        );

    const activeUsers =
        document.getElementById(
            "activeUsers"
        );


    // Not on admin page
    if (!usersTable) {
        return;
    }


    // Check Supabase
    if (
        typeof supabaseClient === "undefined"
    ) {

        if (totalUsers) {
            totalUsers.textContent = "0";
        }

        if (activeUsers) {
            activeUsers.textContent = "0";
        }

        return;

    }


    try {

        // ======================================
        // LOAD ALL PROFILES
        // ======================================

        const {
            data: users,
            error
        } =
            await supabaseClient
                .from("Profile")
                .select(
                    "id, full_name, email, balance, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Profile loading error:",
                error
            );

            alert(
                "Unable to load customers: " +
                error.message
            );

            return;

        }


        const customers =
            users || [];


        // ======================================
        // TOTAL USERS
        // ======================================

        if (totalUsers) {

            totalUsers.textContent =
                customers.length;

        }


        // ======================================
        // ACTIVE USERS
        // ======================================
        //
        // We don't have a real online-status
        // system yet. Therefore we display the
        // number of registered users here.
        //

        if (activeUsers) {

            activeUsers.textContent =
                customers.length;

        }


        // ======================================
        // DISPLAY USERS
        // ======================================

        if (customers.length === 0) {

            usersTable.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            No registered customers yet.
                        </div>
                    </td>
                </tr>
            `;

        } else {

            usersTable.innerHTML =
                customers.map(
                    user => {

                        const name =
                            user.full_name ||
                            "Customer";

                        const email =
                            user.email ||
                            "—";

                        const balance =
                            Number(
                                user.balance || 0
                            );


                        return `
                            <tr>

                                <td>
                                    ${escapeHTML(name)}
                                </td>

                                <td>
                                    ${escapeHTML(email)}
                                </td>

                                <td>
                                    <span class="status status-verified">
                                        Registered
                                    </span>
                                </td>

                                <td>
                                    $${balance.toFixed(2)}
                                </td>

                            </tr>
                        `;

                    }
                ).join("");

        }


        // ======================================
        // LOAD DEPOSITS
        // ======================================

        await loadAdminDeposits();


        // ======================================
        // LOAD WITHDRAWALS
        // ======================================

        await loadAdminWithdrawals();


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        alert(
            "Admin dashboard error: " +
            error.message
        );

    }

}



// ================================
// ADMIN DEPOSITS
// ================================

async function loadAdminDeposits() {

    const table =
        document.getElementById(
            "depositsTable"
        );


    if (!table) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("deposits")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Deposit loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        Unable to load deposits.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    const deposits =
        data || [];


    if (deposits.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No deposit records available.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        deposits.map(
            deposit => {

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                deposit.id || "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                deposit.user_id || "—"
                            )}
                        </td>

                        <td>
                            $${Number(
                                deposit.amount || 0
                            ).toFixed(2)}
                        </td>

                        <td>
                            <span class="status status-pending">
                                ${escapeHTML(
                                    deposit.status || "pending"
                                )}
                            </span>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}



// ================================
// ADMIN WITHDRAWALS
// ================================

async function loadAdminWithdrawals() {

    const table =
        document.getElementById(
            "withdrawalsTable"
        );


    if (!table) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("withdrawals")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Withdrawal loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        Unable to load withdrawals.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    const withdrawals =
        data || [];


    if (withdrawals.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No withdrawal records available.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        withdrawals.map(
            withdrawal => {

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                withdrawal.id || "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                withdrawal.user_id || "—"
                            )}
                        </td>

                        <td>
                            $${Number(
                                withdrawal.amount || 0
                            ).toFixed(2)}
                        </td>

                        <td>
                            <span class="status status-pending">
                                ${escapeHTML(
                                    withdrawal.status || "pending"
                                )}
                            </span>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}



// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}



// ================================
// ADMIN REFRESH
// ================================

function refreshAdmin() {

    loadAdminDashboard();

}



// ================================
// SEARCH USERS
// ================================

async function searchUsers() {

    const search =
        document.getElementById(
            "userSearch"
        )?.value.trim();


    if (!search) {

        alert(
            "Enter a user name or email to search."
        );

        return;

    }


    if (
        typeof supabaseClient === "undefined"
    ) {

        alert(
            "Supabase connection is not available."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("Profile")
            .select(
                "id, full_name, email, balance"
            )
            .or(
                `full_name.ilike.%${search}%,email.ilike.%${search}%`
            );


    if (error) {

        console.error(error);

        alert(
            "Search failed: " +
            error.message
        );

        return;

    }


    const table =
        document.getElementById(
            "usersTable"
        );


    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No matching customers found.
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        data.map(
            user => {

                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                user.full_name || "Customer"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                user.email || "—"
                            )}
                        </td>

                        <td>
                            <span class="status status-verified">
                                Registered
                            </span>
                        </td>

                        <td>
                            $${Number(
                                user.balance || 0
                            ).toFixed(2)}
                        </td>

                    </tr>
                `;

            }
        ).join("");

}



// ================================
// ADMIN LOGOUT
// ================================

function adminLogout() {

    window.location.href =
        "index.html";

}

// ================================
// PAGE INITIALIZATION
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTradingMode();

        updateAccountDisplay();

        loadAdminDashboard();

    }
    function createTradingChart() {

    chartCanvas =
        document.getElementById("tradingChart");

    if (!chartCanvas) return;

    chartCtx =
        chartCanvas.getContext("2d");

    chartData = [];

    /*
     * Start with the selected market price.
     */

    const priceElement =
        document.getElementById("chartPrice");

    let text =
        priceElement?.textContent || "";

    let match =
        text.match(/[\d,.]+/);

    let price =
        match
            ? Number(match[0].replace(/,/g, ""))
            : 1000.24;


    /*
     * Create initial history.
     */

    for (let i = 0; i < 70; i++) {

        price +=
            (Math.random() - 0.5) *
            Math.max(price * 0.003, 1);

        chartData.push({

            price: price,

            time:
                new Date(
                    Date.now() -
                    (70 - i) * 10000
                )

        });

    }


    resizeTradingChart();

    window.addEventListener(
        "resize",
        resizeTradingChart
    );


    drawTradingChart();


    clearInterval(chartTimer);


    chartTimer =
        setInterval(
            updateTradingChart,
            1500
        );

}


// ================================
// RESIZE CHART
// ================================

function resizeTradingChart() {

    if (!chartCanvas) return;

    const rect =
        chartCanvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    chartCanvas.width =
        rect.width * dpr;

    chartCanvas.height =
        rect.height * dpr;

    chartCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    drawTradingChart();
}


// ================================
// UPDATE CHART
// ================================

function updateTradingChart() {

    if (!chartData.length) return;

    const last =
        chartData[chartData.length - 1].price;

    // Small simulated price movement
    const movement =
        (Math.random() - 0.48) * 1000;

    const newPrice =
        Math.max(
            1000,
            last + movement
        );

    chartData.push({

        price: newPrice,

        time: new Date()

    });

    // Keep the chart at 60 candles/points
    if (chartData.length > 60) {

        chartData.shift();

    }

    drawTradingChart();
}

// ================================
// APEX MARKETS - TRADING CHART
// ================================

let chartData = [];
let chartCanvas;
let chartCtx;
let chartTimer;


// ================================
// GET SELECTED PRICE
// ================================

function getSelectedChartPrice() {

    const text =
        document.getElementById("chartPrice")
        ?.textContent || "";

    const match =
        text.match(/[\d,.]+/);

    if (match) {

        return Number(
            match[0].replace(/,/g, "")
        );

    }

    return 1000.24;
}


// ================================
// CREATE CHART
// ================================

function createTradingChart() {

    chartCanvas =
        document.getElementById(
            "tradingChart"
        );

    if (!chartCanvas) return;

    chartCtx =
        chartCanvas.getContext("2d");

    chartData = [];

    let price =
        getSelectedChartPrice();


    // Create chart history

    for (let i = 0; i < 60; i++) {

        const movement =
            (Math.random() - 0.5) *
            Math.max(price * 0.002, 1);

        price =
            Math.max(
                0.01,
                price + movement
            );

        chartData.push({

            price: price,

            time:
                new Date(
                    Date.now() -
                    (60 - i) * 10000
                )

        });

    }


    resizeTradingChart();

    window.removeEventListener(
        "resize",
        resizeTradingChart
    );

    window.addEventListener(
        "resize",
        resizeTradingChart
    );


    drawTradingChart();


    clearInterval(chartTimer);

    chartTimer =
        setInterval(
            updateTradingChart,
            1500
        );

}


// ================================
// UPDATE CHART
// ================================

function updateTradingChart() {

    if (!chartData.length) return;


    const last =
        chartData[
            chartData.length - 1
        ].price;


    const movement =
        (Math.random() - 0.48) *
        Math.max(last * 0.0025, 1);


    const newPrice =
        Math.max(
            0.01,
            last + movement
        );


    chartData.push({

        price: newPrice,

        time: new Date()

    });


    if (chartData.length > 60) {

        chartData.shift();

    }


    drawTradingChart();

}


// ================================
// DRAW CHART
// ================================

function drawTradingChart() {

    if (
        !chartCanvas ||
        !chartCtx ||
        !chartData.length
    ) {

        return;

    }


    const width =
        chartCanvas.clientWidth;

    const height =
        chartCanvas.clientHeight;


    if (!width || !height) return;


    const ctx =
        chartCtx;


    // Make canvas match display size

    const dpr =
        window.devicePixelRatio || 1;


    if (
        chartCanvas.width !==
        width * dpr ||
        chartCanvas.height !==
        height * dpr
    ) {

        chartCanvas.width =
            width * dpr;

        chartCanvas.height =
            height * dpr;

    }


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // ============================
    // CHART AREA
    // ============================

    const left = 10;
    const right = 65;
    const top = 15;
    const bottom = 32;


    const chartWidth =
        width -
        left -
        right;


    const chartHeight =
        height -
        top -
        bottom;


    if (
        chartWidth <= 0 ||
        chartHeight <= 0
    ) {

        return;

    }


    // ============================
    // BACKGROUND
    // ============================

    ctx.fillStyle =
        "#081426";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // ============================
    // PRICE RANGE
    // ============================

    const prices =
        chartData.map(
            item => item.price
        );


    let maxPrice =
        Math.max(...prices);


    let minPrice =
        Math.min(...prices);


    let range =
        maxPrice - minPrice;


    if (!range) {

        range =
            Math.max(
                maxPrice * 0.01,
                1
            );

    }


    const padding =
        range * 0.15;


    maxPrice += padding;
    minPrice -= padding;


    // ============================
    // GRID
    // ============================

    ctx.strokeStyle =
        "rgba(148,163,184,0.12)";

    ctx.lineWidth = 1;


    // Horizontal grid

    for (let i = 0; i <= 5; i++) {

        const y =
            top +
            chartHeight *
            (i / 5);


        ctx.beginPath();

        ctx.moveTo(
            left,
            y
        );

        ctx.lineTo(
            left + chartWidth,
            y
        );

        ctx.stroke();


        const value =
            maxPrice -
            (
                maxPrice -
                minPrice
            ) *
            (i / 5);


        ctx.fillStyle =
            "#71869d";

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "left";


        ctx.fillText(
            value >= 100
                ? Math.round(value).toLocaleString()
                : value.toFixed(2),
            left + chartWidth + 5,
            y + 3
        );

    }


    // Vertical grid

    for (let i = 0; i <= 6; i++) {

        const x =
            left +
            chartWidth *
            (i / 6);


        ctx.beginPath();

        ctx.moveTo(
            x,
            top
        );

        ctx.lineTo(
            x,
            top + chartHeight
        );

        ctx.stroke();

    }


    // ============================
    // CREATE POINTS
    // ============================

    const points =
        chartData.map(
            (item, index) => {

                const x =
                    left +
                    chartWidth *
                    (
                        index /
                        (chartData.length - 1)
                    );


                const y =
                    top +
                    (
                        (
                            maxPrice -
                            item.price
                        ) /
                        (
                            maxPrice -
                            minPrice
                        )
                    ) *
                    chartHeight;


                return {
                    x: x,
                    y: y
                };

            }
        );


    // ============================
    // AREA FILL
    // ============================

    const gradient =
        ctx.createLinearGradient(
            0,
            top,
            0,
            top + chartHeight
        );


    gradient.addColorStop(
        0,
        "rgba(56,189,248,0.20)"
    );


    gradient.addColorStop(
        1,
        "rgba(56,189,248,0.00)"
    );


    ctx.beginPath();


    ctx.moveTo(
        points[0].x,
        top + chartHeight
    );


    points.forEach(
        point => {

            ctx.lineTo(
                point.x,
                point.y
            );

        }
    );


    ctx.lineTo(
        points[
            points.length - 1
        ].x,
        top + chartHeight
    );


    ctx.closePath();


    ctx.fillStyle =
        gradient;

    ctx.fill();


    // ============================
    // PRICE LINE
    // ============================

    ctx.beginPath();


    ctx.moveTo(
        points[0].x,
        points[0].y
    );


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        ctx.lineTo(
            points[i].x,
            points[i].y
        );

    }


    ctx.strokeStyle =
        "#38bdf8";

    ctx.lineWidth = 2;


    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";


    ctx.stroke();


    // ============================
    // CURRENT PRICE
    // ============================

    const lastPoint =
        points[
            points.length - 1
        ];


    const currentPrice =
        chartData[
            chartData.length - 1
        ].price;


    // Current price line

    ctx.setLineDash([
        4,
        4
    ]);


    ctx.strokeStyle =
        "rgba(56,189,248,0.45)";


    ctx.beginPath();

    ctx.moveTo(
        left,
        lastPoint.y
    );

    ctx.lineTo(
        left + chartWidth,
        lastPoint.y
    );

    ctx.stroke();


    ctx.setLineDash([]);


    // Current point

    ctx.beginPath();

    ctx.arc(
        lastPoint.x,
        lastPoint.y,
        4,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#38bdf8";

    ctx.fill();


    // ============================
    // CURRENT PRICE LABEL
    // ============================

    ctx.fillStyle =
        "#38bdf8";


    ctx.fillRect(
        left + chartWidth + 2,
        lastPoint.y - 10,
        60,
        20
    );


    ctx.fillStyle =
        "#00111f";


    ctx.font =
        "bold 10px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        currentPrice >= 100
            ? Math.round(currentPrice)
                .toLocaleString()
            : currentPrice.toFixed(2),

        left +
        chartWidth +
        32,

        lastPoint.y + 3
    );


    // ============================
    // TIME LABELS
    // ============================

    ctx.fillStyle =
        "#71869d";


    ctx.font =
        "10px Arial";


    ctx.textAlign =
        "center";


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const index =
            Math.floor(
                (
                    chartData.length - 1
                ) *
                (i / 5)
            );


        const point =
            points[index];


        const date =
            chartData[index].time;


        const time =
            date.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        ctx.fillText(
            time,
            point.x,
            height - 10
        );

    }

}
