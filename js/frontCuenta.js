document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document
        .getElementById("confirm-password")
        .value.trim();

      if (!username || !email || !password || !confirmPassword) {
        alert("Todos los campos son obligatorios.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Por favor ingresa un email válido.");
        return;
      }

      const submitBtn = document.getElementById("btnCrearCuenta");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Creando cuenta...";

      try {
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("¡Cuenta creada correctamente! 🎉");
          console.log("Usuario registrado:", data);

          signinForm.reset();

          console.log("Redirigiendo a logIn.html...");
          window.location.href = "logIn.html";
        } else {
          alert(
            "Error: " + (data.error || data.message || "Error desconocido")
          );
        }
      } catch (error) {
        console.error("Error en signup:", error);
        alert(
          "Error de conexión. Verifica que el servidor esté funcionando en http://localhost:3000"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("Por favor completa todos los campos.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Por favor ingresa un email válido.");
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Iniciando sesión...";

      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("¡Inicio de sesión exitoso! ✅");
          console.log("Usuario logueado:", data);

          const datosUsuario = {
            id: data.user.id,
            email: data.user.email,
            nombre: data.extra.nombre,
          };

          localStorage.setItem("usuario", JSON.stringify(datosUsuario));
          console.log("Sesión guardada:", datosUsuario);

          loginForm.reset();

          window.location.href = "index.html";
        } else {
          alert(
            "Error: " +
              (data.error || data.message || "Credenciales incorrectas")
          );
        }
      } catch (error) {
        console.error("Error en login:", error);
        alert(
          "Error de conexión. Verifica que el servidor esté funcionando en http://localhost:3000"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});
