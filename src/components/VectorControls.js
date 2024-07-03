import React from "react";

const VectorControls = ({
  activeVector,
  selectedOperation,
  numberOfVectors,
  handleOperationChange,
  handleVectorAdd,
  handleVectorDelete,
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
          className="add-vector-button"
          onClick={handleVectorAdd}
          disabled={numberOfVectors >= 11}
        >
          Add Vector
        </button>
        <button
          className="remove-vector-button"
          onClick={handleVectorDelete}
          disabled={
            !activeVector || activeVector === "s" || numberOfVectors < 2
          }
        >
          Delete Vector
        </button>
      </div>
    </div>
  );
};

export default VectorControls;
