import { useState, useEffect } from 'react';
import { Crosshair, Circle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { getTasks } from '../api/client';

export default function TaskList({ userId = 'demo_user', refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await getTasks(userId);
      const sorted = data.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
        return (b.priority || 3) - (a.priority || 3);
      });
      setTasks(sorted);
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId, refreshTrigger]);

  const priorityColor = (p) => {
    if (p >= 5) return 'var(--accent-red)';
    if (p === 4) return 'var(--accent-purple)';
    if (p === 3) return 'var(--accent-cyan)';
    return 'var(--text-muted)';
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button className="btn-icon" onClick={fetchTasks}>
          <RefreshCw size={16} className={loading ? 'animate-spin-slow' : ''} />
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          &gt; SCANNING DIRECTIVES...
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          &gt; NO ACTIVE DIRECTIVES.
        </div>
      ) : (
        tasks.map(task => {
          const isDone = task.status === 'done';
          return (
            <div 
              key={task.id || task.task_id || Math.random()} 
              className="data-card"
              style={{ 
                '--card-accent': isDone ? 'var(--text-muted)' : priorityColor(task.priority),
                opacity: isDone ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: isDone ? 'var(--text-muted)' : 'var(--accent-cyan)', marginTop: '2px' }}>
                  {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontFamily: 'var(--font-main)', 
                    fontSize: '1rem',
                    fontWeight: 500,
                    margin: '0 0 8px 0', 
                    textDecoration: isDone ? 'line-through' : 'none',
                    color: isDone ? 'var(--text-muted)' : 'var(--text-main)'
                  }}>
                    {task.title}
                  </h4>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="status-badge" style={{ color: priorityColor(task.priority) }}>
                      LVL {task.priority || 3}
                    </span>
                    
                    {task.due_date && (
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Clock size={12} /> 
                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
