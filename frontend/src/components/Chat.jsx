import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Loader2 } from 'lucide-react';
import { sendChat } from '../api/client';

export default function Chat({ userId = 'demo_user' }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Initializing Nexus AI Core...\n\nSystems online. Awaiting directive.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    
    try {
      const { data } = await sendChat(userMsg, userId);
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', text: 'CONNECTION_FAILURE: ' + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chat-history">
        {messages.map((m, i) => (
          <div key={i} className={`hud-msg ${m.role}`}>
            {m.role === 'assistant' || m.role === 'error' ? (
              <div className="markdown-body">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            ) : (
              m.text
            )}
            {m.role === 'user' && (
              <div style={{ position: 'absolute', bottom: '-20px', right: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                [DIRECTIVE SENT]
              </div>
            )}
            {m.role === 'assistant' && (
              <div style={{ position: 'absolute', top: '16px', left: '-12px' }}>
                <Bot size={16} color="var(--accent-purple)" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="hud-msg assistant">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
              <Loader2 className="animate-spin-slow" size={16} />
              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>Processing directive...</span>
            </div>
            <div style={{ position: 'absolute', top: '16px', left: '-12px' }}>
              <Bot size={16} color="var(--accent-purple)" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-area">
        <div className="hud-input-box">
          <input 
            className="hud-input"
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="[Enter directive]" 
            disabled={loading}
            autoFocus
          />
          <button 
            className="btn-icon" 
            onClick={send} 
            disabled={loading || !input.trim()}
            style={{ color: (input.trim() && !loading) ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
          >
            {loading ? <Loader2 className="animate-spin-slow" size={24} /> : <Send size={24} />}
          </button>
        </div>
      </div>
    </>
  );
}
