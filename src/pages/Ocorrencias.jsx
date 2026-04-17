import { useState, useEffect } from 'react'
import { getAll, create, update } from '../lib/firebase'
import { Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TIPOS = ['conflito_interno','reclamacao_cliente','desvio_conduta','problema_comunicacao','postura','outro']
const tipoLabel = { conflito_interno:'Conflito Interno',reclamacao_cliente:'Reclamação de Cliente',desvio_conduta:'Desvio de Conduta',problema_comunicacao:'Problema de Comunicação',postura:'Postura',outro:'Outro' }
const GRAVIDADES = ['leve','media','grave','gravissima']
const STATUS_LIST = ['aberto','em_mediacao','resolvido']

const emptyForm = { funcionarios:'', tipo:'conflito_interno', descricao:'', gravidade:'leve', encaminhamento:'', status:'aberto', data: new Date().toISOString().slice(0,10) }

export default function Ocorrencias() {
  const [items, setItems] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('todos')

  const load = async () => {
    setLoading(true)
    const [oc, emp] = await Promise.all([getAll('ocorrencias'), getAll('employees')])
    setItems(oc)
    setEmployees(emp)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'todos' ? items : items.filter(i => i.status === filter)

  const handleSave = async () => {
    setSaving(true)
    await create('ocorrencias', form)
    await load()
    setModal(false)
    setForm(emptyForm)
    setSaving(false)
  }

  const handleStatus = async (id, status) => {
    await update('ocorrencias', id, { status })
    await load()
  }

  const gravColor = { leve:'#00e5a0', media:'#f59e0b', grave:'#ef4444', gravissima:'#dc2626' }
  const statusColor = { aberto:'badge-red', em_mediacao:'badge-yellow', resolvido:'badge-green' }
  const statusIcon = { aberto: <AlertTriangle size={13}/>, em_mediacao: <Clock size={13}/>, resolvido: <CheckCircle size={13}/> }

  return (
    <div style={{ padding:'32px 36px' }} className="animate-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontSize: 26, fontWeight: 800, color:'#e2e8f0' }}>⚠️ Ocorrências & Conflitos</h1>
          <p style={{ color:'#8892a4', marginTop: 4 }}>Gestão de situações disciplinares e interpessoais</p>
        </div>
        <button className="btn-primary" onClick={()=>setModal(true)}><Plus size={16}/> Nova Ocorrência</button>
      </div>

      {/* Resumo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom: 24 }}>
        {[
          { label:'Abertas', count: items.filter(i=>i.status==='aberto').length, color:'#ef4444', filter:'aberto' },
          { label:'Em Mediação', count: items.filter(i=>i.status==='em_mediacao').length, color:'#f59e0b', filter:'em_mediacao' },
          { label:'Resolvidas', count: items.filter(i=>i.status==='resolvido').length, color:'#00e5a0', filter:'resolvido' },
        ].map(k => (
          <button key={k.label} onClick={()=>setFilter(filter===k.filter?'todos':k.filter)} style={{
            background: filter===k.filter ? `${k.color}18` : '#141b28',
            border: `1px solid ${filter===k.filter ? k.color : '#1e2d42'}`,
            borderRadius:12, padding:'20px 24px', cursor:'pointer', textAlign:'left',
            transition:'all 0.2s'
          }}>
            <p style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color: k.color }}>{k.count}</p>
            <p style={{ color:'#8892a4', fontSize:13, marginTop:4 }}>{k.label}</p>
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
        {loading
          ? [1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: 100 }} />)
          : filtered.length === 0
            ? <div style={{ textAlign:'center', color:'#4a5568', padding:'48px 0' }}>Nenhuma ocorrência registrada.</div>
            : filtered.sort((a,b)=>new Date(b.data||b.createdAt?.toDate())-new Date(a.data||a.createdAt?.toDate())).map(item => (
                <div key={item.id} className="card" style={{ padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                        <span className={`badge ${statusColor[item.status]||'badge-gray'}`}>
                          {statusIcon[item.status]} {item.status?.replace('_',' ')}
                        </span>
                        <span style={{ fontSize:11, color: gravColor[item.gravidade]||'#8892a4', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                          {item.gravidade}
                        </span>
                        <span className="badge badge-blue">{tipoLabel[item.tipo]||item.tipo}</span>
                        {item.data && <span style={{ fontSize:12, color:'#8892a4' }}>{format(new Date(item.data), "dd 'de' MMM, yyyy", { locale:ptBR })}</span>}
                      </div>
                      <p style={{ fontWeight:600, color:'#e2e8f0', fontSize:14, marginBottom:6 }}>
                        👤 {item.funcionarios || 'Funcionários não especificados'}
                      </p>
                      <p style={{ color:'#8892a4', fontSize:13, lineHeight:1.6 }}>{item.descricao}</p>
                      {item.encaminhamento && (
                        <div style={{ marginTop:10, background:'rgba(79,142,247,0.08)', borderRadius:8, padding:'8px 12px' }}>
                          <p style={{ fontSize:12, color:'#4f8ef7' }}>📋 Encaminhamento: {item.encaminhamento}</p>
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:8, marginLeft:16, flexShrink:0 }}>
                      {item.status !== 'em_mediacao' && item.status !== 'resolvido' && (
                        <button className="btn-secondary" style={{ padding:'6px 12px', fontSize:12 }} onClick={()=>handleStatus(item.id,'em_mediacao')}>
                          Em mediação
                        </button>
                      )}
                      {item.status !== 'resolvido' && (
                        <button className="btn-primary" style={{ padding:'6px 12px', fontSize:12 }} onClick={()=>handleStatus(item.id,'resolvido')}>
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
        }
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal-box" style={{ padding:28 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, color:'#e2e8f0', marginBottom:24 }}>⚠️ Registrar Ocorrência</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Funcionário(s) envolvido(s)</label>
                <input className="input-field" placeholder="Ex: João Silva e Maria Santos" value={form.funcionarios} onChange={e=>setForm(p=>({...p,funcionarios:e.target.value}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Tipo</label>
                  <select className="input-field" value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
                    {TIPOS.map(t=><option key={t} value={t}>{tipoLabel[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Gravidade</label>
                  <select className="input-field" value={form.gravidade} onChange={e=>setForm(p=>({...p,gravidade:e.target.value}))}>
                    {GRAVIDADES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Data</label>
                <input className="input-field" type="date" value={form.data} onChange={e=>setForm(p=>({...p,data:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Descrição da ocorrência</label>
                <textarea className="input-field" rows={4} placeholder="Descreva o que aconteceu com detalhes..." value={form.descricao} onChange={e=>setForm(p=>({...p,descricao:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Encaminhamento tomado</label>
                <input className="input-field" placeholder="Ex: Conversa de alinhamento, advertência verbal..." value={form.encaminhamento} onChange={e=>setForm(p=>({...p,encaminhamento:e.target.value}))} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button className="btn-secondary" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.descricao}>
                {saving ? 'Salvando...' : 'Registrar Ocorrência'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
