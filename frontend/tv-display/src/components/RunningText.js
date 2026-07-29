import React from 'react';
import { MegaphoneIcon } from './Icons';

const RunningText = ({ texts }) => {
  if (!texts || texts.length === 0) return null;

  const combinedText = texts.map((t, i) => (
    <React.Fragment key={i}>
      <span>{t.teks}</span>
      <span className="dot" />
    </React.Fragment>
  ));

  return (
    <div className="running-text-bar animate-in stagger-8">
      <div className="running-text-content">
        {combinedText}
      </div>
    </div>
  );
};

export default RunningText;
