document.addEventListener("DOMContentLoaded", () => {
    const viewMoreBtn = document.querySelector(".view-more-btn");
    const placesList = document.querySelector(".places-list");

    const extraCards = `
        <div class="place-card">
            <div class="place-info">
                <h3>Biblioteca inclusiva</h3>
                <p class="category">Cultura</p>
                <p class="address">Av. Colón 1234</p>
                <a href="#" class="details-link">Ver más detalles</a>
                <p class="extra-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed.</p>
            </div>
            <div class="place-features">
                <div class="tags-container">
                    <span class="tag">Rampa</span>
                    <span class="tag">Material en braille</span>
                </div>
                <a href="#" class="directions-btn">Cómo llegar</a>
            </div>
        </div>

        <div class="place-card">
            <div class="place-info">
                <h3>Teatro adaptado</h3>
                <p class="category">Entretenimiento</p>
                <p class="address">San Martín 567</p>
                <a href="#" class="details-link">Ver más detalles</a>
                <p class="extra-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel.</p>
            </div>
            <div class="place-features">
                <div class="tags-container">
                    <span class="tag">Audiodescripción</span>
                    <span class="tag">Asientos reservados</span>
                </div>
                <a href="#" class="directions-btn">Cómo llegar</a>
            </div>
        </div>
    `;

    // Evento botón Ver más
    viewMoreBtn.addEventListener("click", () => {
        placesList.insertAdjacentHTML("beforeend", extraCards);
        viewMoreBtn.style.display = "none";
    });

    // Delegación de eventos: capturar clicks en detalles
    placesList.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("details-link")) {
            e.preventDefault();
            const parent = target.closest(".place-info");
            const extraInfo = parent.querySelector(".extra-info");
            if (extraInfo.style.display === "block") {
                extraInfo.style.display = "none";
                target.textContent = "Ver más detalles";
            } else {
                extraInfo.style.display = "block";
                target.textContent = "Ver menos detalles";
            }
        }
    });
});
