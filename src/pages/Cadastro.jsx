import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePets } from '../hooks/usePets'
import { Input, Select, Textarea, CheckItem } from '../components/FormField.jsx'

const vazio = {
  nome: '', especie: '', raca: '', idade: '', sexo: '', porte: 'medio',
  status: 'disponivel', vacinado: false, castrado: false, vermifugado: false,
  descricao: '', contato: '',
}

export default function Cadastro() {
  const { criar } = usePets()
  const navigate  = useNavigate()
  const [form, setForm]       = useState(vazio)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [sucesso, setSucesso]   = useState(false)

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const salvar = async () => {
    setErro('')
    if (!form.nome.trim() || !form.especie) {
      setErro('Nome e espécie são obrigatórios.')
      return
    }
    setSalvando(true)
    try {
      await criar(form)
      setSucesso(true)
      setTimeout(() => navigate('/pets'), 1500)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">Pet cadastrado com sucesso!</h2>
        <p className="text-gray-400 mt-2">Redirecionando para a lista de pets...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="ti ti-plus mr-2 text-brand-500"></i>Cadastrar Pet
      </h1>

      <div className="section-card flex flex-col gap-4">
        <p className="section-label">Dados do Pet</p>

        <Input label="Nome *" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Rex" />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Espécie *" value={form.especie} onChange={e => set('especie', e.target.value)}>
            <option value="">Selecione</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
            <option value="ave">Ave</option>
            <option value="roedor">Roedor</option>
            <option value="outro">Outro</option>
          </Select>
          <Input label="Raça" value={form.raca} onChange={e => set('raca', e.target.value)} placeholder="Ex: Labrador" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Idade" value={form.idade} onChange={e => set('idade', e.target.value)} placeholder="Ex: 2 anos" />
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

        <p className="section-label mt-2">Saúde</p>
        <div className="flex flex-wrap gap-4">
          <CheckItem label="Vacinado"    checked={form.vacinado}    onChange={v => set('vacinado', v)} />
          <CheckItem label="Castrado"    checked={form.castrado}    onChange={v => set('castrado', v)} />
          <CheckItem label="Vermifugado" checked={form.vermifugado} onChange={v => set('vermifugado', v)} />
        </div>

        <p className="section-label mt-2">Mais informações</p>
        <Textarea label="Descrição" value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Conte um pouco sobre o pet..." />
        <Input label="Contato" value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="Telefone ou e-mail" />

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{erro}</div>
        )}

        <button onClick={salvar} disabled={salvando} className="btn-primary mt-2">
          {salvando ? <><span className="spinner mr-2"></span>Salvando...</> : 'Cadastrar Pet'}
        </button>
      </div>
    </div>
  )
}
