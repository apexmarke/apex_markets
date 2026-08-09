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
            "market"
        )?.value || "BTC/USD";


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
);
