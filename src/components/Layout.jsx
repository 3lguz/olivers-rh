import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, DollarSign, AlertTriangle,
  MessageSquare, BarChart3, Settings, LogOut,
  Calendar, TrendingUp, ShoppingCart, ClipboardList
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/meu-dia', icon: Calendar, label: 'Meu Dia' },
  { to: '/funcionarios', icon: Users, label: 'Funcionários' },
  { to: '/folha', icon: DollarSign, label: 'Folha & Custos' },
  { to: '/ocorrencias', icon: AlertTriangle, label: 'Ocorrências' },
  { to: '/headcount', icon: TrendingUp, label: 'Headcount' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios IA' },
  { to: '/assistente', icon: MessageSquare, label: 'Assistente IA' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080c10' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: '#0f1520',
        borderRight: '1px solid #1e2d42',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e2d42' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #00e5a0, #4f8ef7)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0
            }}>🛒</div>
            <div>
              <div style={{ fontFamily:'Syne', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>Oliver's RH</div>
              <div style={{ fontSize: 11, color: '#00e5a0', fontWeight: 600 }}>PRO</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e2d42' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10, padding: '8px 8px', borderRadius: 10 }}>
            <img
              src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=G'}
              alt="avatar"
              style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #00e5a0' }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName?.split(' ')[0] || 'Gustavo'}
              </div>
              <div style={{ fontSize: 11, color: '#8892a4' }}>Gestor de RH</div>
            </div>
            <button onClick={handleLogout} title="Sair" style={{ background:'none', border:'none', cursor:'pointer', color:'#4a5568', padding: 4 }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
