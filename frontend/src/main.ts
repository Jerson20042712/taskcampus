import { api } from './api';
import { Task, TaskFilters } from './types';

// ── Estado global ─────────────────────────────────────────────────────────────
let editId: string | null = null;

// ── Helpers de UI ─────────────────────────────────────────────────────────────
function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function badgeEstado(e: string): string {
  const map: Record<string, string> = {
    pendiente:  'bg-amber-100 text-amber-800',
    'en proceso': 'bg-blue-100 text-blue-800',
    finalizada: 'bg-green-100 text-green-700',
  };
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    'en proceso': 'En proceso',
    finalizada: 'Finalizada',
  };
  return `<span class="badge ${map[e] || ''}">${labels[e] || e}</span>`;
}

function badgePrioridad(p: string): string {
  const map: Record<string, string> = {
    alta:  'bg-red-100 text-red-800',
    media: 'bg-yellow-100 text-yellow-800',
    baja:  'bg-gray-100 text-gray-600',
  };
  const icons: Record<string, string> = { alta: '↑', media: '→', baja: '↓' };
  const label = p.charAt(0).toUpperCase() + p.slice(1);
  return `<span class="badge ${map[p] || ''}">${icons[p] || ''} ${label}</span>`;
}

function showError(msg: string) {
  const el = document.createElement('div');
  el.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function showSuccess(msg: string) {
  const el = document.createElement('div');
  el.className = 'fixed bottom-4 right-4 bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// ── Stats ──────────────────────────────────────────────────────────────────────
async function renderStats() {
  try {
    const s = await api.getSummary();
    const grid = document.getElementById('statsGrid')!;
    grid.innerHTML = `
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-xs text-gray-400 mb-1">Total tareas</div>
        <div class="text-3xl font-semibold text-gray-800">${s.total}</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-xs text-gray-400 mb-1">Pendientes</div>
        <div class="text-3xl font-semibold text-amber-600">${s.pendientes}</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-xs text-gray-400 mb-1">Finalizadas</div>
        <div class="text-3xl font-semibold text-green-600">${s.finalizadas}</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-xs text-gray-400 mb-1">Alta prioridad</div>
        <div class="text-3xl font-semibold text-red-600">${s.alta_prioridad}</div>
      </div>
    `;
  } catch {
    // silencioso si el backend no responde aún
  }
}

// ── Filtro de asignaturas ─────────────────────────────────────────────────────
function updateAsignaturaFilter(tasks: Task[]) {
  const sel = document.getElementById('filtroAsignatura') as HTMLSelectElement;
  const cur = sel.value;
  const asigs = [...new Set(tasks.map(t => t.asignatura).filter(Boolean))].sort();
  sel.innerHTML =
    '<option value="">Todas las asignaturas</option>' +
    asigs.map(a => `<option value="${esc(a)}"${a === cur ? ' selected' : ''}>${esc(a)}</option>`).join('');
}

// ── Render lista de tareas ────────────────────────────────────────────────────
async function renderTasks() {
  const filters: TaskFilters = {
    estado:     (document.getElementById('filtroEstado') as HTMLSelectElement).value,
    prioridad:  (document.getElementById('filtroPrioridad') as HTMLSelectElement).value,
    asignatura: (document.getElementById('filtroAsignatura') as HTMLSelectElement).value,
  };

  const list = document.getElementById('taskList')!;
  list.innerHTML = '<div class="text-center text-gray-400 py-8">Cargando...</div>';

  try {
    const tasks = await api.getTasks(filters);
    updateAsignaturaFilter(tasks);
    await renderStats();

    if (!tasks.length) {
      list.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <div class="text-5xl mb-3">📋</div>
          <div class="text-sm">No hay tareas que mostrar</div>
          <div class="text-xs mt-1">Crea una nueva tarea con el botón de arriba</div>
        </div>`;
      return;
    }

    list.innerHTML = tasks.map(t => `
      <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 transition hover:shadow-sm ${t.estado === 'finalizada' ? 'opacity-60' : ''}">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate mb-1">${esc(t.titulo)}</div>
          <div class="text-xs text-gray-400 mb-2">
            📚 ${esc(t.asignatura)}
            ${t.fecha ? ` &nbsp;·&nbsp; 📅 ${t.fecha}` : ''}
          </div>
          ${t.descripcion ? `<div class="text-sm text-gray-500 mb-2 line-clamp-2">${esc(t.descripcion)}</div>` : ''}
          <div class="flex gap-2 flex-wrap">
            ${badgeEstado(t.estado)}
            ${badgePrioridad(t.prioridad)}
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="toggleDone('${t.id}', '${t.estado}')"
            title="${t.estado === 'finalizada' ? 'Marcar pendiente' : 'Marcar finalizada'}"
            class="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-600 transition text-base">
            ${t.estado === 'finalizada' ? '↩' : '✓'}
          </button>
          <button onclick="openModal('${t.id}')"
            title="Editar"
            class="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition text-sm">
            ✏️
          </button>
          <button onclick="deleteTask('${t.id}')"
            title="Eliminar"
            class="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-500 transition text-sm">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  } catch (err: any) {
    list.innerHTML = `
      <div class="text-center py-12 text-red-400">
        <div class="text-4xl mb-3">⚠️</div>
        <div class="text-sm font-medium">No se puede conectar con el backend</div>
        <div class="text-xs mt-1 text-gray-400">Asegúrate de que el servidor Python está corriendo en <strong>localhost:8000</strong></div>
      </div>`;
  }
}

// ── Toggle finalizada ─────────────────────────────────────────────────────────
async function toggleDone(id: string, estadoActual: string) {
  try {
    const task = await api.getTask(id);
    const nuevoEstado = estadoActual === 'finalizada' ? 'pendiente' : 'finalizada';
    await api.updateTask(id, { ...task, estado: nuevoEstado });
    renderTasks();
  } catch (err: any) {
    showError(err.message);
  }
}

// ── Eliminar ──────────────────────────────────────────────────────────────────
async function deleteTask(id: string) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  try {
    await api.deleteTask(id);
    showSuccess('Tarea eliminada');
    renderTasks();
  } catch (err: any) {
    showError(err.message);
  }
}

// ── Modal ─────────────────────────────────────────────────────────────────────
async function openModal(id?: string) {
  editId = id || null;
  const modal = document.getElementById('modal')!;
  const title = document.getElementById('modalTitle')!;
  const btnSave = document.getElementById('btnSave')!;

  // reset form
  (document.getElementById('fTitulo') as HTMLInputElement).value = '';
  (document.getElementById('fDesc') as HTMLTextAreaElement).value = '';
  (document.getElementById('fAsig') as HTMLInputElement).value = '';
  (document.getElementById('fFecha') as HTMLInputElement).value = '';
  (document.getElementById('fPrioridad') as HTMLSelectElement).value = 'media';
  (document.getElementById('fEstado') as HTMLSelectElement).value = 'pendiente';

  if (id) {
    title.textContent = 'Editar tarea';
    btnSave.textContent = 'Guardar cambios';
    try {
      const t = await api.getTask(id);
      (document.getElementById('fTitulo') as HTMLInputElement).value = t.titulo;
      (document.getElementById('fDesc') as HTMLTextAreaElement).value = t.descripcion || '';
      (document.getElementById('fAsig') as HTMLInputElement).value = t.asignatura;
      (document.getElementById('fFecha') as HTMLInputElement).value = t.fecha || '';
      (document.getElementById('fPrioridad') as HTMLSelectElement).value = t.prioridad;
      (document.getElementById('fEstado') as HTMLSelectElement).value = t.estado;
    } catch (err: any) {
      showError(err.message);
      return;
    }
  } else {
    title.textContent = 'Nueva tarea';
    btnSave.textContent = 'Crear tarea';
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal')!.classList.add('hidden');
  editId = null;
}

async function saveTask() {
  const titulo   = (document.getElementById('fTitulo') as HTMLInputElement).value.trim();
  const asig     = (document.getElementById('fAsig') as HTMLInputElement).value.trim();
  if (!titulo || !asig) {
    showError('El título y la asignatura son obligatorios.');
    return;
  }

  const data = {
    titulo,
    descripcion: (document.getElementById('fDesc') as HTMLTextAreaElement).value.trim(),
    asignatura:  asig,
    fecha:       (document.getElementById('fFecha') as HTMLInputElement).value,
    prioridad:   (document.getElementById('fPrioridad') as HTMLSelectElement).value as any,
    estado:      (document.getElementById('fEstado') as HTMLSelectElement).value as any,
  };

  try {
    if (editId) {
      await api.updateTask(editId, data);
      showSuccess('Tarea actualizada ✓');
    } else {
      await api.createTask(data);
      showSuccess('Tarea creada ✓');
    }
    closeModal();
    renderTasks();
  } catch (err: any) {
    showError(err.message);
  }
}

function clearFilters() {
  (document.getElementById('filtroEstado') as HTMLSelectElement).value = '';
  (document.getElementById('filtroPrioridad') as HTMLSelectElement).value = '';
  (document.getElementById('filtroAsignatura') as HTMLSelectElement).value = '';
  renderTasks();
}

// ── Exponer funciones globales al HTML ────────────────────────────────────────
(window as any).openModal     = openModal;
(window as any).closeModal    = closeModal;
(window as any).saveTask      = saveTask;
(window as any).toggleDone    = toggleDone;
(window as any).deleteTask    = deleteTask;
(window as any).renderTasks   = renderTasks;
(window as any).clearFilters  = clearFilters;

// ── Cerrar modal al hacer click fuera ────────────────────────────────────────
document.getElementById('modal')!.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal')) closeModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderTasks();
