import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,229,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Glow blobs */}
      <div style={{ position:'absolute', top:'15%', left:'10%', width:400, height:400, background:'rgba(0,229,160,0.06)', borderRadius:'50%', filter:'blur(80px)' }} />
      <div style={{ position:'absolute', bottom:'15%', right:'10%', width:350, height:350, background:'rgba(79,142,247,0.06)', borderRadius:'50%', filter:'blur(80px)' }} />

      <div className="relative z-10 animate-up" style={{ textAlign:'center', maxWidth: 420, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #00e5a0, #4f8ef7)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: 32,
          boxShadow: '0 0 40px rgba(0,229,160,0.3)'
        }}>
          🛒
        </div>

        <h1 className="text-gradient" style={{ fontFamily:'Syne', fontSize: 38, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
          Oliver's RH Pro
        </h1>
        <p style={{ color: '#8892a4', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
          Sistema de Gestão de Recursos Humanos<br/>
          <span style={{ color: '#00e5a0', fontWeight: 600 }}>Oliver's Supermercado · Franca/SP</span>
        </p>

        <button
          onClick={login}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16, borderRadius: 12 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </button>

        <p style={{ marginTop: 24, color: '#4a5568', fontSize: 13 }}>
          Acesso restrito à equipe do Oliver's
        </p>
      </div>
    </div>
  )
}
