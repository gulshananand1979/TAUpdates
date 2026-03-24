import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchUpdates } from '../../services/api';
import './Updates.css';

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const data = await fetchUpdates();
        setUpdates(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load updates');
        setLoading(false);
      }
    };
    loadUpdates();
  }, []);

  if (loading) {
    return (
      <div className="updates-page loading-state">
        <Loader2 className="spinner" size={40} />
        <p>Loading Updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="updates-page error-state">
        <p>{error}</p>
      </div>
    );
  }

  const types = [
    { key: 'all', label: 'All Updates' },
    { key: 'offer_accepted', label: 'Offers Accepted' },
    { key: 'offer_extended', label: 'Offers Extended' },
    { key: 'interview_scheduled', label: 'Interviews' },
    { key: 'new_position', label: 'New Positions' },
    { key: 'milestone', label: 'Milestones' },
  ];

  const filtered = typeFilter === 'all'
    ? updates
    : updates.filter(u => u.type === typeFilter);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="updates-page" id="updates-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hiring Updates</h1>
          <p className="page-subtitle">Stay on top of all talent acquisition activity</p>
        </div>
      </div>

      <div className="filter-chips animate-fade-in" style={{ marginBottom: '24px' }}>
        {types.map(t => (
          <button
            key={t.key}
            className={`filter-chip ${typeFilter === t.key ? 'active' : ''}`}
            onClick={() => setTypeFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="timeline">
        <div className="timeline-line"></div>
        {filtered.map((update, i) => (
          <div
            key={update._id || update.id || i}
            className="timeline-item animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="timeline-dot">
              <span className="timeline-dot__icon">{update.icon}</span>
            </div>
            <div className={`timeline-card timeline-card--${update.type}`}>
              <div className="timeline-card__header">
                <h3 className="timeline-card__title">{update.title}</h3>
                <span className="timeline-card__time">{formatTime(update.timestamp)}</span>
              </div>
              <p className="timeline-card__desc">{update.description}</p>
              <div className="timeline-card__footer">
                <span className="timeline-card__dept">{update.department}</span>
                <span className="timeline-card__date">
                  {new Date(update.timestamp).toLocaleDateString('en-IN', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state animate-fade-in">
          <p className="empty-state__text">No updates found for this filter.</p>
        </div>
      )}
    </div>
  );
}
