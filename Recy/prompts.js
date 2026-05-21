// ============================================================
// prompts.js — Engineered prompts for workout analysis
// ============================================================

/**
 * Build the structured analysis prompt
 * Returns a prompt that asks for JSON output
 */
export function buildAnalysisPrompt(profile, exercises) {
  const exerciseList = exercises
    .map(e => `- ${e.name}: ${e.weight}kg × ${e.sets}×${e.reps}`)
    .join('\n')

  const imc = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)

  return `Eres un entrenador personal experto con 15 años de experiencia en periodización y progresión de fuerza. Analiza la siguiente rutina de entrenamiento y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones fuera del JSON.

PERFIL DEL ATLETA:
- Peso: ${profile.weight}kg | Altura: ${profile.height}cm | IMC: ${imc}
- Edad: ${profile.age} años
- Experiencia: ${profile.experience}
- Objetivo: ${profile.goal}
- Días/semana: ${profile.days}
- Lesiones: ${profile.injuries || 'ninguna'}

RUTINA ACTUAL:
${exerciseList}

Responde con este JSON exacto (reemplaza los valores con tu análisis real):
{
  "score": 7,
  "verdict": "RUTINA FUNCIONAL",
  "mejoras": [
    {
      "emoji": "⚡",
      "titulo": "Problema identificado",
      "descripcion": "Explicación clara y accionable en 1-2 oraciones"
    }
  ],
  "progresion_pesos": [
    {
      "ejercicio": "Sentadilla",
      "peso_actual": 80,
      "peso_siguiente": 85,
      "razon": "Listo para progresar",
      "semanas": 2
    }
  ],
  "rutina_optimizada": [
    {
      "dia": "DÍA 1 — EMPUJE",
      "ejercicios": [
        { "nombre": "Press de banca", "series": "4×6-8", "descanso": "3min" }
      ]
    }
  ],
  "tips": [
    {
      "titulo": "Nutrición",
      "consejo": "Tip específico basado en el perfil y objetivo del atleta"
    }
  ]
}

REGLAS:
- score debe ser un número del 1 al 10
- Incluye mínimo 3 mejoras específicas y accionables
- Para progresion_pesos incluye TODOS los ejercicios listados
- El peso_siguiente debe aplicar el principio de sobrecarga progresiva correctamente (típicamente 2.5-5kg para pierna, 1.25-2.5kg para brazo)
- Ajusta todo al objetivo: ${profile.goal}
- Si hay lesiones (${profile.injuries}), considera esto en tu análisis
- La rutina_optimizada debe tener exactamente ${profile.days} días
- Responde solo el JSON, nada más`
}

/**
 * Streaming prompt for detailed narrative analysis
 */
export function buildNarrativePrompt(profile, exercises) {
  const exerciseList = exercises
    .map(e => `• ${e.name}: ${e.weight}kg × ${e.sets} series × ${e.reps} reps`)
    .join('\n')

  return `Eres un entrenador personal experto. Da un análisis narrativo breve y directo (máximo 200 palabras) de esta rutina. Sé específico, usa bullet points, sé directo como un coach real. No seas genérico.

Atleta: ${profile.age} años, ${profile.weight}kg, ${profile.experience}, objetivo ${profile.goal}, ${profile.days} días/semana${profile.injuries ? `, lesión: ${profile.injuries}` : ''}.

Ejercicios:
${exerciseList}

Análisis:`
}
