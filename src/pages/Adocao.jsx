import { useState, useEffect } from 'react'
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
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem(CHAVE_LS) ?? '')
  const [perfil, setPerfil]     = useState(perfilVazio)
  const [resultado, setResultado] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]         = useState('')

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <i className="ti-sparkles mr-2 text-brand-500"></i>Adoção com IA
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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
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
          <label className="label">Horas disponíveis por dia: <strong>{perfil.horasDisponiveis}h</strong></label>
          <input
            type="range"
            min={0}
            max={8}
            value={perfil.horasDisponiveis}
            onChange={e => set('horasDisponiveis', Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0h</span><span>4h</span><span>8h+</span>
          </div>
        </div>
      </div>

      <div className="section-card mb-6 flex flex-col gap-3">
        <p className="section-label">Sobre sua casa e família</p>
        <div className="grid grid-cols-2 gap-3">
          <CheckItem label="Tem quintal"         checked={perfil.temQuintal}     onChange={v => set('temQuintal', v)} />
          <CheckItem label="Ambiente telado"     checked={perfil.ambienteTelado} onChange={v => set('ambienteTelado', v)} />
          <CheckItem label="Tem crianças"        checked={perfil.temCriancas}    onChange={v => set('temCriancas', v)} />
          <CheckItem label="Tem outros pets"     checked={perfil.temOutrosPets}  onChange={v => set('temOutrosPets', v)} />
          <CheckItem label="Alergia a pelos"     checked={perfil.alergiaPelos}   onChange={v => set('alergiaPelos', v)} />
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{erro}</div>
      )}

      <button onClick={analisar} disabled={carregando} className="btn-primary w-full mb-8 py-3 text-base">
        {carregando
          ? <><span className="spinner mr-2"></span>Analisando com IA...</>
          : <><i className="ti-sparkles mr-2"></i>Encontrar meu pet ideal</>
        }
      </button>

      {resultado && (
        <div className="section-card">
          <p className="section-label mb-3">
            <i className="ti-sparkles mr-1 text-brand-500"></i>Recomendação da IA
          </p>
          <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {resultado}
          </div>
        </div>
      )}
    </div>
  )
}
