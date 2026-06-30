import { useState } from 'react'
import { usePets } from '../hooks/usePets'
import PetCard from '../components/PetCard.jsx'

const ESPECIES = ['Todos', 'Cachorro', 'Gato', 'Ave', 'Roedor', 'Outro']
const STATUS   = ['Todos', 'Disponível', 'Adotado', 'Reservado']
const STATUS_MAP = { 'Disponível': 'disponivel', 'Adotado': 'adotado', 'Reservado': 'reservado' }
const POR_PAGINA = 9

function SkeletonCard() {
  return (
    <div className="section-card flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-12 bg-gray-100 rounded-full" />
        <div className="h-5 w-12 bg-gray-100 rounded-full" />
      </div>
      <div className="h-8 bg-gray-100 rounded" />
    </div>
  )
}

export default function Pets() {
  const { pets, loading } = usePets()
  const [especie, setEspecie] = useState('Todos')
  const [status, setStatus]   = useState('Todos')
  const [busca, setBusca]     = useState('')
  const [pagina, setPagina]   = useState(1)

  const filtrados = pets.filter(p => {
    const matchEspecie = especie === 'Todos' || p.especie?.toLowerCase() === especie.toLowerCase()
    const matchStatus  = status === 'Todos'  || p.status === STATUS_MAP[status]
    const termo        = busca.toLowerCase()
    const matchBusca   = !busca || p.nome?.toLowerCase().includes(termo) || p.raca?.toLowerCase().includes(termo)
    return matchEspecie && matchStatus && matchBusca
  })

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA)
  const paginaAtual  = Math.min(pagina, Math.max(1, totalPaginas))
  const inicio       = (paginaAtual - 1) * POR_PAGINA
  const paginados    = filtrados.slice(inicio, inicio + POR_PAGINA)

  const mudarFiltro = (fn) => { fn(); setPagina(1) }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🐾 Pets para Adoção</h1>
        <span className="text-sm text-gray-400">{filtrados.length} encontrado{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="section-card mb-6 flex flex-col gap-4">
        <div className="relative">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome ou raça..."
            value={busca}
            onChange={e => mudarFiltro(() => setBusca(e.target.value))}
            aria-label="Buscar pet por nome ou raça"
          />
        </div>

        <div>
          <p className="section-label" id="label-especie">Espécie</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="label-especie">
            {ESPECIES.map(e => (
              <button
                key={e}
                onClick={() => mudarFiltro(() => setEspecie(e))}
                aria-pressed={especie === e}
                className={`btn-secondary text-sm py-1.5 px-3 ${especie === e ? '!bg-brand-100 !text-brand-600' : ''}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label" id="label-status">Status</p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="label-status">
            {STATUS.map(s => (
              <button
                key={s}
                onClick={() => mudarFiltro(() => setStatus(s))}
                aria-pressed={status === s}
                className={`btn-secondary text-sm py-1.5 px-3 ${status === s ? '!bg-brand-100 !text-brand-600' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Carregando pets">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400" role="status">
          🐾 Nenhum pet encontrado com esses filtros.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginados.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8" role="navigation" aria-label="Paginação">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="btn-secondary py-1.5 px-3 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <i className="ti ti-chevron-left" />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPagina(n)}
                  aria-current={n === paginaAtual ? 'page' : undefined}
                  className={`btn-secondary py-1.5 px-3 min-w-[2.5rem] ${n === paginaAtual ? '!bg-brand-100 !text-brand-600' : ''}`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="btn-secondary py-1.5 px-3 disabled:opacity-40"
                aria-label="Próxima página"
              >
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
