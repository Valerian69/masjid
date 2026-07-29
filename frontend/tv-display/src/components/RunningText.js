import React from 'react';

const RunningText = ({ texts }) => {
  if (!texts || texts.length === 0) return null;

  const combinedText = texts.map(t => `\u2605 ${t.teks}`).join('          \u2022\u2022\u2022\u2022\u2022          ');

  return (
    <div className="running-text-bar">
      <div className="running-text-content">{combinedText}</div>
    </div>
  );
};

export default RunningText;
