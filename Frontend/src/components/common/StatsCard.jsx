import React from 'react';
import './StatsCard.scss';

const StatsCard = ({ title, value, icon, color = 'primary', trend, subtitle }) => {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__header">
        <div className="stats-card__icon">
          {icon}
        </div>
        {trend && (
          <div className={`stats-card__trend stats-card__trend--${trend.type}`}>
            {trend.type === 'up' ? '↗️' : '↘️'} {trend.value}
          </div>
        )}
      </div>
      <div className="stats-card__content">
        <h3 className="stats-card__value">{value}</h3>
        <p className="stats-card__title">{title}</p>
        {subtitle && <span className="stats-card__subtitle">{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
