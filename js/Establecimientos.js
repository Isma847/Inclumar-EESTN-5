const supabaseUrl = "https://vykwhrvubbhuqhemwnlx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a3docnZ1YmJodXFoZW13bmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDA3MjYsImV4cCI6MjA3MDUxNjcyNn0.NvoIcBnEJsY2MFTlz_yjd_Ns84SzjlsLqzS99YvZx8c";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const placesDiv = document.getElementById("places-div");
const placeTemplate = document.getElementById("place-template");
const detalleEstablecimiento = document.getElementById("detalle-establecimiento");
const detalleNombre = document.getElementById("detalle-nombre");
const detalleTipo = document.getElementById("detalle-tipo");
const detalleUbicacion = document.getElementById("detalle-ubicacion");
const detalleEtiquetas = document.getElementById("detalle-etiquetas");
const comentariosDiv = document.getElementById("detalle-comentarios");
const comentarioTemplate = document.getElementById("comentario-template");
const searchInput = document.getElementById("search-input");

let listaEstablecimientos = [];

// Cargar lista de establecimientos
async function cargarEstablecimientos() {
    const { data: establecimientos, error } = await supabase
        .from("Establecimiento")
        .select("*");

    if (error) {
        console.error("Error al cargar establecimientos:", error);
        return;
    }
    listaEstablecimientos = establecimientos;

    renderizarEstablecimientos(listaEstablecimientos);
}

// Renderizar establecimientos (filtrados o no)
function renderizarEstablecimientos(lista) {
    placesDiv.innerHTML = "";

    if (!lista || lista.length === 0) {
        placesDiv.innerHTML = "<p>No se encontraron establecimientos.</p>";
        return;
    }

    lista.forEach(est => {
        const clone = placeTemplate.content.cloneNode(true);

        clone.querySelector("h3").textContent = est.nombre;
        clone.querySelector(".category").textContent = est.tipo || "Sin categoría";
        clone.querySelector(".address").textContent = est.ubicacion || "Ubicación desconocida";

        clone.querySelector("button").addEventListener("click", () => {
            mostrarDetalleEstablecimiento(est);
        });

        placesDiv.appendChild(clone);

        if (window.addEstablecimientoMarker) {
            addEstablecimientoMarker(est);
        }
    });
}

// Buscar establecimientos
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const texto = searchInput.value.toLowerCase().trim();
        console.log("Buscando:", texto);

        const filtrados = listaEstablecimientos.filter(est => {
            return (est.nombre || "").toLowerCase().includes(texto);
        });

        detalleEstablecimiento.classList.add("hidden");
        document.getElementById("places-head").classList.remove("hidden");

        renderizarEstablecimientos(filtrados);
    }
});

// Mostrar detalles
function mostrarDetalleEstablecimiento(est) {
    detalleNombre.textContent = est.nombre;
    detalleTipo.textContent = est.TipoDeEstablecimiento || "Sin categoría";
    detalleUbicacion.textContent = est.ubicacion || "Ubicación desconocida";

    detalleEtiquetas.innerHTML = "";
    if (est.etiquetas) {
        est.etiquetas.split(",").forEach(tag => {
            const span = document.createElement("span");
            span.textContent = tag.trim();
            detalleEtiquetas.appendChild(span);
        });
    }
    placesDiv.innerHTML = "";
    document.getElementById("places-head").classList.add("hidden");

    detalleEstablecimiento.classList.remove("hidden");
    
    if (window.focusOnMarker) {
        focusOnMarker(est.id);
    }
    cargarComentarios(est.id);
}

// Cargar comentarios
async function cargarComentarios(idEstablecimiento) {
    comentariosDiv.innerHTML = "";
    console.log("Consultando comentarios con id:", idEstablecimiento);

    const { data: comentarios, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id_establecimiento", idEstablecimiento);

    if (error) {
        console.error("Error al cargar comentarios:", error);
        return;
    }

    console.log("Comentarios obtenidos:", comentarios);

    if (!comentarios || comentarios.length === 0) {
        comentariosDiv.innerHTML = "<p>No hay comentarios aún.</p>";
        return;
    }

    comentarios.forEach(comentario => {
        const clone = comentarioTemplate.content.cloneNode(true);

        clone.querySelector(".nombre-usuario").textContent = comentario.id_usuario || "Anónimo";
        clone.querySelector(".fecha").textContent = new Date(comentario.created_at).toLocaleDateString();
        clone.querySelector(".texto-comentario").textContent = comentario.contenido || "";

        const estrellasDiv = clone.querySelector(".estrellas");
        estrellasDiv.innerHTML = "";
        for (let i = 0; i < 5; i++) {
            const estrella = document.createElement("img");
            estrella.src = i < comentario.calificacion
                ? "./Imagenes/estrella_llena.png"
                : "./Imagenes/estrella_vacia.png";
            estrellasDiv.appendChild(estrella);
        }

        comentariosDiv.appendChild(clone);
    });

    console.log("Comentarios renderizados correctamente");
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    cargarEstablecimientos();
});