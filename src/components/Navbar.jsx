import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',        label: 'Início',        icon: 'ti-home'     },
  { to: '/adocao',  label: 'Adoção IA',     icon: 'ti-sparkles' },
  { to: '/pets',    label: 'Pets',          icon: 'ti-paw'      },
  { to: '/cadastro',label: 'Cadastrar Pet', icon: 'ti-plus'     },
  { to: '/admin',   label: 'Admin',         icon: 'ti-settings' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-brand-500 text-lg">
          🐾 <span className="hidden sm:inline">Adoção Inteligente</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ` +
                (isActive
                  ? 'bg-brand-100 text-brand-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700')
              }
            >
              <i className={`${icon} text-base`}></i>
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
