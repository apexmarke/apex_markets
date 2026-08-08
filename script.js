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


        // Make sure Supabase returned a user
        if (!data.user) {

            alert(
                "Account created, but no user was returned."
            );

            return;
        }


        // Create profile record
        const {
            error: profileError
        } = await supabaseClient
            .from("Profile")
            .insert({

                diid: data.user.id,

                emab_llufcreated_at: name,

                "ail me": email

            });


        if (profileError) {

            console.error(profileError);

            alert(
                "Account was created, but profile creation failed: " +
                profileError.message
            );

            return;
        }


        // Save local information
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

    if (
        typeof supabaseClient !== "undefined"
    ) {

        await supabaseClient.auth.signOut();

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
// REAL FEATURES
// ================================

// ================================
// REAL FEATURES
// ================================

async function showRealFeature(feature) {

    if (feature === "deposit") {

        const phone = prompt(
            "Enter your M-Pesa phone number:"
        );

        if (!phone) {
            return;
        }

        const amount = prompt(
            "Enter deposit amount:"
        );

        if (!amount || Number(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {

            const { data, error } =
                await supabaseClient.functions.invoke(
                    "mpesa-stk",
                    {
                        body: {
                            phone: phone,
                            amount: Number(amount)
                        }
                    }
                );

            if (error) {
                console.error(error);
                alert(
                    "Deposit request failed: " +
                    error.message
                );
                return;
            }

            console.log("M-Pesa response:", data);

            alert(
                "Deposit request sent successfully. " +
                "Check your phone for the M-Pesa prompt."
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to process deposit: " +
                error.message
            );
        }
    }


    if (feature === "withdraw") {

        alert(
            "Withdrawals are not available yet."
        );

    }

} {

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



// ================================
// SECURITY MESSAGE
// ================================

function showSecurityMessage() {

    alert(
        "Apex Markets is currently a demo/learning platform. " +
        "Secure server-side authentication and payment systems " +
        "must be added before real-money trading can be enabled."
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
