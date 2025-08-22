const supabase = window.supabase.createClient(
  'https://vykwhrvubbhuqhemwnlx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a3docnZ1YmJodXFoZW13bmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDA3MjYsImV4cCI6MjA3MDUxNjcyNn0.NvoIcBnEJsY2MFTlz_yjd_Ns84SzjlsLqzS99YvZx8c'
);

async function cargarEstablecimientos() {
  const { data, error } = await supabase
    .from('vista_establecimientos')
    .select('*');

  if (error) {
    console.error('Error al cargar establecimientos:', error);
    return;
  }

  const contenedor = document.querySelector('.places-list');
  const template = document.getElementById('place-template');
    
  data.forEach(establecimiento => {
  const clone = template.content.cloneNode(true);
  clone.querySelector('h3').textContent = establecimiento.nombre;
  clone.querySelector('.category').textContent = establecimiento.TipoDeEstablecimiento;
  clone.querySelector('.address').textContent = establecimiento.ubicacion;

  const tagsContainer = clone.querySelector('.tags-container');

  if (establecimiento.etiquetas && establecimiento.etiquetas.length > 0) {
    establecimiento.etiquetas.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });
  }
    contenedor.appendChild(clone);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarEstablecimientos();
});
