import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Funcionarios from './pages/Funcionarios'
import Folha from './pages/Folha'
import Ocorrencias from './pages/Ocorrencias'
import Assistente from './pages/Assistente'
import { MeuDia, Headcount, Relatorios } from './pages/Others'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#080c10' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, background:'linear-gradient(135deg,#00e5a0,#4f8ef7)', borderRadius:14, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🛒</div>
        <p style={{ color:'#8892a4', fontSize:14 }}>Carregando...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/meu-dia" element={<PrivateRoute><MeuDia /></PrivateRoute>} />
      <Route path="/funcionarios" element={<PrivateRoute><Funcionarios /></PrivateRoute>} />
      <Route path="/folha" element={<PrivateRoute><Folha /></PrivateRoute>} />
      <Route path="/ocorrencias" element={<PrivateRoute><Ocorrencias /></PrivateRoute>} />
      <Route path="/headcount" element={<PrivateRoute><Headcount /></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
      <Route path="/assistente" element={<PrivateRoute><Assistente /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
