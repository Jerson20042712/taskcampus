// ─── TaskCampus - Frontend compilado (ES Modules) ───────────────────────────
const BASE_URL = 'http://localhost:8000';

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
    }
    return res.json();
}


const api = {
    getTasks: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.estado) params.set('estado', filters.estado);
        if (filters.prioridad) params.set('prioridad', filters.prioridad);
        if (filters.asignatura) params.set('asignatura', filters.asignatura);
        const qs = params.toString();
        return request(`/tasks${qs ? '?' + qs : ''}`);
    },
    getTask: (id) => request(`/tasks/${id}`),
    createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
    updateTask: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
    deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
    getSummary: () => request('/tasks/summary'),
};

function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function badgeEstado(e) {
    const map = { pendiente: 'bg-amber-100 text-amber-800', 'en proceso': 'bg-blue-100 text-blue-800', finalizada: 'bg-green-100 text-green-700' };
    const labels = { pendiente: 'Pendiente', 'en proceso': 'En proceso', finalizada: 'Finalizada' };
    return `<span class="badge ${map[e] || ''}">${labels[e] || e}</span>`;
}

function badgePrioridad(p) {
    const map = { alta: 'bg-red-100 text-red-800', media: 'bg-yellow-100 text-yellow-800', baja: 'bg-gray-100 text-gray-600' };
    const icons = { alta: '↑', media: '→', baja: '↓' };
    return `<span class="badge ${map[p] || ''}">${icons[p] || ''} ${p.charAt(0).toUpperCase() + p.slice(1)}</span>`;
}

function showToast(msg, color = 'bg-green-700') {
    const el = document.createElement('div');
    el.className = `fixed bottom-4 right-4 ${color} text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 transition`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
}

const showError = msg => showToast(msg, 'bg-red-600');
const showSuccess = msg => showToast(msg, 'bg-green-700');

let editId = null;

async function renderStats() {
    try {
        const s = await api.getSummary();
        document.getElementById('statsGrid').innerHTML = `
      <div class="bg-white rounded-xl border border-gray-200 p-4"><div class="text-xs text-gray-400 mb-1">Total tareas</div><div class="text-3xl font-semibold text-gray-800">${s.total}</div></div>
      <div class="bg-white rounded-xl border border-gray-200 p-4"><div class="text-xs text-gray-400 mb-1">Pendientes</div><div class="text-3xl font-semibold text-amber-600">${s.pendientes}</div></div>
      <div class="bg-white rounded-xl border border-gray-200 p-4"><div class="text-xs text-gray-400 mb-1">Finalizadas</div><div class="text-3xl font-semibold text-green-600">${s.finalizadas}</div></div>
      <div class="bg-white rounded-xl border border-gray-200 p-4"><div class="text-xs text-gray-400 mb-1">Alta prioridad</div><div class="text-3xl font-semibold text-red-600">${s.alta_prioridad}</div></div>
    `;
    } catch {}
}

function updateAsignaturaFilter(tasks) {
    const sel = document.getElementById('filtroAsignatura');
    const cur = sel.value;
    const asigs = [...new Set(tasks.map(t => t.asignatura).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Todas las asignaturas</option>' +
        asigs.map(a => `<option value="${esc(a)}"${a === cur ? ' selected' : ''}>${esc(a)}</option>`).join('');
}

async function renderTasks() {
    const filters = {
        estado: document.getElementById('filtroEstado').value,
        prioridad: document.getElementById('filtroPrioridad').value,
        asignatura: document.getElementById('filtroAsignatura').value,
    };
    const list = document.getElementById('taskList');
    list.innerHTML = '<div class="text-center text-gray-400 py-8">Cargando...</div>';
    try {
        const tasks = await api.getTasks(filters);
        updateAsignaturaFilter(tasks);
        await renderStats();
        if (!tasks.length) {
            list.innerHTML = `<div class="text-center py-12 text-gray-400"><div class="text-5xl mb-3">📋</div><div class="text-sm">No hay tareas. ¡Crea una!</div></div>`;
            return;
        }
        list.innerHTML = tasks.map(t => `
      <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-sm transition ${t.estado === 'finalizada' ? 'opacity-60' : ''}">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate mb-1">${esc(t.titulo)}</div>
          <div class="text-xs text-gray-400 mb-2">📚 ${esc(t.asignatura)}${t.fecha ? ` &nbsp;·&nbsp; 📅 ${t.fecha}` : ''}</div>
          ${t.descripcion ? `<div class="text-sm text-gray-500 mb-2">${esc(t.descripcion)}</div>` : ''}
          <div class="flex gap-2 flex-wrap">${badgeEstado(t.estado)}${badgePrioridad(t.prioridad)}</div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="toggleDone('${t.id}','${t.estado}')" title="${t.estado === 'finalizada' ? 'Marcar pendiente' : 'Finalizar'}"
            class="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-600 transition">
            ${t.estado === 'finalizada' ? '↩' : '✓'}
          </button>
          <button onclick="openModal('${t.id}')" title="Editar"
            class="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition">✏️</button>
          <button onclick="deleteTask('${t.id}')" title="Eliminar"
            class="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-500 transition">🗑️</button>
        </div>
      </div>`).join('');
  } catch {
    list.innerHTML = `<div class="text-center py-12 text-red-400">
      <div class="text-4xl mb-3">⚠️</div>
      <div class="text-sm font-medium">No se puede conectar con el backend</div>
      <div class="text-xs mt-2 text-gray-400">Asegúrate de que el servidor Python está corriendo en <strong>localhost:8000</strong></div>
    </div>`;
  }
}

async function toggleDone(id, estadoActual) {
  try {
    const task = await api.getTask(id);
    await api.updateTask(id, { ...task, estado: estadoActual === 'finalizada' ? 'pendiente' : 'finalizada' });
    renderTasks();
  } catch (err) { showError(err.message); }
}

async function deleteTask(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  try {
    await api.deleteTask(id);
    showSuccess('Tarea eliminada');
    renderTasks();
  } catch (err) { showError(err.message); }
}

async function openModal(id) {
  editId = id || null;
  const title  = document.getElementById('modalTitle');
  const btnSave = document.getElementById('btnSave');
  document.getElementById('fTitulo').value = '';
  document.getElementById('fDesc').value = '';
  document.getElementById('fAsig').value = '';
  document.getElementById('fFecha').value = '';
  document.getElementById('fPrioridad').value = 'media';
  document.getElementById('fEstado').value = 'pendiente';
  if (id) {
    title.textContent = 'Editar tarea';
    btnSave.textContent = 'Guardar cambios';
    try {
      const t = await api.getTask(id);
      document.getElementById('fTitulo').value    = t.titulo;
      document.getElementById('fDesc').value      = t.descripcion || '';
      document.getElementById('fAsig').value      = t.asignatura;
      document.getElementById('fFecha').value     = t.fecha || '';
      document.getElementById('fPrioridad').value = t.prioridad;
      document.getElementById('fEstado').value    = t.estado;
    } catch (err) { showError(err.message); return; }
  } else {
    title.textContent   = 'Nueva tarea';
    btnSave.textContent = 'Crear tarea';
  }
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  editId = null;
}

async function saveTask() {
  const titulo = document.getElementById('fTitulo').value.trim();
  const asig   = document.getElementById('fAsig').value.trim();
  if (!titulo || !asig) { showError('El título y la asignatura son obligatorios.'); return; }
  const data = {
    titulo,
    descripcion: document.getElementById('fDesc').value.trim(),
    asignatura:  asig,
    fecha:       document.getElementById('fFecha').value,
    prioridad:   document.getElementById('fPrioridad').value,
    estado:      document.getElementById('fEstado').value,
  };
  try {
    if (editId) { await api.updateTask(editId, data); showSuccess('Tarea actualizada ✓'); }
    else        { await api.createTask(data);          showSuccess('Tarea creada ✓'); }
    closeModal();
    renderTasks();
  } catch (err) { showError(err.message); }
}

function clearFilters() {
  document.getElementById('filtroEstado').value = '';
  document.getElementById('filtroPrioridad').value = '';
  document.getElementById('filtroAsignatura').value = '';
  renderTasks();
}

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === document.getElementById('modal')) closeModal();
});

window.openModal   = openModal;
window.closeModal  = closeModal;
window.saveTask    = saveTask;
window.toggleDone  = toggleDone;
window.deleteTask  = deleteTask;
window.renderTasks = renderTasks;
window.clearFilters = clearFilters;

renderTasks();