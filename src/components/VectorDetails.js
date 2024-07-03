import React from "react";
import VectorInput from "./VectorInput";

const VectorDetails = ({
  activeVector,
  vectorDetails,
  onVectorInputChange,
  saveVector,
  setActiveVector,
}) => {
  const inputDetails = [
    ["magnitude", "|" + activeVector + "|"],
    ["angle", "θ"],
    ["xComponent", activeVector, "x"],
    ["yComponent", activeVector, "y"],
  ];

  return (
    <div className="vector-details">
      {activeVector ? (
        <>
          <div className="button-container">
            <button
              className="update styled-button"
              onClick={saveVector}
              disabled={activeVector === "s"}
            >
              Update
            </button>
            <button
              className="close styled-button"
              onClick={() => setActiveVector(null)}
            >
              x
            </button>
          </div>
          {inputDetails.map(([name, label, subLabel], i) => (
            <VectorInput
              key={i}
              label={label}
              subLabel={subLabel}
              value={vectorDetails[name]}
              onChange={(e) => onVectorInputChange(name, e.target.value)}
              readOnly={activeVector === "s"}
            />
          ))}
        </>
      ) : (
        <p>Select a vector to view details</p>
      )}
    </div>
  );
};

export default VectorDetails;
