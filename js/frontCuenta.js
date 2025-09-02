document.addEventListener("DOMContentLoaded", () => {

    const signinForm = document.getElementById("signin-form");
    if (signinForm) {
        signinForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Cuenta creada correctamente 🎉");
                    window.location.href = "login.html"; // redirige al login
                } else {
                    alert("Error al crear la cuenta: " + (data.message || "Desconocido"));
                }
            } catch (error) {
                console.error("Error en signup:", error);
                alert("Hubo un error de conexión.");
            }
        });
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Inicio de sesión exitoso ✅");
                    console.log("Usuario logueado:", data);
                } else {
                    alert("Error al iniciar sesión: " + (data.message || "Desconocido"));
                }
            } catch (error) {
                console.error("Error en login:", error);
                alert("Hubo un error de conexión.");
            }
        });
    }
});