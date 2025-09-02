function verificarSesion() {
  try {
    const usuario = localStorage.getItem("usuario");

    if (!usuario) {
      console.log("No hay sesión activa, redirigiendo al login...");
      window.location.href = "logIn.html";
      return false;
    }

    // Verificar que los datos del usuario sean válidos
    const userData = JSON.parse(usuario);
    if (!userData.id || !userData.email) {
      console.log("Datos de sesión inválidos, redirigiendo al login...");
      localStorage.removeItem("usuario");
      window.location.href = "logIn.html";
      return false;
    }

    // Usuario válido logueado
    console.log("Usuario logueado:", userData.nombre || userData.email);
    return true;
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    localStorage.removeItem("usuario");
    window.location.href = "logIn.html";
    return false;
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuario");
  alert("Sesión cerrada correctamente");
  window.location.href = "logIn.html";
}

// Función para obtener datos del usuario actual
function obtenerUsuarioActual() {
  try {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      return JSON.parse(usuario);
    }
    return null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

// Función para mostrar nombre del usuario en la interfaz
function mostrarDatosUsuario() {
  const usuario = obtenerUsuarioActual();
  if (usuario) {
    const elementosNombre = document.querySelectorAll(".usuario-nombre");
    elementosNombre.forEach((el) => {
      el.textContent = usuario.nombre || usuario.email;
    });

    const elementosEmail = document.querySelectorAll(".usuario-email");
    elementosEmail.forEach((el) => {
      el.textContent = usuario.email;
    });
  }
}

// Auto-ejecutar verificación cuando se carga el script
document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = window.location.pathname;
  const paginasPublicas = ["logIn.html", "signIn.html"];

  const esRutaProtegida = !paginasPublicas.some((pagina) =>
    paginaActual.includes(pagina)
  );

  if (esRutaProtegida) {
    verificarSesion();
    mostrarDatosUsuario();
  }
});

// Hacer funciones disponibles globalmente
window.verificarSesion = verificarSesion;
window.cerrarSesion = cerrarSesion;
window.obtenerUsuarioActual = obtenerUsuarioActual;
