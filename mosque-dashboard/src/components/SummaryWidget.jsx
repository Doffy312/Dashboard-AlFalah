import React from 'react';

const SummaryWidget = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>{title}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</h3>
        </div>
        <div className="btn-icon" style={{ cursor: 'default', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <span style={{ 
            color: trendUp ? 'var(--accent-color)' : '#ef4444', 
            background: trendUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600
          }}>
            {trendUp ? '+' : '-'}{trend}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>vs last month</span>
        </div>
      )}
    </div>
  );
};

export default SummaryWidget;
