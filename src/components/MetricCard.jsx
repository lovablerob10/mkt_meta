import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  icon: Icon,
  value,
  label,
  abbr,
  abbrFull,
  trend,
  trendValue,
  highlight = false,
  className = '',
}) {
  return (
    <div className={`metric-card animate-in${highlight ? ' highlight' : ''} ${className}`}>
      <div className="metric-card-header">
        {Icon && (
          <div className="metric-card-icon">
            <Icon size={20} />
          </div>
        )}
        {trend && (
          <div className={`metric-card-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-label">
        {label}
        {abbr && (
          <span className="metric-card-abbr" title={abbrFull}>
            {abbr}
          </span>
        )}
      </div>
    </div>
  );
}
