import './StatCard.css';

export default function StatCard({ icon, label, value, trend, trendUp, color = 'primary', delay = 0 }) {
  return (
    <div
      className={`stat-card stat-card--${color} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`stat-card__trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
