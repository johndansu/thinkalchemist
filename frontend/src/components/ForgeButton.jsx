import React from 'react';

function ForgeButton({ onClick, disabled, loading }) {
  return (
    <button
      className="forge-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Alchemy in progress...' : 'Forge'}
    </button>
  );
}

export default ForgeButton;

