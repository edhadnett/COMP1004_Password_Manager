document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const createAccountForm = document.getElementById("create-account-form");
    const passwordManagerSection = document.getElementById("password-manager-section");
    const authSection = document.getElementById("auth-section");
    const loggedInUserSpan = document.getElementById("logged-in-user");
    const passwordList = document.getElementById("password-list");
    const checkStrengthButton = document.getElementById("check-strength");
    const sitePasswordInput = document.getElementById("site-password");
    const passwordStrength = document.getElementById("password-strength");

    let currentUser = null;

    // Account Creation
    createAccountForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/users");
            const users = await response.json();

            if (users.some(user => user.username === username)) {
                alert("Username already exists!");
                return;
            }

            await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            alert("Account created successfully!");
            createAccountForm.reset();
        } catch (error) {
            console.error("Error creating account:", error);
            alert("Something went wrong while creating your account.");
        }
    });

    // Login
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/users");
            const users = await response.json();

            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                alert("Login successful!");
                currentUser = username;
                loggedInUserSpan.textContent = username;
                authSection.style.display = "none";
                passwordManagerSection.style.display = "block";
                loadPasswords();
            } else {
                alert("Invalid username or password!");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Something went wrong while logging in.");
        }
    });

    // Save Password
    const addPasswordForm = document.getElementById("add-password-form");
    addPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const site = document.getElementById("site").value.trim();
        const siteUsername = document.getElementById("site-username").value.trim();
        const sitePassword = document.getElementById("site-password").value.trim();

        try {
            await fetch("http://localhost:3000/passwords", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    site,
                    siteUsername,
                    sitePassword,
                    owner: currentUser || "unknown"
                })
            });

            alert("Password saved successfully!");
            addPasswordForm.reset();
            loadPasswords();
        } catch (error) {
            console.error("Error saving password:", error);
            alert("Something went wrong while saving the password.");
        }
    });

    // Check password strength
    checkStrengthButton.addEventListener("click", () => {
        const password = sitePasswordInput.value;
        let strength = "Weak";

        if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            strength = "Strong";
        } else if (password.length >= 8) {
            strength = "Medium";
        }

        passwordStrength.textContent = `Password Strength: ${strength}`;
        passwordStrength.style.color = strength === "Strong" ? "green" : strength === "Medium" ? "orange" : "red";
    });

    // Load passwords for logged in user
    async function loadPasswords() {
        try {
            const response = await fetch("http://localhost:3000/passwords");
            const allPasswords = await response.json();

            const userPasswords = allPasswords.filter(p => p.owner === currentUser);

            passwordList.innerHTML = "";
            if (userPasswords.length === 0) {
                passwordList.innerHTML = "<p>No passwords saved yet.</p>";
                return;
            }

            userPasswords.forEach(p => {
                const item = document.createElement("div");
                item.classList.add("password-entry");
                item.innerHTML = `<strong>${p.site}</strong> - ${p.siteUsername} - ${p.sitePassword}`;
                passwordList.appendChild(item);
            });
        } catch (error) {
            console.error("Error loading passwords:", error);
        }
    }
});
