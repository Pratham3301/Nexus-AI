import { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, CalendarDays, Terminal, RefreshCw } from 'lucide-react';
import { getInsights, runWorkflow } from '../api/client';

export default function InsightPanel({ userId = 'demo_user', onInsightTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInsights(userId);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const executeBriefing = async () => {
    setLoading(true);
    try {
      const res = await runWorkflow('morning_briefing', userId);
      setBriefing(res.data.result);
      if(onInsightTrigger) onInsightTrigger();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [userId, fetchInsights]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button className="btn-cyber" onClick={executeBriefing} disabled={loading} style={{ width: '100%' }}>
          <Terminal size={14} /> 
          {loading ? 'EXECUTING...' : 'INIT: MORNING BRIEFING'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button className="btn-icon" onClick={fetchInsights}>
          <RefreshCw size={16} className={loading && !briefing ? 'animate-spin-slow' : ''} />
        </button>
      </div>

      {briefing && (
        <div className="data-card" style={{ '--card-accent': 'var(--accent-purple)' }}>
          <h4 style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.75rem', 
            color: 'var(--accent-purple)', 
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            [SYS_OUT: BRIEFING_DATA]
          </h4>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.85rem' }}>
            {briefing}
          </div>
        </div>
      )}

      {loading && !briefing && (
        <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          &gt; CONNECTING TO TELEMETRY...
        </div>
      )}

      {data?.insights?.map((inf, i) => {
        const isString = typeof inf === 'string';
        const message = isString ? inf : (inf?.message || '');
        const isWarning = message.toLowerCase().includes('warn') || message.toLowerCase().includes('conflict') || message.toLowerCase().includes('overdue');
        const accentTheme = isWarning ? 'var(--accent-red)' : 'var(--accent-cyan)';
        
        return (
          <div key={i} className="data-card" style={{ '--card-accent': accentTheme }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ color: accentTheme, flexShrink: 0, marginTop: '2px' }}>
                {isWarning ? <AlertTriangle size={16} /> : <Activity size={16} /> }
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                {message}
              </div>
            </div>
          </div>
        );
      })}
      
      {!loading && !data?.insights?.length && !briefing && (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          &gt; TELEMETRY: GREEN. NO ANOMALIES.
        </div>
      )}
    </>
  );
}
