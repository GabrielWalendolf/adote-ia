const CHAVE_LS = 'groq_api_key'

export function getApiKey() {
  return localStorage.getItem(CHAVE_LS) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(CHAVE_LS, key)
}

export async function listarMemorias(petId) {
  const res = await fetch(`/api/pets/${petId}/memories`)
  if (!res.ok) throw new Error('Erro ao carregar memórias.')
  return res.json()
}

export async function adicionarMemoria(petId, conteudo, tipo = 'texto') {
  const res = await fetch(`/api/pets/${petId}/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conteudo, tipo }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.erro || 'Erro ao salvar memória.')
  }
  return res.json()
}

export async function enviarAudio(petId, audioBlob, apiKey) {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'gravacao.webm')
  formData.append('apiKey', apiKey)

  const res = await fetch(`/api/pets/${petId}/audio`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.erro || 'Erro na transcrição.')
  }
  return res.json()
}

export async function deletarMemoria(memoriaId) {
  const res = await fetch(`/api/memories/${memoriaId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao deletar memória.')
  return res.json()
}

const RAG_CACHE_TTL = 30 * 60 * 1000 // 30 minutos

function cacheKey(query, apiKey) {
  return `rag_cache:${query.trim().toLowerCase()}:${apiKey.slice(0, 8)}`
}

function lerCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > RAG_CACHE_TTL) { localStorage.removeItem(key); return null }
    return data
  } catch { return null }
}

function gravarCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

export async function buscarRAG(query, apiKey) {
  const key = cacheKey(query, apiKey)
  const cached = lerCache(key)
  if (cached) return cached

  const res = await fetch('/api/rag/busca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, apiKey }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.erro || 'Erro na busca RAG.')
  }
  const data = await res.json()
  gravarCache(key, data)
  return data
}
