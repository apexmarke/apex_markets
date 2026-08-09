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


        // Save user information locally

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

    // Check Supabase connection

    if (
        typeof supabaseClient === "undefined"
    ) {

        alert(
            "Supabase connection is not available."
        );

        return;

    }


    // Get logged-in user

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

function loadAdminDashboard() {

    const name =
        localStorage.getItem(
            "apexName"
        );

    const email =
        localStorage.getItem(
            "apexEmail"
        );

    const balance =
        localStorage.getItem(
            "apexBalance"
        );

    const loggedIn =
        localStorage.getItem(
            "apexLoggedIn"
        );


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


    if (!usersTable) {
        return;
    }


    if (!name || !email) {

        usersTable.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        No user account found on this device.
                    </div>
                </td>
            </tr>
        `;


        if (totalUsers) {

            totalUsers.textContent =
                "0";

        }


        if (activeUsers) {

            activeUsers.textContent =
                "0";

        }


        return;

    }


    usersTable.innerHTML = `
        <tr>

            <td>
                ${name}
            </td>

            <td>
                ${email}
            </td>

            <td>

                <span class="status status-verified">

                    ${
                        loggedIn === "true"
                            ? "Active"
                            : "Inactive"
                    }

                </span>

            </td>

            <td>
                $${Number(balance || 0).toFixed(2)}
            </td>

        </tr>
    `;


    if (totalUsers) {

        totalUsers.textContent =
            "1";

    }


    if (activeUsers) {

        activeUsers.textContent =
            loggedIn === "true"
                ? "1"
                : "0";

    }

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
