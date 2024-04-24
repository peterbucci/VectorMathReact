import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Graph from "./components/Graph";
import VectorInput from "./components/VectorInput";
import createVector from "./helpers/create_vector";
import "./styles/App.css";

const App = () => {
  const svgContainerRef = useRef(null);
  const graphInstanceRef = useRef(null);
  const vectorStorageRef = useRef({});
  const [activeVector, setActiveVector] = useState(null);
  const [vectorMagnitude, setVectorMagnitude] = useState(0);
  const [vectorAngle, setVectorAngle] = useState(0);
  const [vectorXComponent, setVectorXComponent] = useState(0);
  const [vectorYComponent, setVectorYComponent] = useState(0);
  const [vectorDetails, setVectorDetails] = useState({
    activeVector: null,
    magnitude: 0,
    angle: 0,
    xComponent: 0,
    yComponent: 0,
  });

  // Handles updating the vector's components, magnitude, and angle
  const updateVectorDetails = useCallback((vector) => {
    if (!vector) return;
    const vectorXComponent = (vector.endX - vector.startX) / 10;
    const vectorYComponent = (vector.startY - vector.endY) / 10;

    graphInstanceRef.current.updateVectorSum(
      vectorStorageRef.current.a,
      vectorStorageRef.current.b
    );

    const angle =
      Math.atan2(vectorYComponent, vectorXComponent) * (180 / Math.PI);
    const magnitude = Math.sqrt(vectorXComponent ** 2 + vectorYComponent ** 2);

    setVectorXComponent(vectorXComponent);
    setVectorYComponent(vectorYComponent);
    setVectorAngle(angle);
    setVectorMagnitude(magnitude);
  }, []);

  useEffect(() => {
    const vector = vectorStorageRef.current[activeVector];
    updateVectorDetails(vector);
  }, [activeVector, updateVectorDetails]);

  const createVectorHandler = useCallback(
    (...args) =>
      createVector(
        ...args,
        graphInstanceRef.current,
        setActiveVector,
        updateVectorDetails
      ),
    [updateVectorDetails]
  );

  useEffect(() => {
    if (!svgContainerRef.current) return;
    d3.select(svgContainerRef.current).selectAll("*").remove();

    const newGraph = new Graph(svgContainerRef.current, 500, 300);

    graphInstanceRef.current = newGraph;

    // Create vectors
    vectorStorageRef.current.a = createVectorHandler("a", 0, 0, 3, 6, false);
    vectorStorageRef.current.b = createVectorHandler("b", 0, 0, 11, 6, false);
    vectorStorageRef.current.s = createVectorHandler("s", 0, 0, 0, 0, true);

    newGraph.setVectorSum(vectorStorageRef.current.s);
    newGraph.updateVectorSum(
      vectorStorageRef.current.a,
      vectorStorageRef.current.b
    );
  }, [createVectorHandler]);

  const saveVector = () => {
    const vector = vectorStorageRef.current[activeVector];
    if (!vector || isNaN(vectorXComponent) || isNaN(vectorYComponent)) return;

    const updatedVector = {
      ...vector,
      endX: vector.startX + vectorXComponent * 10,
      endY: vector.startY - vectorYComponent * 10,
    };

    vectorStorageRef.current[activeVector].updateCoordinates(
      updatedVector.startX,
      updatedVector.startY,
      updatedVector.endX,
      updatedVector.endY
    );

    graphInstanceRef.current.updateVectorSum(
      vectorStorageRef.current.a,
      vectorStorageRef.current.b
    );
  };

  const handleMagnitudeChange = (event) => {
    setVectorMagnitude(event.target.value);
    const magnitude = parseFloat(event.target.value);
    if (isNaN(magnitude)) return;
    const angleRadians = Math.atan2(vectorYComponent, vectorXComponent);

    const newX = Math.cos(angleRadians) * magnitude;
    const newY = Math.sin(angleRadians) * magnitude;

    setVectorXComponent(newX);
    setVectorYComponent(newY);
  };

  const handleAngleChange = (event) => {
    setVectorAngle(event.target.value);
    const angleDegrees = parseFloat(event.target.value);
    if (isNaN(angleDegrees)) return;
    const magnitude = Math.sqrt(vectorXComponent ** 2 + vectorYComponent ** 2);
    const angleRadians = angleDegrees * (Math.PI / 180);

    const newX = Math.cos(angleRadians) * magnitude;
    const newY = Math.sin(angleRadians) * magnitude;

    setVectorXComponent(newX);
    setVectorYComponent(newY);
  };

  const handleVectorComponentChange = (dimension, value) => {
    const vector = vectorStorageRef.current[activeVector];
    if (!vector) return;

    if (dimension === "X") {
      setVectorXComponent(value);
    } else if (dimension === "Y") {
      setVectorYComponent(value);
    }

    const updatedMagnitude = Math.sqrt(
      Math.pow(dimension === "X" ? value : vectorXComponent, 2) +
        Math.pow(dimension === "Y" ? value : vectorYComponent, 2)
    );

    const angleRadians = Math.atan2(
      dimension === "Y" ? value : vectorYComponent,
      dimension === "X" ? value : vectorXComponent
    );

    setVectorMagnitude(updatedMagnitude);
    setVectorAngle((angleRadians * 180) / Math.PI);
  };

  return (
    <div className="App">
      <div className="vector-values">
        <div className="toggle-container">
          <button className="toggle-button" onClick={saveVector}>
            &#x1F4BE;
          </button>
        </div>
        <VectorInput
          label="|v|"
          value={activeVector ? vectorMagnitude : ""}
          onChange={handleMagnitudeChange}
          readOnly={!activeVector || activeVector === "s"}
        />
        <VectorInput
          label="θ"
          value={activeVector ? vectorAngle : ""}
          onChange={handleAngleChange}
          readOnly={!activeVector || activeVector === "s"}
        />
        <VectorInput
          label="v"
          subLabel="x"
          value={activeVector ? vectorXComponent : ""}
          onChange={(e) => handleVectorComponentChange("X", e.target.value)}
          readOnly={!activeVector || activeVector === "s"}
        />
        <VectorInput
          label="v"
          subLabel="y"
          value={activeVector ? vectorYComponent : ""}
          onChange={(e) => handleVectorComponentChange("Y", e.target.value)}
          readOnly={!activeVector || activeVector === "s"}
        />
      </div>
      <div ref={svgContainerRef} />
    </div>
  );
};

export default App;
