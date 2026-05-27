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

export async function buscarRAG(query, apiKey) {
  const res = await fetch('/api/rag/busca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, apiKey }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.erro || 'Erro na busca RAG.')
  }
  return res.json()
}
