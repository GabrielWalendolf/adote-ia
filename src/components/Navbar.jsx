import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',         label: 'Início',           icon: 'ti-home'        },
  { to: '/cadastro', label: 'Cadastrar',        icon: 'ti-plus'        },
  { to: '/pets',     label: 'Pets',             icon: 'ti-paw'         },
  { to: '/rag',      label: 'Perguntar',        icon: 'ti-search'      },
  { to: '/adocao',   label: 'Encontre seu Pet', icon: 'ti-sparkles'    },
  { to: '/admin',    label: 'Admin',            icon: 'ti-settings'    },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-brand-500 text-lg">
          🐾 <span className="hidden sm:inline">Adoção Inteligente</span>
        </NavLink>

        <nav className="flex items-center gap-0.5">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ` +
                (isActive
                  ? 'bg-brand-100 text-brand-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700')
              }
            >
              <i className={`ti ${icon} text-base`} />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
