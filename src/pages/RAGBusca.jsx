import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarRAG, getApiKey, saveApiKey } from '../services/ragService.js'

const EXEMPLOS = [
  'Quais pets não gostam de barulho?',
  'Quais cães são bons com crianças?',
  'Quais pets precisam de atenção especial?',
  'Qual pet é mais agitado e brincalhão?',
  'Quais gatos são calmos e independentes?',
  'Quais pets têm medo de outros animais?',
]

const EMOJI = { cachorro: '🐶', gato: '🐱', ave: '🐦', roedor: '🐭', outro: '🐾' }

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  )
}

export default function RAGBusca() {
  const [query, setQuery]       = useState('')
  const [apiKey, setApiKey_]    = useState(getApiKey)
  const [resultado, setResultado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro]         = useState('')

  const trocarKey = v => { setApiKey_(v); saveApiKey(v) }

  const buscar = async () => {
    if (!query.trim()) return
    if (!apiKey) { setErro('Informe a chave API Groq para usar o RAG.'); return }
    setBuscando(true)
    setErro('')
    setResultado(null)
    try {
      const res = await buscarRAG(query.trim(), apiKey)
      setResultado(res)
    } catch (e) {
      setErro(e.message)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className="ti ti-search text-brand-500" /> Busca Semântica — RAG
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Faça perguntas em linguagem natural sobre comportamentos, histórico e
          características dos pets. O sistema busca nas memórias registradas pelos voluntários.
        </p>
      </div>

      {/* Como funciona */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-700 space-y-1">
        <p className="font-semibold">Como funciona o RAG?</p>
        <p>
          Cada pet tem uma "memória viva" formada por relatos e áudios dos voluntários.
          O sistema recupera todas essas memórias e usa o modelo de linguagem da Groq
          para encontrar os pets que melhor correspondem à sua pergunta.
        </p>
      </div>

      {/* Chave API */}
      <div className="section-card p-4 space-y-2">
        <label className="label flex items-center gap-1" htmlFor="rag-api-key">
          <i className="ti ti-key text-gray-400" /> Chave API Groq
        </label>
        <input
          id="rag-api-key"
          type="password"
          value={apiKey}
          onChange={e => trocarKey(e.target.value)}
          placeholder="gsk_..."
          className="input text-sm"
          aria-label="Chave API Groq"
        />
      </div>

      {/* Campo de busca */}
      <div className="section-card p-5 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Ex: Quais pets não gostam de barulho?"
            className="input flex-1"
            aria-label="Pergunta sobre os pets"
          />
          <button
            onClick={buscar}
            disabled={buscando || !query.trim() || !apiKey}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {buscando ? <Spinner /> : <i className="ti ti-search" />}
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {buscando && (
          <p className="text-sm text-gray-400 animate-pulse text-center">
            Consultando memórias dos pets via Groq... pode levar alguns segundos.
          </p>
        )}

        <div>
          <p className="text-xs text-gray-400 mb-2">Exemplos de perguntas:</p>
          <div className="flex flex-wrap gap-2">
            {EXEMPLOS.map(ex => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-brand-100 hover:text-brand-600 rounded-full text-gray-600 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <i className="ti ti-alert-circle flex-shrink-0" aria-hidden="true" />{erro}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4">

          {/* Métricas */}
          <div className="flex gap-4 text-sm text-gray-500 px-1">
            <span><i className="ti ti-brain mr-1" />{resultado.totalMemoriasIndexadas} memórias indexadas</span>
            <span>·</span>
            <span><i className="ti ti-paw mr-1" />{resultado.totalPets} pets na base</span>
          </div>

          {/* Resposta do LLM */}
          <div className="section-card p-5">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="ti ti-sparkles text-brand-500" /> Resposta
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {resultado.resposta}
            </div>
          </div>

          {/* Pets identificados */}
          {resultado.petsEncontrados?.length > 0 && (
            <div className="section-card p-5">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i className="ti ti-paw text-brand-500" /> Pets Relacionados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resultado.petsEncontrados.map(pet => (
                  <Link
                    key={pet.id}
                    to={`/memorias/${pet.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-brand-50 rounded-xl transition-colors group"
                  >
                    <span className="text-2xl flex-shrink-0">
                      {EMOJI[pet.especie?.toLowerCase()] ?? '🐾'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 group-hover:text-brand-600 truncate">
                        {pet.nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pet.especie}{pet.porte ? ` · porte ${pet.porte}` : ''}
                      </p>
                    </div>
                    <i className="ti ti-brain text-gray-300 group-hover:text-brand-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Estado inicial vazio */}
      {!resultado && !buscando && !erro && (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <i className="ti ti-brain text-6xl block opacity-20" />
          <p>Digite uma pergunta sobre os pets para iniciar a busca.</p>
          <p className="text-sm">
            O RAG pesquisa nas memórias e observações registradas pelos voluntários.
          </p>
          <Link to="/admin" className="btn-secondary text-sm inline-flex items-center gap-1 mt-2">
            <i className="ti ti-paw" /> Ver pets no Admin
          </Link>
        </div>
      )}

    </div>
  )
}
