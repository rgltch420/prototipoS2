// ============================================================
// renderer.js — Renders analysis results into the DOM
// ============================================================

/**
 * Render full analysis results
 */
export function renderResults(data) {
  // Score
  document.getElementById('scoreValue').textContent = data.score
  document.getElementById('scoreVerdict').textContent = data.verdict || '—'

  // Color score
  const scoreEl = document.getElementById('scoreCircle')
  if (data.score >= 8) {
    scoreEl.style.borderColor = 'var(--accent-3)'
    scoreEl.style.boxShadow = '0 0 20px rgba(6,255,165,0.3)'
    document.getElementById('scoreValue').style.color = 'var(--accent-3)'
  } else if (data.score >= 5) {
    scoreEl.style.borderColor = 'var(--accent-2)'
    scoreEl.style.boxShadow = '0 0 20px rgba(255,209,102,0.3)'
    document.getElementById('scoreValue').style.color = 'var(--accent-2)'
  } else {
    scoreEl.style.borderColor = 'var(--accent)'
    scoreEl.style.boxShadow = '0 0 20px var(--accent-glow)'
    document.getElementById('scoreValue').style.color = 'var(--accent)'
  }

  // Populate tabs
  renderMejoras(data.mejoras || [])
  renderPesos(data.progresion_pesos || [])
  renderRutina(data.rutina_optimizada || [])
  renderTips(data.tips || [])
}

function renderMejoras(mejoras) {
  const container = document.createElement('div')
  container.className = 'tab-pane active'
  container.id = 'pane-mejoras'

  if (!mejoras.length) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:20px 0;font-size:13px;">No se encontraron mejoras específicas.</p>'
    setTabContent(container)
    return
  }

  mejoras.forEach(m => {
    const el = document.createElement('div')
    el.className = 'mejora-item'
    el.innerHTML = `
      <div class="mejora-badge">${m.emoji || '⚡'}</div>
      <div>
        <div class="mejora-title">${m.titulo || ''}</div>
        <div class="mejora-desc">${m.descripcion || ''}</div>
      </div>
    `
    container.appendChild(el)
  })

  setTabContent(container)
}

function renderPesos(pesos) {
  const container = document.createElement('div')
  container.className = 'tab-pane'
  container.id = 'pane-pesos'

  if (!pesos.length) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:20px 0;font-size:13px;">Agrega ejercicios con pesos para ver la progresión.</p>'
    setTabContent(container, true)
    return
  }

  const table = document.createElement('table')
  table.className = 'weight-table'
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ejercicio</th>
        <th>Actual</th>
        <th></th>
        <th>Siguiente</th>
        <th>En</th>
        <th>Razón</th>
      </tr>
    </thead>
    <tbody>
      ${pesos.map(p => `
        <tr>
          <td class="weight-current">${p.ejercicio}</td>
          <td class="weight-current">${p.peso_actual}kg</td>
          <td class="weight-arrow">→</td>
          <td class="weight-next">${p.peso_siguiente}kg</td>
          <td style="color:var(--text-muted)">${p.semanas || '?'}sem</td>
          <td style="color:var(--text-muted);font-size:11px">${p.razon || ''}</td>
        </tr>
      `).join('')}
    </tbody>
  `

  container.appendChild(table)
  setTabContent(container, true)
}

function renderRutina(dias) {
  const container = document.createElement('div')
  container.className = 'tab-pane'
  container.id = 'pane-rutina'

  if (!dias.length) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:20px 0;font-size:13px;">No se generó rutina optimizada.</p>'
    setTabContent(container, true)
    return
  }

  dias.forEach(d => {
    const dayEl = document.createElement('div')
    dayEl.className = 'routine-day'
    dayEl.innerHTML = `
      <div class="routine-day-header">${d.dia}</div>
      ${(d.ejercicios || []).map(e => `
        <div class="routine-exercise">
          <span class="routine-ex-name">${e.nombre}</span>
          <span class="routine-ex-sets">${e.series} · ${e.descanso || ''}</span>
        </div>
      `).join('')}
    `
    container.appendChild(dayEl)
  })

  setTabContent(container, true)
}

function renderTips(tips) {
  const container = document.createElement('div')
  container.className = 'tab-pane'
  container.id = 'pane-tips'

  if (!tips.length) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:20px 0;font-size:13px;">No se generaron tips.</p>'
    setTabContent(container, true)
    return
  }

  tips.forEach(t => {
    const el = document.createElement('div')
    el.className = 'tip-item'
    el.innerHTML = `<div class="tip-title">${t.titulo || 'Tip'}</div>${t.consejo || ''}`
    container.appendChild(el)
  })

  setTabContent(container, true)
}

function setTabContent(el, append = false) {
  const container = document.getElementById('tabContent')
  if (!append) container.innerHTML = ''
  container.appendChild(el)
}

/**
 * Safely parse JSON from LLM output (handles markdown fences, extra text)
 */
export function parseJSON(text) {
  // Remove markdown code blocks if present
  let clean = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()

  // Try to extract JSON object
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1)
  }

  return JSON.parse(clean)
}

/**
 * Show/hide states
 */
export function showState(state) {
  document.getElementById('emptyState').classList.add('hidden')
  document.getElementById('loadingState').classList.add('hidden')
  document.getElementById('results').classList.add('hidden')

  if (state === 'loading') document.getElementById('loadingState').classList.remove('hidden')
  else if (state === 'results') document.getElementById('results').classList.remove('hidden')
  else document.getElementById('emptyState').classList.remove('hidden')
}

export function setLoadingText(text) {
  document.getElementById('loadingText').textContent = text
}
