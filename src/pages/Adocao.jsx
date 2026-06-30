import { useState } from 'react'
import { getAllPets } from '../services/petService'
import { recomendarPets } from '../services/groqService'
import { Input, Select, CheckItem } from '../components/FormField.jsx'

const CHAVE_LS = 'groq_api_key'

const perfilVazio = {
  nome: '',
  tipoMoradia: 'casa',
  temQuintal: false,
  ambienteTelado: false,
  temCriancas: false,
  temOutrosPets: false,
  especiePreferida: '',
  portePreferido: '',
  horasDisponiveis: 4,
  experiencia: 'alguma',
  alergiaPelos: false,
}

export default function Adocao() {
  const [apiKey, setApiKey]       = useState(() => localStorage.getItem(CHAVE_LS) ?? '')
  const [perfil, setPerfil]       = useState(perfilVazio)
  const [resultado, setResultado] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]           = useState('')

  const set = (campo, valor) => setPerfil(p => ({ ...p, [campo]: valor }))

  const salvarChave = (v) => {
    setApiKey(v)
    localStorage.setItem(CHAVE_LS, v)
  }

  const analisar = async () => {
    setErro('')
    setResultado('')
    if (!apiKey.trim()) {
      setErro('Informe sua chave da API Groq para continuar.')
      return
    }
    if (!perfil.nome.trim()) {
      setErro('Informe seu nome para personalizar a recomendação.')
      return
    }

    setCarregando(true)
    try {
      const todosPets = await getAllPets()
      const petsDisponiveis = todosPets.filter(p => p.status === 'disponivel')

      if (petsDisponiveis.length === 0) {
        setErro('Não há pets disponíveis para adoção no momento.')
        return
      }

      const recomendacao = await recomendarPets(apiKey, perfil, petsDisponiveis)
      setResultado(recomendacao)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  const textoWhatsApp = resultado
    ? encodeURIComponent(`Olá! Encontrei meu pet ideal pelo sistema de Adoção Inteligente:\n\n${resultado.slice(0, 500)}...`)
    : ''

  const textoEmail = resultado
    ? `mailto:?subject=Recomendação de pet - Adoção Inteligente&body=${encodeURIComponent(resultado)}`
    : ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <i className="ti ti-sparkles mr-2 text-brand-500" aria-hidden="true" />Adoção com IA
        </h1>
        <p className="text-gray-400 text-sm">
          Preencha seu perfil e a IA vai recomendar os pets do nosso banco que combinam com você.
        </p>
      </div>

      <div className="section-card mb-4">
        <p className="section-label">Chave API Groq</p>
        <Input
          type="password"
          placeholder="gsk_..."
          value={apiKey}
          onChange={e => salvarChave(e.target.value)}
          aria-label="Chave API Groq"
        />
        <p className="text-xs text-gray-400 mt-1">
          Obtenha sua chave gratuita em{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-brand-500 underline">
            console.groq.com
          </a>
          . A chave é salva apenas no seu navegador.
        </p>
      </div>

      <div className="section-card mb-4 flex flex-col gap-4">
        <p className="section-label">Seu Perfil</p>

        <Input
          label="Seu nome"
          placeholder="Ex: Maria"
          value={perfil.nome}
          onChange={e => set('nome', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Tipo de moradia"
            value={perfil.tipoMoradia}
            onChange={e => set('tipoMoradia', e.target.value)}
          >
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="chacara">Chácara / Sítio</option>
          </Select>

          <Select
            label="Experiência com pets"
            value={perfil.experiencia}
            onChange={e => set('experiencia', e.target.value)}
          >
            <option value="nenhuma">Nenhuma</option>
            <option value="alguma">Alguma</option>
            <option value="muita">Muita</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Espécie preferida"
            value={perfil.especiePreferida}
            onChange={e => set('especiePreferida', e.target.value)}
          >
            <option value="">Sem preferência</option>
            <option value="cachorro">Cachorro 🐶</option>
            <option value="gato">Gato 🐱</option>
            <option value="ave">Ave 🐦</option>
            <option value="roedor">Roedor 🐭</option>
          </Select>

          <Select
            label="Porte preferido"
            value={perfil.portePreferido}
            onChange={e => set('portePreferido', e.target.value)}
          >
            <option value="">Sem preferência</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </Select>
        </div>

        <div>
          <label className="label" id="label-horas">
            Horas disponíveis por dia: <strong>{perfil.horasDisponiveis}h</strong>
          </label>
          <input
            type="range"
            min={0}
            max={8}
            value={perfil.horasDisponiveis}
            onChange={e => set('horasDisponiveis', Number(e.target.value))}
            className="w-full accent-brand-500"
            aria-labelledby="label-horas"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1" aria-hidden="true">
            <span>0h</span><span>4h</span><span>8h+</span>
          </div>
        </div>
      </div>

      <div className="section-card mb-6 flex flex-col gap-3">
        <p className="section-label">Sobre sua casa e família</p>
        <div className="grid grid-cols-2 gap-3">
          <CheckItem label="Tem quintal"     checked={perfil.temQuintal}     onChange={v => set('temQuintal', v)} />
          <CheckItem label="Ambiente telado" checked={perfil.ambienteTelado} onChange={v => set('ambienteTelado', v)} />
          <CheckItem label="Tem crianças"    checked={perfil.temCriancas}    onChange={v => set('temCriancas', v)} />
          <CheckItem label="Tem outros pets" checked={perfil.temOutrosPets}  onChange={v => set('temOutrosPets', v)} />
          <CheckItem label="Alergia a pelos" checked={perfil.alergiaPelos}   onChange={v => set('alergiaPelos', v)} />
        </div>
      </div>

      {erro && (
        <div role="alert" className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200">
          <i className="ti ti-alert-circle mr-2" aria-hidden="true" />{erro}
        </div>
      )}

      <button onClick={analisar} disabled={carregando} className="btn-primary w-full mb-4 py-3 text-base">
        {carregando
          ? <><span className="spinner mr-2" aria-hidden="true" />Analisando com IA...</>
          : <><i className="ti ti-sparkles mr-2" aria-hidden="true" />Encontrar meu pet ideal</>
        }
      </button>

      {carregando && (
        <p className="text-center text-sm text-gray-400 mb-8 animate-pulse">
          A IA está analisando seu perfil com os pets disponíveis... pode levar alguns segundos.
        </p>
      )}

      {resultado && (
        <div className="section-card">
          <p className="section-label mb-3">
            <i className="ti ti-sparkles mr-1 text-brand-500" aria-hidden="true" />Recomendação da IA
          </p>
          <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-4">
            {resultado}
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <a
              href={`https://wa.me/?text=${textoWhatsApp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-sm flex items-center gap-1.5"
              aria-label="Compartilhar resultado via WhatsApp"
            >
              <i className="ti ti-brand-whatsapp text-green-600" aria-hidden="true" />
              Compartilhar no WhatsApp
            </a>
            <a
              href={textoEmail}
              className="btn-secondary text-sm flex items-center gap-1.5"
              aria-label="Enviar resultado por e-mail"
            >
              <i className="ti ti-mail text-brand-500" aria-hidden="true" />
              Enviar por e-mail
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
