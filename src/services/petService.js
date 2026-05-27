const BASE = '/api'

export async function getAllPets() {
  const r = await fetch(`${BASE}/pets`)
  if (!r.ok) throw new Error('Erro ao buscar pets')
  return r.json()
}

export async function getPetById(id) {
  const r = await fetch(`${BASE}/pets/${id}`)
  if (!r.ok) throw new Error('Pet não encontrado')
  return r.json()
}

export async function addPet(data) {
  const r = await fetch(`${BASE}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await r.json()
  if (!r.ok) throw new Error(json.erro || 'Erro ao cadastrar pet')
  return json
}

export async function updatePet(id, data) {
  const r = await fetch(`${BASE}/pets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await r.json()
  if (!r.ok) throw new Error(json.erro || 'Erro ao atualizar pet')
  return json
}

export async function deletePet(id) {
  const r = await fetch(`${BASE}/pets/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Erro ao remover pet')
  return r.json()
}

export async function getStats() {
  const r = await fetch(`${BASE}/pets/stats`)
  if (!r.ok) throw new Error('Erro ao buscar estatísticas')
  return r.json()
}
