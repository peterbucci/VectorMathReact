import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Graph from "./components/Graph";
import Vector from "./components/Vector";
import "./styles/App.css";

const App = () => {
  const d3Container = useRef(null);
  const graphRef = useRef(null);
  const vectors = useRef({});
  const [selectedVector, setSelectedVector] = useState({});
  const [vectorX, setVectorX] = useState("");
  const [vectorY, setVectorY] = useState("");

  const updateVectorDetails = useCallback((vector) => {
    graphRef.current.updateVectorSum(vectors.current.a, vectors.current.b);
    setSelectedVector(vector);
    setVectorX(((vector.endX - vector.startX) / 10).toFixed(1));
    setVectorY(((vector.endY - vector.startY) / 10).toFixed(1));
  }, []);

  useEffect(() => {
    if (d3Container.current) {
      d3.select(d3Container.current).selectAll("*").remove();
      graphRef.current = new Graph(
        d3Container.current,
        500,
        300,
        updateVectorDetails,
        setSelectedVector
      );
      const graph = graphRef.current;

      graph.drawAxes();
      graph.drawGridLines();

      const vector1 = new Vector(
        "a",
        graph.svg,
        0,
        graph.height,
        10 * graph.cellSize,
        graph.height - 10 * graph.cellSize,
        updateVectorDetails,
        setSelectedVector
      );

      const vector2 = new Vector(
        "b",
        graph.svg,
        10 * graph.cellSize,
        graph.height - 10 * graph.cellSize,
        20 * graph.cellSize,
        graph.height - 10 * graph.cellSize,
        updateVectorDetails,
        setSelectedVector
      );

      vectors.current.a = vector1;
      vectors.current.b = vector2;
      graph.updateVectorSum(vector1, vector2);
    }
  }, [setSelectedVector, updateVectorDetails]);

  const handleVectorXChange = (e) => {
    const newX = parseFloat(e.target.value) * 10;
    if (!isNaN(newX) && selectedVector.startX !== undefined) {
      const vector = { ...selectedVector, endX: selectedVector.startX + newX };
      vectors.current[selectedVector.name].updateCoordinates(
        vector.startX,
        vector.startY,
        vector.endX,
        vector.endY
      );
      updateVectorDetails(vector);
    }
  };

  const handleVectorYChange = (e) => {
    const newY = parseFloat(e.target.value) * 10;
    if (!isNaN(newY) && selectedVector.startY !== undefined) {
      const vector = { ...selectedVector, endY: selectedVector.startY + newY };
      vectors.current[selectedVector.name].updateCoordinates(
        vector.startX,
        vector.startY,
        vector.endX,
        vector.endY
      );
      updateVectorDetails(vector);
    }
  };

  return (
    <div className="App">
      <div className="vector-values">
        <div className="toggle-container">
          <button className="toggle-button">—</button>
        </div>
        <div className="field-container">
          |v|{" "}
          <input
            type="number"
            className="vector-value-input"
            value={
              selectedVector.startX !== undefined
                ? Math.sqrt(
                    Math.pow(
                      (selectedVector.endX - selectedVector.startX) / 10,
                      2
                    ) +
                      Math.pow(
                        (selectedVector.endY - selectedVector.startY) / 10,
                        2
                      )
                  ).toFixed(1)
                : ""
            }
            readOnly
          />
        </div>
        <div className="field-container">
          θ{" "}
          <input
            type="number"
            className="vector-value-input"
            value={
              selectedVector.startX !== undefined
                ? (
                    Math.atan2(
                      -(selectedVector.endY - selectedVector.startY) / 10,
                      (selectedVector.endX - selectedVector.startX) / 10
                    ) *
                    (180 / Math.PI)
                  ).toFixed(1)
                : ""
            }
            readOnly
          />
        </div>
        <div className="field-container">
          v<sub>x</sub>{" "}
          <input
            type="number"
            className="vector-value-input"
            value={!isNaN(vectorX) ? vectorX : ""}
            onChange={handleVectorXChange}
          />
        </div>
        <div className="field-container">
          v<sub>y</sub>{" "}
          <input
            type="number"
            className="vector-value-input"
            value={!isNaN(vectorY) ? vectorY : ""}
            onChange={handleVectorYChange}
          />
        </div>
      </div>
      <div ref={d3Container} />
    </div>
  );
};

export default App;
