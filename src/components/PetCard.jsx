import { Link } from 'react-router-dom'

const EMOJI = { cachorro: '🐶', gato: '🐱', ave: '🐦', roedor: '🐭', outro: '🐾' }

const STATUS_STYLE = {
  disponivel: 'bg-green-100 text-green-700',
  adotado:    'bg-gray-100 text-gray-500',
  reservado:  'bg-yellow-100 text-yellow-700',
}

const STATUS_LABEL = {
  disponivel: 'Disponível',
  adotado:    'Adotado',
  reservado:  'Reservado',
}

export default function PetCard({ pet, onEditar, onRemover }) {
  const emoji       = EMOJI[pet.especie?.toLowerCase()] ?? '🐾'
  const statusStyle = STATUS_STYLE[pet.status] ?? STATUS_STYLE.disponivel
  const statusLabel = STATUS_LABEL[pet.status] ?? pet.status

  return (
    <div className="section-card flex flex-col gap-3 hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-bold text-gray-800 leading-tight">{pet.nome}</h3>
            <p className="text-sm text-gray-400">{pet.raca || pet.especie}</p>
          </div>
        </div>
        <span className={`badge ${statusStyle}`}>{statusLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {pet.porte && (
          <span className="badge bg-brand-100 text-brand-600">{pet.porte}</span>
        )}
        {pet.sexo && (
          <span className="badge bg-gray-100 text-gray-600">{pet.sexo}</span>
        )}
        {pet.idade && (
          <span className="badge bg-gray-100 text-gray-600">{pet.idade}</span>
        )}
        {!!pet.vacinado && (
          <span className="badge bg-blue-100 text-blue-600">✓ Vacinado</span>
        )}
        {!!pet.castrado && (
          <span className="badge bg-purple-100 text-purple-600">✓ Castrado</span>
        )}
      </div>

      {pet.descricao && (
        <p className="text-sm text-gray-500 line-clamp-2">{pet.descricao}</p>
      )}

      {(onEditar || onRemover) && (
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <Link
            to={`/memorias/${pet.id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <i className="ti ti-brain text-base" />
            Memórias & Áudio
          </Link>
          <div className="flex gap-2">
            {onEditar && (
              <button
                onClick={() => onEditar(pet)}
                className="btn-secondary text-sm py-1.5 px-3 flex-1"
              >
                <i className="ti ti-pencil mr-1" />Editar
              </button>
            )}
            {onRemover && (
              <button
                onClick={() => onRemover(pet.id)}
                className="btn-danger flex-1"
              >
                <i className="ti ti-trash mr-1" />Remover
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
