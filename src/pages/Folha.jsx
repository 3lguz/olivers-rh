import { useState, useEffect } from 'react'
import { getAll } from '../lib/firebase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const SETORES = ['caixas','acougue','padaria','deposito','administracao','limpeza','seguranca']
const setorLabel = { caixas:'Caixas',acougue:'Açougue',padaria:'Padaria',deposito:'Depósito',limpeza:'Limpeza',seguranca:'Segurança',administracao:'Administração' }
const COLORS = ['#00e5a0','#4f8ef7','#f59e0b','#a78bfa','#ef4444','#34d399','#fb923c']
const ENCARGOS = 0.68 // estimativa CLT

const fmt = (n) => n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })

export default function Folha() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [simAumento, setSimAumento] = useState({ setor:'', percentual:0 })

  useEffect(() => {
    getAll('employees').then(e => { setEmployees(e); setLoading(false) })
  }, [])

  const ativos = employees.filter(e => e.status === 'ativo' || !e.status)
  const folhaBruta = ativos.reduce((s, e) => s + (e.salario||0), 0)
  const custoTotal = folhaBruta * (1 + ENCARGOS)

  // Distribuição por setor
  const pieData = SETORES.map((s, i) => {
    const emp = ativos.filter(e => e.setor===s || e.department===s)
    const val = emp.reduce((sum, e) => sum + (e.salario||0), 0) * (1+ENCARGOS)
    return { name: setorLabel[s], value: Math.round(val), color: COLORS[i] }
  }).filter(d => d.value > 0)

  // Simulação de aumento
  const simImpacto = (() => {
    if (!simAumento.setor || !simAumento.percentual) return null
    const empSetor = ativos.filter(e => e.setor===simAumento.setor || e.department===simAumento.setor)
    const folhaSetor = empSetor.reduce((s,e) => s+(e.salario||0),0)
    const aumento = folhaSetor * (simAumento.percentual/100)
    return { folhaSetor, aumento, novoCusto: (folhaSetor + aumento) * (1+ENCARGOS), qtd: empSetor.length }
  })()

  return (
    <div style={{ padding:'32px 36px' }} className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:'Syne', fontSize: 26, fontWeight: 800, color:'#e2e8f0' }}>💰 Folha & Custos RH</h1>
        <p style={{ color:'#8892a4', marginTop: 4 }}>Análise completa de custo de pessoal com encargos estimados</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label:'Folha Bruta Mensal', value: fmt(folhaBruta), icon: DollarSign, color:'#00e5a0', sub:`${ativos.length} funcionários ativos` },
          { label:'Custo Total c/ Encargos', value: fmt(custoTotal), icon: TrendingUp, color:'#4f8ef7', sub:`+${(ENCARGOS*100).toFixed(0)}% sobre a folha` },
          { label:'Custo Médio/Colaborador', value: ativos.length ? fmt(custoTotal/ativos.length) : '—', icon: AlertCircle, color:'#a78bfa', sub:'salário + encargos' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: 22 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div>
                <p style={{ color:'#8892a4', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{k.label}</p>
                <p style={{ fontFamily:'Syne', fontSize:26, fontWeight:700, color:'#e2e8f0' }}>{k.value}</p>
                <p style={{ color:'#8892a4', fontSize:12, marginTop:4 }}>{k.sub}</p>
              </div>
              <div style={{ background:`${k.color}18`, borderRadius:12, padding:12, alignSelf:'flex-start' }}>
                <k.icon size={22} color={k.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Gráfico pizza */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom: 20 }}>📊 Custo por Setor</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={{ stroke:'#4a5568' }}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background:'#141b28', border:'1px solid #1e2d42', borderRadius:8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Simulador */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom: 6 }}>🧮 Simulador de Aumento</h2>
          <p style={{ color:'#8892a4', fontSize:13, marginBottom: 20 }}>Veja o impacto de um reajuste salarial antes de aplicar</p>
          <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            <div>
              <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Setor</label>
              <select className="input-field" value={simAumento.setor} onChange={e=>setSimAumento(p=>({...p,setor:e.target.value}))}>
                <option value="">Selecionar setor...</option>
                {SETORES.map(s => <option key={s} value={s}>{setorLabel[s]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Percentual de aumento (%)</label>
              <input className="input-field" type="number" min={0} max={100} value={simAumento.percentual} onChange={e=>setSimAumento(p=>({...p,percentual:Number(e.target.value)}))} />
            </div>
            {simImpacto && (
              <div style={{ background:'rgba(0,229,160,0.06)', border:'1px solid rgba(0,229,160,0.2)', borderRadius:10, padding:16 }}>
                <p style={{ fontSize:12, color:'#8892a4', marginBottom:8 }}>📋 {simImpacto.qtd} funcionário(s) afetado(s)</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <p style={{ fontSize:11, color:'#8892a4' }}>Folha atual do setor</p>
                    <p style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>{fmt(simImpacto.folhaSetor)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:11, color:'#8892a4' }}>Custo adicional mensal</p>
                    <p style={{ fontSize:16, fontWeight:700, color:'#f59e0b' }}>+{fmt(simImpacto.aumento)}</p>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <p style={{ fontSize:11, color:'#8892a4' }}>Novo custo total do setor c/ encargos</p>
                    <p style={{ fontSize:20, fontWeight:700, color:'#00e5a0' }}>{fmt(simImpacto.novoCusto)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela custo por funcionário */}
      <div className="card" style={{ padding: 0, overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #1e2d42' }}>
          <h2 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#e2e8f0' }}>📋 Custo Detalhado por Colaborador</h2>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }} className="table-oliver">
          <thead><tr>
            <th>Funcionário</th><th>Setor</th><th>Salário Base</th><th>Encargos Est.</th><th>Custo Total</th>
          </tr></thead>
          <tbody>
            {loading
              ? [1,2,3,4].map(i=><tr key={i}>{[1,2,3,4,5].map(j=><td key={j}><div className="skeleton" style={{height:16,width:'80%'}}/></td>)}</tr>)
              : ativos.sort((a,b)=>(b.salario||0)-(a.salario||0)).map(e=>(
                  <tr key={e.id}>
                    <td style={{ fontWeight:600 }}>{e.name}</td>
                    <td><span className="badge badge-blue">{setorLabel[e.setor||e.department]||e.department||'—'}</span></td>
                    <td>{e.salario ? fmt(e.salario) : '—'}</td>
                    <td style={{ color:'#f59e0b' }}>{e.salario ? fmt(e.salario * ENCARGOS) : '—'}</td>
                    <td style={{ fontWeight:700, color:'#00e5a0' }}>{e.salario ? fmt(e.salario*(1+ENCARGOS)) : '—'}</td>
                  </tr>
                ))
            }
            {!loading && <tr>
              <td colSpan={2} style={{ fontFamily:'Syne', fontWeight:700, color:'#e2e8f0' }}>TOTAL</td>
              <td style={{ fontWeight:700 }}>{fmt(folhaBruta)}</td>
              <td style={{ fontWeight:700, color:'#f59e0b' }}>{fmt(folhaBruta*ENCARGOS)}</td>
              <td style={{ fontWeight:700, color:'#00e5a0', fontSize:16 }}>{fmt(custoTotal)}</td>
            </tr>}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, color:'#4a5568', fontSize:12 }}>
        * Encargos estimados em 68% (INSS patronal ~20%, FGTS 8%, férias 1/3, 13º salário, outros). Consulte seu contador para valores precisos.
      </p>
    </div>
  )
}
