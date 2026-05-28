import { useState } from 'react'
import { usePets } from '../hooks/usePets'
import PetCard from '../components/PetCard.jsx'

const ESPECIES = ['Todos', 'Cachorro', 'Gato', 'Ave', 'Roedor', 'Outro']
const STATUS   = ['Todos', 'Disponível', 'Adotado', 'Reservado']

const STATUS_MAP = { 'Disponível': 'disponivel', 'Adotado': 'adotado', 'Reservado': 'reservado' }

export default function Pets() {
  const { pets, loading } = usePets()
  const [especie, setEspecie] = useState('Todos')
  const [status, setStatus]   = useState('Todos')
  const [busca, setBusca]     = useState('')

  const filtrados = pets.filter(p => {
    const matchEspecie = especie === 'Todos' || p.especie?.toLowerCase() === especie.toLowerCase()
    const matchStatus  = status === 'Todos'  || p.status === STATUS_MAP[status]
    const termo        = busca.toLowerCase()
    const matchBusca   = !busca || p.nome?.toLowerCase().includes(termo) || p.raca?.toLowerCase().includes(termo)
    return matchEspecie && matchStatus && matchBusca
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🐾 Pets para Adoção</h1>
        <span className="text-sm text-gray-400">{filtrados.length} encontrado{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="section-card mb-6 flex flex-col gap-4">
        <div className="relative">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            className="input pl-9"
            placeholder="Buscar por nome ou raça..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div>
          <p className="section-label">Espécie</p>
          <div className="flex flex-wrap gap-2">
            {ESPECIES.map(e => (
              <button
                key={e}
                onClick={() => setEspecie(e)}
                className={`btn-secondary text-sm py-1.5 px-3 ${especie === e ? '!bg-brand-100 !text-brand-600' : ''}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`btn-secondary text-sm py-1.5 px-3 ${status === s ? '!bg-brand-100 !text-brand-600' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregando pets...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          🐾 Nenhum pet encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
