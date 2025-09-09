const supabase = window.supabase.createClient(
  "https://vykwhrvubbhuqhemwnlx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a3docnZ1YmJodXFoZW13bmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDA3MjYsImV4cCI6MjA3MDUxNjcyNn0.NvoIcBnEJsY2MFTlz_yjd_Ns84SzjlsLqzS99YvZx8c"
);

const contenedorLista = document.getElementById("places-div");
const cabeceraLista = document.getElementById("places-head");
const vistaDetalle = document.getElementById("detalle-establecimiento");
const template = document.getElementById("place-template");
const searchInput = document.getElementById("search-input");

let establecimientoActual = null;
let calificacionSeleccionada = 0;

function renderLista(data) {
  contenedorLista.innerHTML = "";

  if (!data || data.length === 0) {
    contenedorLista.innerHTML =
      '<p style="text-align: center; padding: 2rem; color: #777;">No se encontraron lugares</p>';
    return;
  }

  data.forEach((establecimiento) => {
    const clone = template.content.cloneNode(true);
    const placeCard = clone.querySelector(".place-card");

    placeCard.querySelector("h3").textContent =
      establecimiento.nombre || "Sin nombre";
    placeCard.querySelector(".category").textContent =
      establecimiento.TipoDeEstablecimiento || "Sin categoría";
    placeCard.querySelector(".address").textContent =
      establecimiento.ubicacion || "Ubicación no especificada";

    const tagsContainer = placeCard.querySelector(".tags-container");
    tagsContainer.innerHTML = "";

    if (
      Array.isArray(establecimiento.etiquetas) &&
      establecimiento.etiquetas.length > 0
    ) {
      establecimiento.etiquetas.forEach((tag) => {
        if (tag && typeof tag === "string") {
          const span = document.createElement("span");
          span.textContent = tag;
          span.className = "tag";
          tagsContainer.appendChild(span);
        }
      });
    }

    placeCard.setAttribute(
      "onclick",
      `mostrarDetalles('${establecimiento.id}')`
    );
    placeCard.style.cursor = "pointer";

    contenedorLista.appendChild(clone);
  });
}

async function buscarEstablecimientos(query = "", filtros = []) {
  cabeceraLista.classList.remove("hidden");
  contenedorLista.classList.remove("hidden");
  vistaDetalle.classList.add("hidden");

  try {
    let consulta = supabase.from("Establecimiento").select("*");

    if (query.trim()) {
      consulta = consulta.ilike("nombre", `%${query.trim()}%`);
    }

    if (filtros.length > 0) {
      consulta = consulta.overlaps("etiquetas", filtros);
    }

    const { data, error } = await consulta.order("calificacion", {
      ascending: false,
      nullsLast: true,
    });

    if (error) {
      console.error("Error al cargar establecimientos:", error);
      contenedorLista.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #dc3545;">Error al cargar lugares</p>';
      return;
    }

    console.log(`Encontrados ${data?.length || 0} establecimientos`);

    renderLista(data);

    if (typeof mostrarEnMapa === "function") {
      mostrarEnMapa(data || []);
    }
  } catch (error) {
    console.error("Error en búsqueda:", error);
    contenedorLista.innerHTML =
      '<p style="text-align: center; padding: 2rem; color: #dc3545;">Error de conexión</p>';
  }
}

async function mostrarDetalles(establecimientoId) {
  cabeceraLista.classList.add("hidden");
  contenedorLista.classList.add("hidden");
  vistaDetalle.classList.remove("hidden");

  try {
    const { data, error } = await supabase
      .from("Establecimiento")
      .select("*")
      .eq("id", establecimientoId)
      .single();

    if (error) throw error;

    establecimientoActual = data;

    document.getElementById("detalle-nombre").textContent =
      data.nombre || "Sin nombre";
    document.getElementById("detalle-tipo").textContent =
      data.TipoDeEstablecimiento || "Sin categoría";
    document.getElementById("detalle-ubicacion").textContent =
      data.ubicacion || "Ubicación no especificada";

    const etiquetasContainer = document.getElementById("detalle-etiquetas");
    etiquetasContainer.innerHTML = "";
    if (Array.isArray(data.etiquetas) && data.etiquetas.length > 0) {
      data.etiquetas.forEach((tag) => {
        if (tag && typeof tag === "string") {
          const span = document.createElement("span");
          span.textContent = tag;
          span.className = "tag";
          etiquetasContainer.appendChild(span);
        }
      });
    } else {
      etiquetasContainer.innerHTML =
        '<span style="color: #777;">Sin características específicas</span>';
    }

    if (data.calificacion) {
      actualizarCalificacionEnUI(parseFloat(data.calificacion));
    } else {
      actualizarCalificacionEnUI(0);
    }

    await cargarReseñas(establecimientoId);
  } catch (error) {
    console.error("Error al cargar detalles:", error);
    alert("Error al cargar los detalles del lugar");

    vistaDetalle.classList.add("hidden");
    cabeceraLista.classList.remove("hidden");
    contenedorLista.classList.remove("hidden");
  }
}

async function cargarReseñas(establecimientoId) {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("id_establecimiento", establecimientoId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      mostrarSinReseñas();
      return;
    }

    const usuarioIds = [...new Set(reviews.map((r) => r.id_usuario))];
    const { data: usuarios } = await supabase
      .from("Usuarios")
      .select("id, nombre")
      .in("id", usuarioIds);

    const reseñasCompletas = reviews.map((review) => ({
      ...review,
      nombreUsuario:
        usuarios?.find((u) => u.id === review.id_usuario)?.nombre ||
        "Usuario Anónimo",
    }));

    renderizarReseñas(reseñasCompletas);
  } catch (error) {
    console.error("Error al cargar reseñas:", error);
    mostrarSinReseñas();
  }
}

async function renderizarReseñas(reseñas) {
  const container = document.getElementById("detalle-comentarios");
  const template = document.getElementById("comentario-template");
  const sinComentarios = document.getElementById("sin-comentarios");

  if (!container || !template) {
    console.error("No se encontraron elementos del DOM para comentarios");
    return;
  }

  const reseñasAnteriores = container.querySelectorAll(".comentario");
  reseñasAnteriores.forEach((c) => c.remove());

  if (reseñas && reseñas.length > 0) {
    if (sinComentarios) sinComentarios.style.display = "none";

    const usuario = obtenerUsuarioActual();
    let usuarioId = null;

    if (usuario) {
      try {
        const { data: usuarioData } = await supabase
          .from("Usuarios")
          .select("id")
          .eq("id_auth", usuario.id)
          .single();
        usuarioId = usuarioData?.id;
      } catch (error) {
        console.warn("No se pudo obtener ID de usuario para likes:", error);
      }
    }

    for (const reseña of reseñas) {
      const clone = template.content.cloneNode(true);

      const nombreElement = clone.querySelector(".nombre-usuario");
      if (nombreElement) {
        nombreElement.textContent = reseña.nombreUsuario || "Usuario Anónimo";
      }

      const estrellasDiv = clone.querySelector(".estrellas");
      if (estrellasDiv) {
        estrellasDiv.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
          const img = document.createElement("img");
          img.src =
            i <= reseña.calificacion
              ? "./Imagenes/estrella_llena.png"
              : "./Imagenes/estrella_vacia.png";
          img.alt = "estrella";
          img.style.width = "14px";
          img.style.height = "14px";
          estrellasDiv.appendChild(img);
        }
      }

      const fechaElement = clone.querySelector(".fecha");
      if (fechaElement) {
        fechaElement.textContent = new Date(
          reseña.created_at
        ).toLocaleDateString("es-ES");
      }

      const textoElement = clone.querySelector(".texto-comentario");
      if (textoElement) {
        textoElement.textContent = reseña.contenido || "";
      }

      const btnLike = clone.querySelector(".btn-like");
      const likeCount = clone.querySelector(".like-count");

      if (btnLike && likeCount) {
        likeCount.textContent = reseña.likes || 0;

        if (usuarioId) {
          const yaDioLike = await verificarSiUsuarioDioLike(
            reseña.id,
            usuarioId
          );

          if (yaDioLike) {
            btnLike.classList.add("liked");
            btnLike.style.backgroundColor = "#7EA4EB";
            btnLike.style.color = "white";
          } else {
            btnLike.classList.remove("liked");
            btnLike.style.backgroundColor = "#f8f9fa";
            btnLike.style.color = "#495057";
          }
        }

        btnLike.addEventListener("click", () => darLike(reseña.id, btnLike));
      }

      container.appendChild(clone);
    }
  } else {
    if (sinComentarios) {
      sinComentarios.style.display = "block";
      sinComentarios.textContent = "Aún no hay reseñas para este lugar.";
    }
  }
}

function mostrarSinReseñas() {
  const sinComentarios = document.getElementById("sin-comentarios");
  if (sinComentarios) {
    sinComentarios.style.display = "block";
    sinComentarios.textContent = "Aún no hay reseñas para este lugar.";
  }
}

async function darLike(reviewId, btnElement) {
  const usuario = obtenerUsuarioActual();

  if (!usuario) {
    alert("Debes iniciar sesión para dar like");
    return;
  }

  try {
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("Usuarios")
      .select("id")
      .eq("id_auth", usuario.id)
      .single();

    if (usuarioError) {
      console.error("Error obteniendo datos de usuario:", usuarioError);
      alert("Error al verificar usuario");
      return;
    }

    console.log(
      "🔄 Toggling like para review:",
      reviewId,
      "usuario:",
      usuarioData.id
    );

    btnElement.disabled = true;
    btnElement.style.opacity = "0.6";

    const { data, error } = await supabase.rpc("toggle_like", {
      p_user_id: usuarioData.id,
      p_review_id: reviewId,
    });

    if (error) {
      console.error("Error en toggle_like:", error);
      alert("Error al procesar like");
      return;
    }

    const resultado = data[0];
    console.log("✅ Resultado toggle_like:", resultado);

    const likeCount = btnElement.querySelector(".like-count");
    const likeIcon = btnElement.querySelector(".like-icon");

    if (likeCount) {
      likeCount.textContent = resultado.new_likes_count || 0;
    }

    if (resultado.action === "added") {
      btnElement.classList.add("liked");
      if (likeIcon) likeIcon.textContent = "👍";
      btnElement.style.backgroundColor = "#7EA4EB";
      btnElement.style.color = "white";
      console.log("✅ Like agregado");
    } else {
      btnElement.classList.remove("liked");
      if (likeIcon) likeIcon.textContent = "👍";
      btnElement.style.backgroundColor = "#f8f9fa";
      btnElement.style.color = "#495057";
      console.log("✅ Like removido");
    }

    btnElement.style.transform = "scale(1.2)";
    setTimeout(() => {
      btnElement.style.transform = "scale(1)";
    }, 200);
  } catch (error) {
    console.error("❌ Error completo en darLike:", error);
    alert("Error al procesar like");
  } finally {
    btnElement.disabled = false;
    btnElement.style.opacity = "1";
  }
}

async function verificarSiUsuarioDioLike(reviewId, userId) {
  try {
    const { data, error } = await supabase
      .from("user_likes")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error verificando like:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error verificando like:", error);
    return false;
  }
}

async function enviarComentario() {
  const usuario = obtenerUsuarioActual();

  if (!usuario) {
    alert("Debes iniciar sesión para escribir una reseña");
    return;
  }

  if (!establecimientoActual) {
    alert("No se ha seleccionado un lugar");
    return;
  }

  if (calificacionSeleccionada === 0) {
    alert("Por favor selecciona una calificación");
    return;
  }

  const texto = document.getElementById("comentario-texto").value.trim();
  if (!texto) {
    alert("Por favor escribe tu reseña");
    return;
  }

  try {
    const { error } = await supabase.from("reviews").insert([
      {
        id_establecimiento: establecimientoActual.id,
        id_usuario: usuario.id,
        calificacion: calificacionSeleccionada,
        contenido: texto,
        likes: 0,
      },
    ]);

    if (error) throw error;

    alert("¡Reseña enviada correctamente!");

    cerrarModal("comentar");
    document.getElementById("comentario-texto").value = "";
    calificacionSeleccionada = 0;
    actualizarEstrellas();

    await cargarReseñas(establecimientoActual.id);
    await actualizarCalificacionPromedio(establecimientoActual.id);
  } catch (error) {
    console.error("Error al enviar reseña:", error);
    alert("Error al enviar la reseña: " + error.message);
  }
}

async function actualizarCalificacionPromedio(establecimientoId) {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("calificacion")
      .eq("id_establecimiento", establecimientoId);

    if (error) throw error;

    if (reviews && reviews.length > 0) {
      const suma = reviews.reduce(
        (acc, review) => acc + review.calificacion,
        0
      );
      const promedio = suma / reviews.length;

      const { error: updateError } = await supabase
        .from("Establecimiento")
        .update({ calificacion: promedio.toFixed(1) })
        .eq("id", establecimientoId);

      if (!updateError) {
        actualizarCalificacionEnUI(promedio);
      }
    }
  } catch (error) {
    console.error("Error al actualizar calificación promedio:", error);
  }
}

function actualizarCalificacionEnUI(promedio) {
  const estrellas = document.querySelectorAll("#calificacion img");
  const promedioRedondeado = Math.round(promedio);

  estrellas.forEach((estrella, index) => {
    estrella.src =
      index < promedioRedondeado
        ? "./Imagenes/estrella_llena.png"
        : "./Imagenes/estrella_vacia.png";
  });
}

function aplicarFiltros() {
  const filtrosSeleccionados = [];

  document
    .querySelectorAll('#form-filtros input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      filtrosSeleccionados.push(checkbox.value);
    });

  console.log("Filtros aplicados:", filtrosSeleccionados);

  buscarEstablecimientos(
    searchInput?.value?.trim() || "",
    filtrosSeleccionados
  );

  cerrarModal("filtrado");
}

function limpiarFiltros() {
  document
    .querySelectorAll('#form-filtros input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  buscarEstablecimientos(searchInput?.value?.trim() || "", []);
  cerrarModal("filtrado");
}

function configurarEstrellas() {
  const estrellas = document.querySelectorAll("#estrellas-calificacion img");

  estrellas.forEach((estrella, index) => {
    estrella.addEventListener("click", () => {
      calificacionSeleccionada = index + 1;
      actualizarEstrellas();
    });

    estrella.addEventListener("mouseover", () => {
      mostrarEstrellas(index + 1);
    });
  });

  const contenedor = document.getElementById("estrellas-calificacion");
  if (contenedor) {
    contenedor.addEventListener("mouseleave", () => {
      actualizarEstrellas();
    });
  }
}

function mostrarEstrellas(cantidad) {
  const estrellas = document.querySelectorAll("#estrellas-calificacion img");
  estrellas.forEach((estrella, index) => {
    estrella.src =
      index < cantidad
        ? "./Imagenes/estrella_llena.png"
        : "./Imagenes/estrella_vacia.png";
  });
}

function actualizarEstrellas() {
  mostrarEstrellas(calificacionSeleccionada);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(" Iniciando IncluMar...");

  buscarEstablecimientos();

  configurarEstrellas();

  console.log("IncluMar inicializado");
});

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarEstablecimientos(searchInput.value.trim());
    }
  });
}

window.mostrarDetalles = mostrarDetalles;
window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.enviarComentario = enviarComentario;
window.buscarEstablecimientos = buscarEstablecimientos;

console.log(
  "Establecimientos.js cargado - Sistema de reseñas con likes + filtros"
);
