const supabase = window.supabase.createClient(
  'https://vykwhrvubbhuqhemwnlx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a3docnZ1YmJodXFoZW13bmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDA3MjYsImV4cCI6MjA3MDUxNjcyNn0.NvoIcBnEJsY2MFTlz_yjd_Ns84SzjlsLqzS99YvZx8c'
);

const contenedorLista = document.getElementById('places-div');
const cabeceraLista = document.getElementById('places-head');
const vistaDetalle = document.getElementById('detalle-establecimiento');
const template = document.getElementById('place-template');
const searchInput = document.getElementById('search-input');

function renderLista(data) {
  contenedorLista.innerHTML = '';

  data.forEach(establecimiento => {
    const clone = template.content.cloneNode(true);
    const placeCard = clone.querySelector('.place-card');

    placeCard.querySelector('h3').textContent = establecimiento.nombre;
    placeCard.querySelector('.category').textContent = establecimiento.TipoDeEstablecimiento;
    placeCard.querySelector('.address').textContent = establecimiento.ubicacion;

    const tagsContainer = placeCard.querySelector('.tags-container');
    tagsContainer.innerHTML = '';

    if (Array.isArray(establecimiento.etiquetas) && establecimiento.etiquetas.length > 0) {
      establecimiento.etiquetas.forEach(tag => {
        if (tag && typeof tag === 'string') {
          const span = document.createElement('span');
          span.textContent = tag;
          tagsContainer.appendChild(span);
        }
      });
    }
    
    placeCard.setAttribute('onclick', `mostrarDetalles('${establecimiento.id}')`);
    contenedorLista.appendChild(clone);
  });
}

async function buscarEstablecimientos(query = '') {
  cabeceraLista.classList.remove('hidden');
  contenedorLista.classList.remove('hidden');
  vistaDetalle.classList.add('hidden');
  
  let consulta = supabase.from('Establecimiento').select('*');

  if (query) {
    consulta = consulta.ilike('nombre', `%${query}%`);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error('Error al cargar establecimientos:', error);
    return;
  }

  renderLista(data);
  // ✅ LÍNEA DESCOMENTADA PARA ACTIVAR EL MAPA ✅
  mostrarEnMapa(data); 
}

document.addEventListener('DOMContentLoaded', () => {
  buscarEstablecimientos();
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    buscarEstablecimientos(searchInput.value.trim());
  }
});

async function mostrarDetalles(id) {
  cabeceraLista.classList.add('hidden');
  contenedorLista.classList.add('hidden');
  vistaDetalle.classList.remove('hidden');

  const { data, error } = await supabase
    .from('Establecimiento')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al cargar detalles:', error);
    return;
  }

  document.getElementById('detalle-nombre').textContent = data.nombre;
  document.getElementById('detalle-tipo').textContent = data.TipoDeEstablecimiento;
  document.getElementById('detalle-ubicacion').textContent = data.ubicacion;

  const etiquetasContainer = document.getElementById('detalle-etiquetas');
  etiquetasContainer.innerHTML = '';
  if (Array.isArray(data.etiquetas) && data.etiquetas.length > 0) {
    data.etiquetas.forEach(tag => {
      if (tag && typeof tag === 'string') {
        const span = document.createElement('span');
        span.textContent = tag;
        etiquetasContainer.appendChild(span);
      }
    });
  }
}

window.mostrarDetalles = mostrarDetalles;