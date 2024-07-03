import React from "react";

const VectorControls = ({
  activeVector,
  selectedOperation,
  numberOfVectors,
  handleOperationChange,
  handleVectorAdd,
  handleVectorDelete,
  lockToGrid,
  handleVectorLockToggle,
}) => {
  return (
    <div className="vector-controls">
      <div>
        <label>Operation: </label>
        <select value={selectedOperation} onChange={handleOperationChange}>
          <option value="Addition">Addition</option>
          <option value="Subtraction">Subtraction</option>
        </select>
      </div>
      <div>
        <button
          className="styled-button"
          onClick={handleVectorAdd}
          disabled={numberOfVectors >= 11}
        >
          Add Vector
        </button>
        <button
          className="styled-button"
          onClick={handleVectorDelete}
          disabled={
            !activeVector || activeVector === "s" || numberOfVectors < 2
          }
        >
          Delete Vector
        </button>
        <button
          className={`styled-button grid-lock` + (lockToGrid ? " locked" : "")}
          onClick={handleVectorLockToggle}
        >
          Toggle Grid Lock
        </button>
      </div>
    </div>
  );
};

export default VectorControls;
