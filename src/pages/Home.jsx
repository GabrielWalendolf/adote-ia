import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../services/petService'

const cards = [
  { to: '/adocao',   icon: 'ti-sparkles', titulo: 'Adoção com IA',      desc: 'Preencha seu perfil e receba recomendações personalizadas de pets compatíveis.', cor: 'text-brand-500' },
  { to: '/pets',     icon: 'ti-paw',      titulo: 'Ver Pets',           desc: 'Explore todos os animais disponíveis para adoção.', cor: 'text-brand-500' },
  { to: '/rag',      icon: 'ti-search',   titulo: 'Busca Semântica RAG', desc: 'Faça perguntas em linguagem natural e encontre pets por comportamento, histórico e relatos dos voluntários.', cor: 'text-purple-500' },
  { to: '/cadastro', icon: 'ti-plus',     titulo: 'Cadastrar Pet',      desc: 'Adicione um novo animal ao sistema de adoção.', cor: 'text-brand-500' },
  { to: '/admin',    icon: 'ti-settings', titulo: 'Painel Admin',       desc: 'Gerencie pets, edite dados e acesse as memórias registradas pelos voluntários.', cor: 'text-brand-500' },
]

export default function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">🐾 Adoção Inteligente</h1>
        <p className="text-xl text-gray-500">Encontre o pet ideal com ajuda da inteligência artificial.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="section-card text-center">
            <div className="text-3xl font-bold text-brand-500">{stats.total}</div>
            <div className="text-sm text-gray-400 mt-1">Total de Pets</div>
          </div>
          <div className="section-card text-center">
            <div className="text-3xl font-bold text-green-500">{stats.disponiveis}</div>
            <div className="text-sm text-gray-400 mt-1">Disponíveis</div>
          </div>
          <div className="section-card text-center">
            <div className="text-3xl font-bold text-gray-400">{stats.adotados}</div>
            <div className="text-sm text-gray-400 mt-1">Adotados</div>
          </div>
          <div className="section-card text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.cachorros}</div>
            <div className="text-sm text-gray-400 mt-1">Cachorros</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map(({ to, icon, titulo, desc, cor }) => (
          <Link
            key={to}
            to={to}
            className="section-card hover:shadow-md transition-all hover:-translate-y-0.5 block"
          >
            <div className="flex items-center gap-3 mb-2">
              <i className={`ti ${icon} text-2xl ${cor}`}></i>
              <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
            </div>
            <p className="text-gray-400 text-sm">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Destaque RAG + Transcrição */}
      <div className="mt-10 bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-100 rounded-2xl p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
          🧠 Memórias Vivas dos Pets
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Voluntários podem gravar <strong>áudios</strong> com observações sobre cada pet.
          O sistema transcreve automaticamente com <strong>Groq Whisper</strong> e indexa
          em um <strong>RAG</strong> — permitindo buscas semânticas como:
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {['"Quais pets não gostam de barulho?"', '"Qual cão é bom com crianças?"', '"Quais gatos são mais calmos?"'].map(ex => (
            <span key={ex} className="bg-white border border-purple-100 rounded-full px-3 py-1 text-purple-700 font-medium">
              {ex}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
