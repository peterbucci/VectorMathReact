import React from "react";

const VectorLock = ({ lockToGrid, handleVectorLockToggle }) => {
  return (
    <div className="vector-lock">
      <input
        type="checkbox"
        id="lock-to-grid"
        checked={lockToGrid}
        onChange={handleVectorLockToggle}
      />
      <label htmlFor="lock-to-grid">Lock vectors to grid lines</label>
    </div>
  );
};

export default VectorLock;
