// ============================================================
// ollama.js — Ollama API service with auto model detection
// ============================================================

const OLLAMA_BASE = 'http://localhost:11434'

// Priority order: phi3 > tinyllama > llama3 > mistral > any available
const PREFERRED_MODELS = ['phi3', 'tinyllama', 'llama3', 'mistral', 'llama2', 'gemma']

export const ollamaState = {
  model: null,
  available: false,
  allModels: []
}

/**
 * Detect best available model from Ollama
 */
export async function detectModel() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`)
    if (!res.ok) throw new Error('Ollama not running')

    const data = await res.json()
    const models = data.models || []
    ollamaState.allModels = models.map(m => m.name)

    // Find best model by priority
    for (const preferred of PREFERRED_MODELS) {
      const found = models.find(m => m.name.toLowerCase().startsWith(preferred))
      if (found) {
        ollamaState.model = found.name
        ollamaState.available = true
        return { success: true, model: found.name }
      }
    }

    // If none preferred, use whatever's available
    if (models.length > 0) {
      ollamaState.model = models[0].name
      ollamaState.available = true
      return { success: true, model: models[0].name }
    }

    return { success: false, error: 'No models installed. Run: ollama pull phi3' }
  } catch (err) {
    return { success: false, error: 'Ollama no está corriendo. Instálalo en ollama.com' }
  }
}

/**
 * Stream a completion from Ollama
 * @param {string} prompt
 * @param {function} onChunk - called with each text chunk
 * @returns {string} full response
 */
export async function streamCompletion(prompt, onChunk) {
  if (!ollamaState.model) throw new Error('No model selected')

  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaState.model,
      prompt,
      stream: true,
      options: {
        temperature: 0.3,    // Low temp for structured, reliable analysis
        top_p: 0.85,
        num_predict: 2000
      }
    })
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const lines = decoder.decode(value).split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.response) {
          full += json.response
          onChunk(json.response)
        }
      } catch {}
    }
  }

  return full
}

/**
 * Non-streaming completion (for structured JSON output)
 */
export async function complete(prompt) {
  if (!ollamaState.model) throw new Error('No model selected')

  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaState.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.8,
        num_predict: 1500
      }
    })
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const data = await res.json()
  return data.response
}
