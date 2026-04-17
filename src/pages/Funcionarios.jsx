import { useState, useEffect } from 'react'
import { getAll, create, update, remove } from '../lib/firebase'
import { Plus, Search, Edit2, Trash2, Star, AlertTriangle, User } from 'lucide-react'

const SETORES = ['acougue','padaria','caixas','deposito','administracao','limpeza','seguranca']
const CARGOS = ['acougueiro','atendente_padaria','operadora_caixa','repositor','gerente','faxineira','seguranca','estoquista','auxiliar_limpeza','ceo']
const setorLabel = { caixas:'Caixas',acougue:'Açougue',padaria:'Padaria',deposito:'Depósito',limpeza:'Limpeza',seguranca:'Segurança',administracao:'Administração' }

function RiskBadge({ adv, rating }) {
  const risk = adv >= 3 || rating <= 2 ? 'high' : adv >= 1 || rating <= 3.5 ? 'med' : 'low'
  return <span className={`badge ${risk==='high'?'badge-red':risk==='med'?'badge-yellow':'badge-green'}`}>{risk==='high'?'🔴 Alto':risk==='med'?'🟡 Médio':'🟢 Baixo'}</span>
}

const emptyForm = { name:'', cpf:'', phone:'', email:'', position:'repositor', setor:'caixas', salario:'', hire_date:'', status:'ativo', performance_rating:3, notes:'' }

export default function Funcionarios() {
  const [employees, setEmployees] = useState([])
  const [advertencias, setAdvertencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSetor, setFilterSetor] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [emp, adv] = await Promise.all([getAll('employees'), getAll('advertencias')])
    setEmployees(emp)
    setAdvertencias(adv)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.cpf?.includes(search)
    const matchSetor = !filterSetor || e.setor === filterSetor || e.department === filterSetor
    const matchStatus = !filterStatus || e.status === filterStatus
    return matchSearch && matchSetor && matchStatus
  })

  const openNew = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (e) => { setEditing(e); setForm({ ...emptyForm, ...e, salario: e.salario||'' }); setModal(true) }

  const handleSave = async () => {
    setSaving(true)
    const data = { ...form, salario: parseFloat(form.salario) || 0 }
    if (editing) await update('employees', editing.id, data)
    else await create('employees', data)
    await load()
    setModal(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que quer remover este funcionário?')) return
    await remove('employees', id)
    await load()
  }

  const getAdv = (id) => advertencias.filter(a => (a.status==='ativa'||!a.status) && a.employee_id===id).length

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontSize: 26, fontWeight: 800, color:'#e2e8f0' }}>👥 Funcionários</h1>
          <p style={{ color:'#8892a4', marginTop: 4 }}>{employees.filter(e=>e.status==='ativo'||!e.status).length} ativos · {employees.length} total</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={16}/> Novo Funcionário</button>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap: 12, marginBottom: 24, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4a5568' }} />
          <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Buscar por nome ou CPF..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="input-field" style={{ width:160 }} value={filterSetor} onChange={e=>setFilterSetor(e.target.value)}>
          <option value="">Todos setores</option>
          {SETORES.map(s => <option key={s} value={s}>{setorLabel[s]}</option>)}
        </select>
        <select className="input-field" style={{ width:140 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">Todos status</option>
          <option value="ativo">Ativo</option>
          <option value="ferias">Férias</option>
          <option value="afastado">Afastado</option>
          <option value="demitido">Demitido</option>
        </select>
      </div>

      {/* Grid de cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {loading
          ? [1,2,3,4,5,6].map(i => <div key={i} className="card skeleton" style={{ height: 180 }} />)
          : filtered.map(e => {
              const adv = getAdv(e.id)
              const rating = e.performance_rating || 3
              return (
                <div key={e.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14 }}>
                    <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, #1e2d42, #4f8ef7)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:'Syne', fontWeight: 700, fontSize: 18, color:'#e2e8f0'
                      }}>
                        {e.name?.[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color:'#e2e8f0' }}>{e.name}</p>
                        <p style={{ fontSize: 12, color:'#8892a4' }}>{e.position || e.cargo}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap: 6 }}>
                      <button onClick={()=>openEdit(e)} style={{ background:'rgba(79,142,247,0.1)', border:'none', borderRadius:8, padding:7, cursor:'pointer', color:'#4f8ef7' }}><Edit2 size={13}/></button>
                      <button onClick={()=>handleDelete(e.id)} style={{ background:'rgba(239,68,68,0.1)', border:'none', borderRadius:8, padding:7, cursor:'pointer', color:'#ef4444' }}><Trash2 size={13}/></button>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ background:'#0f1520', borderRadius:8, padding:'8px 10px' }}>
                      <p style={{ fontSize:10, color:'#8892a4', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>Setor</p>
                      <p style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{setorLabel[e.setor||e.department] || e.department || '—'}</p>
                    </div>
                    <div style={{ background:'#0f1520', borderRadius:8, padding:'8px 10px' }}>
                      <p style={{ fontSize:10, color:'#8892a4', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>Salário</p>
                      <p style={{ fontSize:13, color:'#00e5a0', fontWeight:600 }}>
                        {e.salario ? `R$ ${Number(e.salario).toLocaleString('pt-BR', {minimumFractionDigits:2})}` : '—'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap: 3 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s<=rating?'#f59e0b':'transparent'} color='#f59e0b' />)}
                    </div>
                    <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                      {adv > 0 && <span style={{ fontSize:11, color:'#ef4444', fontWeight:600 }}>⚠ {adv} adv.</span>}
                      <RiskBadge adv={adv} rating={rating} />
                    </div>
                  </div>
                </div>
              )
            })
        }
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal-box" style={{ padding: 28 }}>
            <h2 style={{ fontFamily:'Syne', fontWeight: 700, fontSize: 20, color:'#e2e8f0', marginBottom: 24 }}>
              {editing ? '✏️ Editar Funcionário' : '➕ Novo Funcionário'}
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14 }}>
              {[
                { label:'Nome completo', key:'name', col:'1/-1' },
                { label:'CPF', key:'cpf' },
                { label:'Telefone', key:'phone' },
                { label:'E-mail', key:'email', col:'1/-1' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.col }}>
                  <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>{f.label}</label>
                  <input className="input-field" value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Cargo</label>
                <select className="input-field" value={form.position} onChange={e=>setForm(p=>({...p,position:e.target.value}))}>
                  {CARGOS.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Setor</label>
                <select className="input-field" value={form.setor} onChange={e=>setForm(p=>({...p,setor:e.target.value}))}>
                  {SETORES.map(s => <option key={s} value={s}>{setorLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Salário (R$)</label>
                <input className="input-field" type="number" value={form.salario} onChange={e=>setForm(p=>({...p,salario:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Data Admissão</label>
                <input className="input-field" type="date" value={form.hire_date} onChange={e=>setForm(p=>({...p,hire_date:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Status</label>
                <select className="input-field" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                  {['ativo','ferias','afastado','demitido'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Avaliação (1-5)</label>
                <input className="input-field" type="number" min={1} max={5} value={form.performance_rating} onChange={e=>setForm(p=>({...p,performance_rating:Number(e.target.value)}))} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:12, color:'#8892a4', display:'block', marginBottom:6 }}>Observações</label>
                <textarea className="input-field" rows={3} value={form.notes||''} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
              </div>
            </div>
            <div style={{ display:'flex', gap: 10, marginTop: 24, justifyContent:'flex-end' }}>
              <button className="btn-secondary" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Criar Funcionário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
