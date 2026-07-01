const CHAVE_LS = 'groq_api_key'

export function getApiKey() {
  return localStorage.getItem(CHAVE_LS) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(CHAVE_LS, key)
}
