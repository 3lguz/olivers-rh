// MeuDia.jsx
import { useState, useEffect } from 'react'
import { getAll, create, update } from '../lib/firebase'
import { CheckCircle, Circle, Plus, Clock, Calendar } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DEFAULT_CHECKLIST = [
  'Verificar escala do dia e coberturas',
  'Conferir folha de ponto',
  'Registrar avaliações pendentes',
  'Checar notificações de advertências vencendo',
  'Revisar mensagens da equipe',
  'Verificar EPIs vencendo',
]

export function MeuDia() {
  const [checks, setChecks] = useState(DEFAULT_CHECKLIST.map(t=>({ text:t, done:false })))
  const [memo, setMemo] = useState('')
  const [eventos, setEventos] = useState([])
  const [novoCheck, setNovoCheck] = useState('')
  const today = new Date()

  useEffect(() => {
    getAll('eventos_calendario').then(setEventos).catch(()=>{})
    const saved = localStorage.getItem('checklist_' + today.toDateString())
    if (saved) setChecks(JSON.parse(saved))
    const savedMemo = localStorage.getItem('memo_' + today.toDateString())
    if (savedMemo) setMemo(savedMemo)
  }, [])

  const toggleCheck = (i) => {
    const next = checks.map((c,ci) => ci===i ? {...c, done:!c.done} : c)
    setChecks(next)
    localStorage.setItem('checklist_' + today.toDateString(), JSON.stringify(next))
  }

  const addCheck = () => {
    if (!novoCheck.trim()) return
    const next = [...checks, { text: novoCheck.trim(), done: false }]
    setChecks(next)
    localStorage.setItem('checklist_' + today.toDateString(), JSON.stringify(next))
    setNovoCheck('')
  }

  const saveMemo = (v) => {
    setMemo(v)
    localStorage.setItem('memo_' + today.toDateString(), v)
  }

  const done = checks.filter(c=>c.done).length
  const proxPagamento = (() => {
    const d = today.getDate()
    if (d < 5) return addDays(new Date(today.getFullYear(), today.getMonth(), 5), 0)
    if (d < 20) return addDays(new Date(today.getFullYear(), today.getMonth(), 20), 0)
    return addDays(new Date(today.getFullYear(), today.getMonth()+1, 5), 0)
  })()
  const diasPagamento = Math.ceil((proxPagamento - today) / (1000*60*60*24))

  return (
    <div style={{ padding:'32px 36px' }} className="animate-fade">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Syne', fontSize:26, fontWeight:800, color:'#e2e8f0' }}>📅 Meu Dia</h1>
        <p style={{ color:'#8892a4', marginTop:4 }}>{format(today, "EEEE, d 'de' MMMM", { locale:ptBR })}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Checklist */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#e2e8f0' }}>✅ Checklist do Dia</h2>
            <span style={{ fontSize:12, color:'#00e5a0', fontWeight:600 }}>{done}/{checks.length} concluídos</span>
          </div>
          <div style={{ background:'#0f1520', borderRadius:8, height:6, marginBottom:16 }}>
            <div style={{ background:'#00e5a0', height:6, borderRadius:8, width:`${checks.length?(done/checks.length*100):0}%`, transition:'width 0.3s' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {checks.map((c,i) => (
              <div key={i} onClick={()=>toggleCheck(i)} style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer', background: c.done?'rgba(0,229,160,0.05)':'transparent', transition:'background 0.2s' }}>
                {c.done ? <CheckCircle size={16} color='#00e5a0' style={{flexShrink:0,marginTop:1}} /> : <Circle size={16} color='#4a5568' style={{flexShrink:0,marginTop:1}} />}
                <span style={{ fontSize:13, color: c.done?'#4a5568':'#e2e8f0', textDecoration:c.done?'line-through':'none', transition:'all 0.2s' }}>{c.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <input className="input-field" placeholder="Nova tarefa..." value={novoCheck} onChange={e=>setNovoCheck(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCheck()} style={{ flex:1 }} />
            <button className="btn-primary" onClick={addCheck} style={{ padding:'10px 14px' }}><Plus size={14}/></button>
          </div>
        </div>

        {/* Próximo pagamento + memo */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card" style={{ padding:22, borderColor:'rgba(0,229,160,0.3)' }}>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ background:'rgba(0,229,160,0.1)', borderRadius:12, padding:14 }}>
                <Clock size={24} color='#00e5a0' />
              </div>
              <div>
                <p style={{ color:'#8892a4', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>Próximo Pagamento</p>
                <p style={{ fontFamily:'Syne', fontSize:26, fontWeight:800, color:'#00e5a0' }}>{diasPagamento} dias</p>
                <p style={{ color:'#8892a4', fontSize:12 }}>{format(proxPagamento, "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding:22, flex:1 }}>
            <h2 style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, color:'#e2e8f0', marginBottom:12 }}>📝 Anotações do Dia</h2>
            <textarea
              className="input-field"
              rows={6}
              placeholder="Registre aqui suas observações, lembretes e decisões do dia..."
              value={memo}
              onChange={e=>saveMemo(e.target.value)}
              style={{ resize:'none' }}
            />
            <p style={{ fontSize:11, color:'#4a5568', marginTop:6 }}>Salvo automaticamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Headcount ────────────────────────────────────────────────────────────────
export function Headcount() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const SETORES = [
    { key:'caixas', label:'Caixas', min:3 },
    { key:'acougue', label:'Açougue', min:2 },
    { key:'padaria', label:'Padaria', min:2 },
    { key:'deposito', label:'Depósito', min:2 },
    { key:'limpeza', label:'Limpeza', min:2 },
    { key:'seguranca', label:'Segurança', min:1 },
    { key:'administracao', label:'Administração', min:1 },
  ]

  useEffect(() => {
    getAll('employees').then(e=>{ setEmployees(e); setLoading(false) })
  }, [])

  const ativos = employees.filter(e=>e.status==='ativo'||!e.status)
  const afastados = employees.filter(e=>e.status==='ferias'||e.status==='afastado')

  return (
    <div style={{ padding:'32px 36px' }} className="animate-fade">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Syne', fontSize:26, fontWeight:800, color:'#e2e8f0' }}>📊 Headcount & Planejamento</h1>
        <p style={{ color:'#8892a4', marginTop:4 }}>Visão de cobertura por setor e análise de capacidade</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
        {[
          { label:'Total de Colaboradores', value:employees.length, color:'#4f8ef7' },
          { label:'Ativos Hoje', value:ativos.length, color:'#00e5a0' },
          { label:'Afastados/Férias', value:afastados.length, color:'#f59e0b' },
        ].map(k=>(
          <div key={k.label} className="card" style={{ padding:20 }}>
            <p style={{ color:'#8892a4', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{k.label}</p>
            <p style={{ fontFamily:'Syne', fontSize:32, fontWeight:800, color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #1e2d42' }}>
          <h2 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#e2e8f0' }}>🗂️ Cobertura por Setor</h2>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }} className="table-oliver">
          <thead><tr>
            <th>Setor</th><th>Ativos</th><th>Afastados</th><th>Mínimo Ideal</th><th>Cobertura</th><th>Status</th>
          </tr></thead>
          <tbody>
            {loading
              ? [1,2,3,4,5].map(i=><tr key={i}>{[1,2,3,4,5,6].map(j=><td key={j}><div className="skeleton" style={{height:16,width:'80%'}}/></td>)}</tr>)
              : SETORES.map(s=>{
                  const emp = ativos.filter(e=>e.setor===s.key||e.department===s.key)
                  const afas = afastados.filter(e=>e.setor===s.key||e.department===s.key)
                  const cobertura = emp.length >= s.min
                  const pct = s.min > 0 ? Math.min(100, Math.round(emp.length/s.min*100)) : 100
                  return (
                    <tr key={s.key}>
                      <td style={{ fontWeight:600 }}>{s.label}</td>
                      <td style={{ color:'#00e5a0', fontWeight:600 }}>{emp.length}</td>
                      <td style={{ color:'#f59e0b' }}>{afas.length}</td>
                      <td>{s.min}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ background:'#0f1520', borderRadius:20, height:8, width:80, flexShrink:0 }}>
                            <div style={{ background:cobertura?'#00e5a0':'#ef4444', height:8, borderRadius:20, width:`${pct}%` }} />
                          </div>
                          <span style={{ fontSize:12, color:'#8892a4' }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cobertura?'badge-green':'badge-red'}`}>
                          {cobertura ? '✓ OK' : '⚠ Insuficiente'}
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

// ─── Relatórios ───────────────────────────────────────────────────────────────
export function Relatorios() {
  const [employees, setEmployees] = useState([])
  const [advertencias, setAdvertencias] = useState([])
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState('')
  const [tipo, setTipo] = useState('clima')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    Promise.all([getAll('employees'), getAll('advertencias')]).then(([e,a])=>{ setEmployees(e); setAdvertencias(a) })
  }, [])

  const RELATORIOS = [
    { key:'clima', label:'🌡️ Clima Organizacional', desc:'Análise do ambiente de trabalho baseada em advertências, avaliações e ocorrências' },
    { key:'risco', label:'🚦 Diagnóstico de Riscos', desc:'Identifica colaboradores com maior chance de problema disciplinar ou saída' },
    { key:'custo', label:'💰 Análise de Custo RH', desc:'Visão completa dos custos de pessoal com recomendações de otimização' },
    { key:'desempenho', label:'📈 Desempenho por Setor', desc:'Comparativo de produtividade e qualidade entre setores' },
  ]

  const prompts = {
    clima: `Analise o clima organizacional do Oliver's Supermercado com base nestes dados:
- Total de funcionários: ${employees.filter(e=>e.status==='ativo'||!e.status).length} ativos
- Advertências ativas: ${advertencias.filter(a=>a.status==='ativa'||!a.status).length}
- Distribuição por setor: ${JSON.stringify(employees.slice(0,10).map(e=>({nome:e.name,setor:e.setor||e.department,nota:e.performance_rating})))}

Gere um relatório executivo de clima organizacional com: pontos de atenção, pontos positivos, recomendações práticas e sugestões de ação para o gestor Gustavo. Seja objetivo e prático.`,
    risco: `Com base nos dados do Oliver's Supermercado:
- Funcionários: ${JSON.stringify(employees.slice(0,8).map(e=>({nome:e.name,setor:e.setor||e.department,nota:e.performance_rating||3,advertencias:advertencias.filter(a=>a.employee_id===e.id).length})))}

Identifique quais colaboradores apresentam maior risco de: problema disciplinar, pedido de demissão, ou necessidade de intervenção. Explique os critérios e sugira ações preventivas para cada caso.`,
    custo: `Analise os custos de RH do Oliver's Supermercado:
- Folha bruta total: R$ ${employees.filter(e=>e.status==='ativo'||!e.status).reduce((s,e)=>s+(e.salario||0),0).toLocaleString('pt-BR')}
- ${employees.filter(e=>e.status==='ativo'||!e.status).length} funcionários ativos

Gere um relatório de custo RH com: análise da folha, estimativa de encargos CLT, benchmarks do setor de supermercados, oportunidades de otimização e recomendações para o gestor.`,
    desempenho: `Analise o desempenho por setor do Oliver's Supermercado:
- Dados: ${JSON.stringify(employees.slice(0,10).map(e=>({setor:e.setor||e.department,nota:e.performance_rating||3})))}

Gere um relatório de desempenho por setor com: ranking dos setores, análise de tendências, setores que precisam de atenção e recomendações de melhoria específicas para supermercado.`
  }

  const gerar = async () => {
    setGenerating(true)
    setReport('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers: {
          'Content-Type':'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version':'2023-06-01',
          'anthropic-dangerous-direct-browser-access':'true'
        },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1500,
          messages:[{ role:'user', content: prompts[tipo] }]
        })
      })
      const data = await res.json()
      setReport(data.content?.[0]?.text || 'Erro ao gerar relatório.')
    } catch {
      setReport('❌ Erro ao conectar com a IA. Verifique a chave da API nas configurações.')
    }
    setGenerating(false)
  }

  return (
    <div style={{ padding:'32px 36px' }} className="animate-fade">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Syne', fontSize:26, fontWeight:800, color:'#e2e8f0' }}>📊 Relatórios Inteligentes</h1>
        <p style={{ color:'#8892a4', marginTop:4 }}>Análises geradas por IA com base nos seus dados de RH</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:28 }}>
        {RELATORIOS.map(r=>(
          <button key={r.key} onClick={()=>setTipo(r.key)} style={{
            background: tipo===r.key ? 'rgba(0,229,160,0.1)':'#141b28',
            border:`1px solid ${tipo===r.key?'#00e5a0':'#1e2d42'}`,
            borderRadius:12, padding:'16px 20px', cursor:'pointer', textAlign:'left', transition:'all 0.2s'
          }}>
            <p style={{ fontFamily:'Syne', fontWeight:700, fontSize:15, color:'#e2e8f0', marginBottom:6 }}>{r.label}</p>
            <p style={{ fontSize:12, color:'#8892a4', lineHeight:1.5 }}>{r.desc}</p>
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={gerar} disabled={generating} style={{ marginBottom:24, padding:'12px 28px', fontSize:15 }}>
        {generating ? '⏳ Gerando relatório...' : '✨ Gerar Relatório com IA'}
      </button>

      {report && (
        <div className="card" style={{ padding:28 }}>
          <div style={{ fontFamily:'Syne', fontSize:14, fontWeight:700, color:'#00e5a0', marginBottom:16 }}>
            {RELATORIOS.find(r=>r.key===tipo)?.label}
          </div>
          <div style={{ color:'#e2e8f0', lineHeight:1.8, fontSize:14, whiteSpace:'pre-wrap' }}>
            {report}
          </div>
        </div>
      )}
    </div>
  )
}
