import React from "react";
import VectorInput from "./VectorInput";

const VectorDetails = ({
  activeVector,
  vectorDetails,
  handleVectorAdjust,
  saveVector,
  setActiveVector,
}) => {
  return (
    <div className="vector-details">
      {activeVector ? (
        <>
          <div className="button-container">
            <button
              className="toggle"
              onClick={saveVector}
              disabled={activeVector === "s"}
            >
              Update
            </button>
            <button className="close" onClick={() => setActiveVector(null)}>
              x
            </button>
          </div>
          {[
            ["magnitude", "|" + activeVector + "|"],
            ["angle", "θ"],
            ["xComponent", activeVector, "x"],
            ["yComponent", activeVector, "y"],
          ].map(([name, label, subLabel], i) => (
            <VectorInput
              key={i}
              label={label}
              subLabel={subLabel}
              value={vectorDetails[name]}
              onChange={(e) => handleVectorAdjust(name, e.target.value)}
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
