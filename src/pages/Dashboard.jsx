import { useState, useEffect } from 'react'
import { getAll } from '../lib/firebase'
import { Users, DollarSign, AlertTriangle, TrendingUp, Star, Clock, CheckCircle, XCircle, Award } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function KpiCard({ icon: Icon, label, value, sub, color = '#00e5a0', loading }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <p style={{ color: '#8892a4', fontSize: 12, fontWeight: 600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom: 8 }}>{label}</p>
          {loading
            ? <div className="skeleton" style={{ width: 80, height: 32 }} />
            : <p style={{ fontFamily:'Syne', fontSize: 30, fontWeight: 700, color: '#e2e8f0' }}>{value}</p>
          }
          {sub && <p style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ background: `${color}18`, borderRadius: 12, padding: 12 }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  )
}

const setores = ['caixas','acougue','padaria','deposito','limpeza','seguranca','administracao']
const setorLabel = {
  caixas: 'Caixas', acougue: 'Açougue', padaria: 'Padaria',
  deposito: 'Depósito', limpeza: 'Limpeza', seguranca: 'Segurança', administracao: 'Admin'
}

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [advertencias, setAdvertencias] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    Promise.all([
      getAll('employees'),
      getAll('avaliacoes'),
      getAll('advertencias'),
    ]).then(([emp, aval, adv]) => {
      setEmployees(emp)
      setAvaliacoes(aval)
      setAdvertencias(adv)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const ativos = employees.filter(e => e.status === 'ativo' || !e.status)
  const folhaTotal = ativos.reduce((s, e) => s + (e.salario || 0), 0)
  const advAtivas = advertencias.filter(a => a.status === 'ativa' || !a.status)

  // Radar data por setor
  const radarData = setores.map(s => {
    const emp = ativos.filter(e => e.setor === s || e.department === s)
    const avals = avaliacoes.filter(a => emp.find(e => e.id === a.employee_id))
    const media = avals.length ? avals.reduce((sum, a) => sum + (a.nota_geral || (((a.nota_atendimento||0)+(a.nota_produtividade||0)+(a.nota_postura||0)+(a.nota_pontualidade||0))/4)), 0) / avals.length : 0
    return { setor: setorLabel[s], media: Math.round(media * 10) / 10 }
  })

  // Destaques: maior nota
  const destaque = (() => {
    if (!avaliacoes.length || !ativos.length) return null
    const scores = ativos.map(e => {
      const avals = avaliacoes.filter(a => a.employee_id === e.id)
      const media = avals.length ? avals.reduce((s,a) => s + (a.nota_geral || 0), 0) / avals.length : 0
      return { ...e, media }
    }).sort((a,b) => b.media - a.media)
    return scores[0]
  })()

  // Aniversários de contratação próximos (30 dias)
  const anivContrat = ativos.filter(e => {
    if (!e.hire_date) return false
    const d = new Date(e.hire_date)
    const thisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    const diff = differenceInDays(thisYear, today)
    return diff >= 0 && diff <= 30
  })

  const fmt = (n) => n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1400 }} className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color:'#8892a4', fontSize: 13, marginBottom: 4 }}>
          {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
        <h1 style={{ fontFamily:'Syne', fontSize: 28, fontWeight: 800, color:'#e2e8f0' }}>
          Olá, Gustavo 👋
        </h1>
        <p style={{ color:'#8892a4', marginTop: 4 }}>Aqui está o panorama do seu RH hoje.</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard icon={Users} label="Funcionários Ativos" value={ativos.length} sub={`${employees.filter(e=>e.status==='ferias').length} em férias`} loading={loading} />
        <KpiCard icon={DollarSign} label="Folha Bruta" value={loading ? '—' : fmt(folhaTotal)} sub={`Custo c/ encargos: ${fmt(folhaTotal * 1.68)}`} color='#4f8ef7' loading={false} />
        <KpiCard icon={AlertTriangle} label="Advertências Ativas" value={advAtivas.length} sub="últimos 180 dias" color='#f59e0b' loading={loading} />
        <KpiCard icon={TrendingUp} label="Custo Médio/Colaborador" value={loading||!ativos.length ? '—' : fmt((folhaTotal*1.68)/ativos.length)} sub="salário + encargos est." color='#a78bfa' loading={false} />
      </div>

      {/* Middle row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Radar por setor */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily:'Syne', fontSize: 16, fontWeight: 700, marginBottom: 20, color:'#e2e8f0' }}>
            📊 Desempenho Médio por Setor
          </h2>
          {loading
            ? <div className="skeleton" style={{ height: 220 }} />
            : <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e2d42" />
                  <PolarAngleAxis dataKey="setor" tick={{ fill: '#8892a4', fontSize: 11 }} />
                  <Radar name="Média" dataKey="media" stroke="#00e5a0" fill="#00e5a0" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ background:'#141b28', border:'1px solid #1e2d42', borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Funcionário destaque + alertas */}
        <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
          {/* Destaque */}
          <div className="card animate-glow" style={{ padding: 20, borderColor: 'rgba(0,229,160,0.3)' }}>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 12 }}>
              <Award size={18} color='#f59e0b' />
              <h3 style={{ fontFamily:'Syne', fontWeight: 700, fontSize: 14, color:'#e2e8f0' }}>⭐ Destaque do Mês</h3>
            </div>
            {destaque
              ? <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: 'linear-gradient(135deg, #00e5a0, #4f8ef7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'Syne', fontWeight: 800, fontSize: 20, color:'#080c10'
                  }}>
                    {destaque.name?.[0] || '?'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color:'#e2e8f0' }}>{destaque.name}</p>
                    <p style={{ fontSize: 12, color:'#8892a4' }}>{setorLabel[destaque.setor || destaque.department] || destaque.department}</p>
                    <div style={{ display:'flex', gap: 4, marginTop: 4 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= Math.round(destaque.media) ? '#f59e0b':'transparent'} color='#f59e0b' />)}
                      <span style={{ fontSize: 12, color:'#f59e0b', marginLeft: 4 }}>{destaque.media.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              : <p style={{ color:'#4a5568', fontSize: 13 }}>Nenhuma avaliação registrada ainda.</p>
            }
          </div>

          {/* Alertas */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <h3 style={{ fontFamily:'Syne', fontWeight: 700, fontSize: 14, color:'#e2e8f0', marginBottom: 12 }}>🔔 Alertas do Dia</h3>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {anivContrat.length > 0
                ? anivContrat.map(e => (
                    <div key={e.id} style={{ display:'flex', gap: 10, padding: '8px 12px', background:'rgba(79,142,247,0.08)', borderRadius: 8, alignItems:'center' }}>
                      <span>🎉</span>
                      <span style={{ fontSize: 13, color:'#e2e8f0' }}><b>{e.name}</b> completa aniversário de contratação em breve</span>
                    </div>
                  ))
                : null
              }
              {advAtivas.filter(a => {
                const exp = a.expiration_date ? new Date(a.expiration_date) : null
                return exp && differenceInDays(exp, today) <= 15 && differenceInDays(exp, today) >= 0
              }).map(a => (
                <div key={a.id} style={{ display:'flex', gap: 10, padding:'8px 12px', background:'rgba(245,158,11,0.08)', borderRadius: 8, alignItems:'center' }}>
                  <AlertTriangle size={14} color='#f59e0b' />
                  <span style={{ fontSize: 13, color:'#e2e8f0' }}>Advertência de <b>{a.employee_name}</b> vence em breve</span>
                </div>
              ))}
              {anivContrat.length === 0 && advAtivas.length === 0 && (
                <div style={{ display:'flex', gap: 10, padding:'10px 12px', background:'rgba(0,229,160,0.06)', borderRadius: 8, alignItems:'center' }}>
                  <CheckCircle size={14} color='#00e5a0' />
                  <span style={{ fontSize: 13, color:'#8892a4' }}>Sem alertas críticos hoje ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela funcionários - top 5 risco */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom:'1px solid #1e2d42' }}>
          <h2 style={{ fontFamily:'Syne', fontSize: 16, fontWeight: 700, color:'#e2e8f0' }}>🚦 Radar de Risco — Funcionários</h2>
          <p style={{ color:'#8892a4', fontSize: 13, marginTop: 4 }}>Baseado em advertências e avaliação de desempenho</p>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }} className="table-oliver">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Setor</th>
              <th>Advertências</th>
              <th>Avaliação</th>
              <th>Risco</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5].map(j => <td key={j}><div className="skeleton" style={{height:18, width:'80%'}} /></td>)}
                  </tr>
                ))
              : ativos.slice(0,8).map(e => {
                  const adv = advAtivas.filter(a => a.employee_id === e.id).length
                  const rating = e.performance_rating || 3
                  const risk = adv >= 3 || rating <= 2 ? 'high' : adv >= 1 || rating <= 3 ? 'med' : 'low'
                  return (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.name}</td>
                      <td><span className="badge badge-blue">{setorLabel[e.setor||e.department] || e.department || '—'}</span></td>
                      <td style={{ color: adv > 0 ? '#ef4444' : '#00e5a0' }}>{adv}</td>
                      <td>
                        <div style={{ display:'flex', gap: 3 }}>
                          {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s<=rating?'#f59e0b':'transparent'} color='#f59e0b' />)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${risk==='high'?'badge-red':risk==='med'?'badge-yellow':'badge-green'}`}>
                          {risk==='high'?'Alto':risk==='med'?'Médio':'Baixo'}
                        </span>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
