import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Loader } from 'lucide-react'

const SYSTEM = `Você é Olivia, assistente de RH especializada em varejo e supermercados, com foco em legislação trabalhista brasileira (CLT).

Você auxilia Gustavo, gestor de RH do Oliver's Supermercado, um supermercado familiar em Franca/SP. A empresa tem setores: açougue, padaria, caixas, depósito, limpeza e segurança.

Sua função:
- Dar orientações práticas sobre gestão de pessoas, conflitos, advertências, demissões
- Esclarecer dúvidas sobre CLT, FGTS, férias, 13º salário, aviso prévio, rescisões
- Ajudar a redigir advertências, comunicados, feedbacks, PDIs
- Sugerir ações de melhoria para o setor de RH
- Calcular verbas rescisórias, horas extras, adicionais

Seja direta, prática e use linguagem simples. Sempre contextualize para o setor de supermercado quando relevante. Quando não souber algo com certeza, diga claramente e sugira consultar um advogado trabalhista ou contador.`

const SUGESTOES = [
  "Como calcular o aviso prévio proporcional?",
  "Meu funcionário quer pedir demissão, quais os direitos dele?",
  "Como redigir uma advertência por falta injustificada?",
  "Preciso de um PDI para um repositor com baixo desempenho",
  "Como lidar com conflito entre dois caixas?",
  "Quais os encargos que pago sobre o salário de um CLT?",
]

export default function Assistente() {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Olá, Gustavo! 👋 Sou a Olivia, sua assistente de RH. Pode me perguntar sobre CLT, conflitos, advertências, cálculos trabalhistas ou qualquer situação do Oliver\'s. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const newMessages = [...messages, { role:'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM,
          messages: apiMessages
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Desculpe, não consegui gerar uma resposta. Tente novamente.'
      setMessages(prev => [...prev, { role:'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content: '❌ Erro ao conectar com a IA. Verifique sua chave da API Anthropic nas configurações.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', padding:'32px 36px 0' }} className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, background:'linear-gradient(135deg,#00e5a0,#4f8ef7)', borderRadius:12, display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Bot size={22} color='#080c10' />
          </div>
          <div>
            <h1 style={{ fontFamily:'Syne', fontSize:22, fontWeight:800, color:'#e2e8f0' }}>Olivia — Assistente de RH</h1>
            <p style={{ color:'#8892a4', fontSize:13 }}>IA especializada em CLT, gestão de pessoas e supermercados</p>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, background:'#00e5a0', borderRadius:'50%' }} className="animate-pulse-slow" />
            <span style={{ fontSize:12, color:'#00e5a0', fontWeight:600 }}>Online</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16, paddingBottom:16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width:32, height:32, background:'linear-gradient(135deg,#00e5a0,#4f8ef7)', borderRadius:10, display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginRight:10,marginTop:4 }}>
                <Bot size={16} color='#080c10' />
              </div>
            )}
            <div className={m.role==='user'?'chat-user':'chat-ai'} style={{ fontSize:14, lineHeight:1.7, whiteSpace:'pre-wrap' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ width:32,height:32,background:'linear-gradient(135deg,#00e5a0,#4f8ef7)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Bot size={16} color='#080c10' />
            </div>
            <div className="chat-ai" style={{ display:'flex', gap:6, alignItems:'center', padding:'14px 18px' }}>
              <Loader size={14} color='#8892a4' style={{ animation:'spin 1s linear infinite' }} />
              <span style={{ color:'#8892a4', fontSize:13 }}>Olivia está digitando...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Sugestões rápidas */}
      {messages.length <= 2 && (
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:12, color:'#4a5568', marginBottom:10 }}>💡 Sugestões:</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {SUGESTOES.map(s => (
              <button key={s} onClick={()=>send(s)} style={{
                background:'#141b28', border:'1px solid #1e2d42', borderRadius:20,
                padding:'7px 14px', fontSize:12, color:'#8892a4', cursor:'pointer',
                transition:'all 0.2s'
              }} onMouseEnter={e=>{e.target.style.borderColor='#00e5a0';e.target.style.color='#00e5a0'}}
                 onMouseLeave={e=>{e.target.style.borderColor='#1e2d42';e.target.style.color='#8892a4'}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding:'16px 0 28px', borderTop:'1px solid #1e2d42', marginTop:'auto' }}>
        <div style={{ display:'flex', gap:12 }}>
          <input
            className="input-field"
            placeholder="Pergunte sobre CLT, conflitos, cálculos trabalhistas, PDI..."
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),send())}
            disabled={loading}
            style={{ flex:1 }}
          />
          <button
            className="btn-primary"
            onClick={()=>send()}
            disabled={loading || !input.trim()}
            style={{ padding:'10px 18px', flexShrink:0 }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{ fontSize:11, color:'#4a5568', marginTop:8 }}>Enter para enviar · A Olivia pode cometer erros — sempre consulte um profissional para decisões importantes.</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
