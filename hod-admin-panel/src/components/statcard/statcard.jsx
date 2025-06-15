import React from 'react';
import './statcard.scss';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`statcard statcard--${color}`}>
    <div className="statcard__icon">{Icon && <Icon />}</div>
    <div>
      <div className="statcard__title">{title}</div>
      <div className="statcard__value">{value}</div>
    </div>
  </div>
);

export default StatCard;
