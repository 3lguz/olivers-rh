import { useState } from 'react'
import { create, getAll } from '../lib/firebase'
import { Upload, CheckCircle, Loader, AlertTriangle, Database } from 'lucide-react'

const EMPLOYEES_DATA = [
  { name:"MARIA EDUARDA JUSTINO", phone:"16993037754", position:"operadora_caixa", department:"caixas", salary:1897.40, hire_date:"2026-04-14", status:"ativo", warning_count:0, registrado:true, notes:"Contratado via recrutamento em 14/04/2026" },
  { name:"KAUAN GABRIEL COSTA OLIVEIRA", phone:"16992897315", position:"repositor", department:"deposito", salary:1897.40, hire_date:"2026-03-25", status:"ativo", warning_count:0, cpf:"58468603899", birth_date:"2008-05-13", registrado:true },
  { name:"RAYSSA SILVA ROJAS", phone:"1694447790", position:"operadora_caixa", department:"caixas", salary:1897.40, hire_date:"2026-03-10", status:"ativo", warning_count:4, cpf:"459.255.828-61", registrado:true },
  { name:"TEREZINHA", phone:"16992033064", position:"atendente_padaria", department:"padaria", salary:1897.40, hire_date:"2026-03-06", status:"ativo", warning_count:0, registrado:false },
  { name:"ANA PAULA FERREIRA DA SILVA", phone:"16981359420", position:"atendente_padaria", department:"padaria", salary:1897.40, hire_date:"2026-02-18", status:"demitido", warning_count:0, cpf:"37450813823", birth_date:"1993-07-04", email:"emillytarciliainacio@gmail.com", registrado:true },
  { name:"MARIA DOS REIS DOS SANTOS", phone:"16991160701", position:"operadora_caixa", department:"caixas", salary:1897.40, hire_date:"2026-02-08", status:"ativo", warning_count:0, registrado:true },
  { name:"JULIANA CRISTINA DE OLIVEIRA", phone:"16993283479", position:"supervisora", department:"administracao", salary:2200.00, hire_date:"2022-07-07", status:"ativo", warning_count:0, cpf:"22306300836", email:"julianacristina45679@gmail.com", registrado:false },
  { name:"YASMIN OLIVEIRA C.", phone:"16999000015", position:"atendente_padaria", department:"padaria", salary:1897.40, hire_date:"2025-12-08", status:"demitido", warning_count:0, cpf:"525.330.388-06", email:"yasminoliveiradacosta30@gmail.com", registrado:true },
  { name:"VITOR BRENO DE S.", phone:"16991790856", position:"repositor", department:"deposito", salary:1897.40, hire_date:"2025-11-11", status:"demitido", warning_count:1, cpf:"048.234.302-80", email:"vb0838049@gmail.com", registrado:false },
  { name:"SABRINA CRISTINA S.", phone:"16993750527", position:"operadora_caixa", department:"caixas", salary:1886.40, hire_date:"2026-01-30", status:"demitido", warning_count:0, cpf:"371.876.848-86", email:"sabrinacs1890@gmail.com", registrado:true },
  { name:"LEONAN JOSE V.S", phone:"3599919154", position:"repositor", department:"deposito", salary:2120.00, hire_date:"2025-01-21", status:"demitido", warning_count:1, cpf:"184.930.046-18", email:"leonanjosevicente@gmail.com", registrado:true },
  { name:"JULIO CESAR A.B", phone:"16992577824", position:"acougueiro", department:"acougue", salary:4000.00, hire_date:"2025-08-12", status:"ativo", warning_count:0, cpf:"219.334.518-07", email:"jc1930783@gmail.com", registrado:true },
  { name:"JESSICA ANTONIA DA S.", phone:"13996063838", position:"atendente_padaria", department:"padaria", salary:1897.37, hire_date:"2025-01-01", status:"ativo", warning_count:0, cpf:"429.745.018-69", email:"wendfox31@gmail.com", registrado:true },
  { name:"ISAC DA SILVA PEREIRA", phone:"16994174179", position:"repositor", department:"deposito", salary:1897.40, hire_date:"2025-03-02", status:"ativo", warning_count:1, cpf:"445.948.508-71", email:"isaksilva020@gmail.com", registrado:true },
  { name:"GUSTAVO HENRIQUE", phone:"16991891018", position:"gerente", department:"administracao", salary:2600.00, hire_date:"2026-01-27", status:"ativo", warning_count:0, cpf:"477.635.438-17", registrado:false },
  { name:"GUILHERME SANTANA P.", phone:"16993178915", position:"acougueiro", department:"acougue", salary:4000.00, hire_date:"2022-07-07", status:"ativo", warning_count:0, cpf:"460.823.098-04", email:"guipereirasantana23@gmail.com", registrado:true },
  { name:"EUCLIDES AFONSO REIS", phone:"16981114116", position:"acougueiro", department:"acougue", salary:4000.00, hire_date:"2022-07-07", status:"ativo", warning_count:2, cpf:"615.325.963-40", email:"junhoeuclides@gmail.com", registrado:false },
  { name:"EDUARDA GOMES", phone:"16981318755", position:"atendente_padaria", department:"padaria", salary:1897.40, hire_date:"2025-08-18", status:"ativo", warning_count:2, cpf:"422.894.808-19", email:"dudaferrari1285@gmail.com", performance_rating:4, registrado:true },
  { name:"DAVI REZENDE CINTRA", phone:"16991363353", position:"acougueiro", department:"acougue", salary:4000.00, hire_date:"2022-07-01", status:"ativo", warning_count:0, cpf:"296.583.798-18", email:"daviandedondavi@gmail.com", performance_rating:2.5, registrado:true },
  { name:"ANA KARLINE S.S", phone:"9999036557", position:"operadora_caixa", department:"caixas", salary:2003.40, hire_date:"2024-01-09", status:"ativo", warning_count:0, cpf:"087.097.203-08", email:"anakarolinesantosdesousa@gmail.com", registrado:true },
  { name:"ADRIANA MATIAS S.V", phone:"16982237587", position:"atendente_padaria", department:"padaria", salary:2120.00, hire_date:"2025-02-02", status:"ativo", warning_count:0, cpf:"147.158.768-17", email:"adrianamatias2410@gmail.com", registrado:false },
  { name:"DENISE DE SOUZA BRITO", phone:"16996240830", position:"operadora_caixa", department:"caixas", salary:1897.40, hire_date:"2024-09-24", status:"ativo", warning_count:0, cpf:"619.302.743-27", email:"denisesousah447@gmail.com", development_goals:"Melhorar a performance no atendimento ao público", registrado:false },
]

const ADVERTENCIAS_DATA = [
  { employee_name:"RAYSSA SILVA ROJAS", type:"escrita", severity:"media", reason:"Uso de celular em horário de trabalho", date:"2026-03-15", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"RAYSSA SILVA ROJAS", type:"escrita", severity:"media", reason:"Atraso reincidente", date:"2026-03-25", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"RAYSSA SILVA ROJAS", type:"verbal", severity:"leve", reason:"Postura inadequada com cliente", date:"2026-04-01", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"RAYSSA SILVA ROJAS", type:"escrita", severity:"grave", reason:"Falta injustificada", date:"2026-04-10", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"EUCLIDES AFONSO REIS", type:"verbal", severity:"leve", reason:"Atraso na abertura do setor", date:"2026-02-20", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"EUCLIDES AFONSO REIS", type:"escrita", severity:"media", reason:"Desperdício de mercadoria", date:"2026-03-18", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"EDUARDA GOMES", type:"verbal", severity:"leve", reason:"Falta de organização no setor", date:"2026-03-05", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"EDUARDA GOMES", type:"escrita", severity:"media", reason:"Falta injustificada", date:"2026-04-02", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"ISAC DA SILVA PEREIRA", type:"verbal", severity:"leve", reason:"Postura no ambiente de trabalho", date:"2026-03-28", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"VITOR BRENO DE S.", type:"escrita", severity:"media", reason:"Falta injustificada", date:"2025-12-15", status:"ativa", issued_by:"Gustavo Henrique" },
  { employee_name:"LEONAN JOSE V.S", type:"verbal", severity:"leve", reason:"Atraso reincidente", date:"2025-02-10", status:"ativa", issued_by:"Gustavo Henrique" },
]

export default function SeedData() {
  const [status, setStatus] = useState('idle')
  const [log, setLog] = useState([])
  const [counts, setCounts] = useState({ employees: 0, advertencias: 0 })

  const addLog = (msg, type = 'info') => setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const seed = async () => {
    setStatus('loading')
    setLog([])
    
    try {
      // Check existing
      addLog('🔍 Verificando dados existentes no Firebase...')
      const existing = await getAll('employees')
      
      if (existing.length > 0) {
        addLog(`⚠️ Já existem ${existing.length} funcionários no Firebase. Migração cancelada para não duplicar.`, 'warn')
        addLog('💡 Se quiser migrar novamente, limpe a collection "employees" no Firebase Console primeiro.', 'warn')
        setStatus('done')
        return
      }

      // Seed employees
      addLog('👥 Migrando funcionários do Base44...')
      let empCount = 0
      for (const emp of EMPLOYEES_DATA) {
        await create('employees', { ...emp, setor: emp.department })
        empCount++
        addLog(`  ✅ ${emp.name} — ${emp.department}`)
      }
      setCounts(prev => ({ ...prev, employees: empCount }))

      // Seed advertencias
      addLog('⚠️ Migrando advertências...')
      let advCount = 0
      for (const adv of ADVERTENCIAS_DATA) {
        await create('advertencias', adv)
        advCount++
        addLog(`  ✅ ${adv.employee_name} — ${adv.reason}`)
      }
      setCounts(prev => ({ ...prev, advertencias: advCount }))

      addLog('🎉 Migração concluída com sucesso!', 'success')
      setStatus('done')
    } catch (err) {
      addLog(`❌ Erro: ${err.message}`, 'error')
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }} className="animate-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: '#e2e8f0' }}>
          🔄 Migração de Dados — Base44 → Firebase
        </h1>
        <p style={{ color: '#8892a4', marginTop: 8 }}>
          Esta página transfere os dados reais do Oliver's Supermercado (22 funcionários + advertências) do Base44 para o Firebase.
        </p>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Database size={20} color='#4f8ef7' />
            <div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: '#4f8ef7' }}>{EMPLOYEES_DATA.length}</p>
              <p style={{ color: '#8892a4', fontSize: 13 }}>Funcionários para migrar</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <AlertTriangle size={20} color='#f59e0b' />
            <div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: '#f59e0b' }}>{ADVERTENCIAS_DATA.length}</p>
              <p style={{ color: '#8892a4', fontSize: 13 }}>Advertências para migrar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      {status === 'idle' && (
        <button className="btn-primary" onClick={seed} style={{ padding: '14px 28px', fontSize: 16 }}>
          <Upload size={18} /> Iniciar Migração
        </button>
      )}
      {status === 'loading' && (
        <button className="btn-primary" disabled style={{ padding: '14px 28px', fontSize: 16, opacity: 0.7 }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Migrando dados...
        </button>
      )}
      {status === 'done' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <CheckCircle size={22} color='#00e5a0' />
          <span style={{ color: '#00e5a0', fontWeight: 700, fontSize: 16 }}>
            Migração concluída! {counts.employees} funcionários + {counts.advertencias} advertências
          </span>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="card" style={{ marginTop: 20, padding: 20, maxHeight: 400, overflowY: 'auto' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>📋 Log da Migração</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {log.map((l, i) => (
              <div key={i} style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace', color: l.type === 'error' ? '#ef4444' : l.type === 'warn' ? '#f59e0b' : l.type === 'success' ? '#00e5a0' : '#8892a4' }}>
                <span style={{ color: '#4a5568', marginRight: 8 }}>{l.time}</span>
                {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'done' && (
        <div style={{ marginTop: 20, padding: 16, background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 12 }}>
          <p style={{ color: '#00e5a0', fontWeight: 600, fontSize: 14 }}>✅ Agora volte ao Dashboard para ver seus dados reais!</p>
          <a href="/" style={{ color: '#4f8ef7', fontSize: 13, textDecoration: 'underline', marginTop: 4, display: 'inline-block' }}>
            → Ir para o Dashboard
          </a>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
