import { useState, useEffect } from 'react'
import { usePets } from '../hooks/usePets'
import PetCard from '../components/PetCard.jsx'
import { Input, Select, Textarea, CheckItem } from '../components/FormField.jsx'
import { getStats } from '../services/petService'
import { getApiKey, saveApiKey } from '../services/configService.js'

const vazio = {
  nome: '', especie: '', raca: '', idade: '', sexo: '', porte: 'medio',
  status: 'disponivel', vacinado: false, castrado: false, vermifugado: false,
  descricao: '', contato: '', adotado_por: '',
}

export default function Admin() {
  const { pets, loading, atualizar, remover } = usePets()
  const [stats, setStats]     = useState(null)
  const [busca, setBusca]     = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm]         = useState(vazio)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [apiKey, setApiKey]     = useState(getApiKey)

  const trocarApiKey = v => { setApiKey(v); saveApiKey(v) }

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
  }, [pets])

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const abrirEditor = (pet) => {
    setEditando(pet)
    setForm({
      nome:        pet.nome        || '',
      especie:     pet.especie     || '',
      raca:        pet.raca        || '',
      idade:       pet.idade       || '',
      sexo:        pet.sexo        || '',
      porte:       pet.porte       || 'medio',
      status:      pet.status      || 'disponivel',
      vacinado:    !!pet.vacinado,
      castrado:    !!pet.castrado,
      vermifugado: !!pet.vermifugado,
      descricao:   pet.descricao   || '',
      contato:     pet.contato     || '',
      adotado_por: pet.adotado_por || '',
    })
    setErro('')
  }

  const salvar = async () => {
    setErro('')
    if (!form.nome.trim() || !form.especie) {
      setErro('Nome e espécie são obrigatórios.')
      return
    }
    setSalvando(true)
    try {
      await atualizar(editando.id, form)
      setEditando(null)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const filtrados = pets.filter(p => {
    const t = busca.toLowerCase()
    return !busca || p.nome?.toLowerCase().includes(t) || p.raca?.toLowerCase().includes(t)
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="ti ti-settings mr-2 text-brand-500"></i>Painel Admin
      </h1>

      <div className="section-card mb-6">
        <p className="section-label flex items-center gap-1">
          <i className="ti ti-key text-gray-400" /> Configurações
        </p>
        <label className="label" htmlFor="admin-api-key">Chave de acesso à IA</label>
        <input
          id="admin-api-key"
          type="password"
          placeholder="gsk_..."
          value={apiKey}
          onChange={e => trocarApiKey(e.target.value)}
          className="input text-sm"
          aria-label="Chave de acesso à IA (Groq)"
        />
        <p className="text-xs text-gray-400 mt-1">
          Necessária para as recomendações de pets e para transcrever áudios em texto.
          Obtenha uma chave gratuita em{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-brand-500 underline">
            console.groq.com
          </a>
          . Fica salva apenas neste navegador e vale para todos os recursos de IA do sistema.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="section-card text-center">
            <div className="text-2xl font-bold text-brand-500">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">Total</div>
          </div>
          <div className="section-card text-center">
            <div className="text-2xl font-bold text-green-500">{stats.disponiveis}</div>
            <div className="text-xs text-gray-400 mt-1">Disponíveis</div>
          </div>
          <div className="section-card text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.adotados}</div>
            <div className="text-xs text-gray-400 mt-1">Adotados</div>
          </div>
          <div className="section-card text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.gatos}</div>
            <div className="text-xs text-gray-400 mt-1">Gatos</div>
          </div>
        </div>
      )}

      <div className="section-card mb-6">
        <div className="relative">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            className="input pl-9"
            placeholder="Buscar pet por nome ou raça..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            aria-label="Buscar pet por nome ou raça"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Nenhum pet encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEditar={abrirEditor}
              onRemover={remover}
            />
          ))}
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Editar — {editando.nome}</h2>
              <button onClick={() => setEditando(null)} aria-label="Fechar" className="text-gray-400 hover:text-gray-600 text-xl">
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Input label="Nome *" value={form.nome} onChange={e => set('nome', e.target.value)} />

              <div className="grid grid-cols-2 gap-4">
                <Select label="Espécie *" value={form.especie} onChange={e => set('especie', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="cachorro">Cachorro</option>
                  <option value="gato">Gato</option>
                  <option value="ave">Ave</option>
                  <option value="roedor">Roedor</option>
                  <option value="outro">Outro</option>
                </Select>
                <Input label="Raça" value={form.raca} onChange={e => set('raca', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Idade" value={form.idade} onChange={e => set('idade', e.target.value)} />
                <Select label="Sexo" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                  <option value="">Não informado</option>
                  <option value="macho">Macho</option>
                  <option value="fêmea">Fêmea</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="Porte" value={form.porte} onChange={e => set('porte', e.target.value)}>
                  <option value="pequeno">Pequeno</option>
                  <option value="medio">Médio</option>
                  <option value="grande">Grande</option>
                </Select>
                <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="adotado">Adotado</option>
                </Select>
              </div>

              <div className="flex gap-4 flex-wrap">
                <CheckItem label="Vacinado"    checked={form.vacinado}    onChange={v => set('vacinado', v)} />
                <CheckItem label="Castrado"    checked={form.castrado}    onChange={v => set('castrado', v)} />
                <CheckItem label="Vermifugado" checked={form.vermifugado} onChange={v => set('vermifugado', v)} />
              </div>

              <Textarea label="Descrição" value={form.descricao} onChange={e => set('descricao', e.target.value)} />
              <Input label="Contato" value={form.contato} onChange={e => set('contato', e.target.value)} />

              {form.status === 'adotado' && (
                <Input
                  label="Adotado por (nome do adotante)"
                  placeholder="Ex: João Silva"
                  value={form.adotado_por}
                  onChange={e => set('adotado_por', e.target.value)}
                />
              )}

              {erro && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{erro}</div>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setEditando(null)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={salvar} disabled={salvando} className="btn-primary flex-1">
                  {salvando ? <><span className="spinner mr-2"></span>Salvando...</> : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
