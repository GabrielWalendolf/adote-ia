import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import GravadorAudio from '../components/GravadorAudio.jsx'
import {
  listarMemorias,
  adicionarMemoria,
  enviarAudio,
  deletarMemoria,
} from '../services/ragService.js'
import { getApiKey } from '../services/configService.js'

const TIPO_ICON = { audio: 'ti-microphone', texto: 'ti-note', relato: 'ti-file-description' }
const TIPO_COR  = {
  audio:  'bg-purple-100 text-purple-700',
  texto:  'bg-blue-100 text-blue-700',
  relato: 'bg-green-100 text-green-700',
}

const EMOJI = { cachorro: '🐶', gato: '🐱', ave: '🐦', roedor: '🐭', outro: '🐾' }

function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export default function Memorias() {
  const { id } = useParams()
  const [pet, setPet]               = useState(null)
  const [memorias, setMemorias]     = useState([])
  const [novaObs, setNovaObs]       = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando]     = useState(false)
  const [transcrevendo, setTranscrevendo] = useState(false)
  const [erro, setErro]             = useState('')

  const apiKey = getApiKey()

  useEffect(() => {
    Promise.all([
      fetch(`/api/pets/${id}`).then(r => r.json()),
      listarMemorias(id),
    ])
      .then(([p, m]) => { setPet(p); setMemorias(m) })
      .catch(() => setErro('Erro ao carregar dados do pet.'))
      .finally(() => setCarregando(false))
  }, [id])

  const salvar = async () => {
    if (!novaObs.trim()) return
    setSalvando(true)
    setErro('')
    try {
      const nova = await adicionarMemoria(id, novaObs.trim())
      setMemorias(prev => [nova, ...prev])
      setNovaObs('')
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const onGravacao = async blob => {
    if (!apiKey) { setErro('Este recurso ainda não foi configurado. Peça ao administrador para configurar o acesso no Painel Admin.'); return }
    setTranscrevendo(true)
    setErro('')
    try {
      const nova = await enviarAudio(id, blob, apiKey)
      setMemorias(prev => [nova, ...prev])
    } catch (e) {
      setErro(e.message)
    } finally {
      setTranscrevendo(false)
    }
  }

  const excluir = async memoriaId => {
    if (!confirm('Excluir esta memória?')) return
    try {
      await deletarMemoria(memoriaId)
      setMemorias(prev => prev.filter(m => m.id !== memoriaId))
    } catch (e) {
      setErro(e.message)
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner className="w-8 h-8 text-brand-500" />
      </div>
    )
  }

  if (!pet || pet.erro) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">
        <p>Pet não encontrado.</p>
        <Link to="/admin" className="btn-secondary mt-4 inline-block">← Voltar</Link>
      </div>
    )
  }

  const emoji = EMOJI[pet.especie?.toLowerCase()] ?? '🐾'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <i className="ti ti-arrow-left text-xl" />
        </Link>
        <span className="text-3xl">{emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Memórias do {pet.nome}
          </h1>
          <p className="text-sm text-gray-400">
            {pet.especie}
            {pet.raca ? ` · ${pet.raca}` : ''}
            {pet.porte ? ` · porte ${pet.porte}` : ''}
          </p>
        </div>
        <span className="ml-auto">
          <Link to="/rag" className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
            <i className="ti ti-search" />
            Perguntar sobre os Pets
          </Link>
        </span>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {erro}
        </div>
      )}

      {/* Observação em texto */}
      <div className="section-card p-5 space-y-3">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          <i className="ti ti-note text-blue-500" /> Nova Observação em Texto
        </h2>
        <textarea
          value={novaObs}
          onChange={e => setNovaObs(e.target.value)}
          placeholder={`Ex: O ${pet.nome} fica ansioso quando ouve moto. Gosta de brincar com bolas...`}
          rows={3}
          className="input resize-none text-sm"
        />
        <button
          onClick={salvar}
          disabled={salvando || !novaObs.trim()}
          className="btn-primary flex items-center gap-2"
        >
          {salvando ? <Spinner /> : <i className="ti ti-device-floppy" />}
          {salvando ? 'Salvando...' : 'Salvar Observação'}
        </button>
      </div>

      {/* Gravação de áudio */}
      <div className="section-card p-5 space-y-3">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          <i className="ti ti-microphone text-purple-500" /> Nova Observação em Áudio
        </h2>
        <p className="text-sm text-gray-500">
          Grave um relato de voz — ele será transcrito automaticamente em texto e
          adicionado ao histórico do pet.
        </p>

        {transcrevendo ? (
          <div className="flex items-center gap-2 text-purple-600">
            <Spinner className="text-purple-500" />
            <span className="text-sm">Transcrevendo áudio...</span>
          </div>
        ) : (
          <GravadorAudio onGravacao={onGravacao} desabilitado={!apiKey || transcrevendo} />
        )}

        {!apiKey && (
          <p className="text-xs text-amber-600">
            ⚠ A transcrição de voz precisa ser configurada pelo administrador no Painel Admin.
          </p>
        )}
      </div>

      {/* Lista de memórias */}
      <div className="section-card p-5">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <i className="ti ti-brain text-brand-500" /> Histórico Registrado
          </span>
          <span className="badge bg-brand-100 text-brand-600">{memorias.length}</span>
        </h2>

        {memorias.length === 0 ? (
          <div className="text-center py-10 text-gray-400 space-y-1">
            <i className="ti ti-brain text-5xl block opacity-20" />
            <p className="text-sm">Nenhum histórico registrado ainda.</p>
            <p className="text-xs">Adicione observações de texto ou grave um áudio acima.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {memorias.map(m => (
              <li key={m.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl group">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm flex-shrink-0 ${TIPO_COR[m.tipo] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  <i className={`ti ${TIPO_ICON[m.tipo] ?? 'ti-note'}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed">{m.conteudo}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {m.tipo === 'audio' ? '🎙 Transcrição de áudio' : '📝 Observação em texto'}
                    {' · '}
                    {new Date(m.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => excluir(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all self-start mt-0.5"
                  title="Excluir memória"
                >
                  <i className="ti ti-trash text-sm" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
