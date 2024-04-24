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
  const [selectedOperation, setSelectedOperation] = useState("Addition");
  const [activeVector, setActiveVector] = useState(null);
  const [vectorDetails, setVectorDetails] = useState({
    magnitude: 0,
    angle: 0,
    xComponent: 0,
    yComponent: 0,
  });

  const performOperation = useCallback(() => {
    if (!vectorStorageRef.current.a || !vectorStorageRef.current.b) return;
    switch (graphInstanceRef.current.selectedOperation) {
      case "Addition":
        graphInstanceRef.current.updateVectorSum(
          vectorStorageRef.current.a,
          vectorStorageRef.current.b
        );
        break;
      case "Subtraction":
        graphInstanceRef.current.updateVectorSubtraction(
          vectorStorageRef.current.a,
          vectorStorageRef.current.b
        );
        break;
      default:
        break;
    }
  }, []);

  // Handles updating the vector's components, magnitude, and angle
  const updateVectorDetails = useCallback(
    (vector) => {
      if (!vector) return;
      const x = (vector.endX - vector.startX) / 10;
      const y = (vector.startY - vector.endY) / 10;

      performOperation();

      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const magnitude = Math.sqrt(x ** 2 + y ** 2);

      setVectorDetails((prev) => ({
        ...prev,
        magnitude,
        angle,
        xComponent: x,
        yComponent: y,
      }));
    },
    [performOperation]
  );

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
    if (!svgContainerRef.current || graphInstanceRef.current) return;

    console.log("Creating graph");
    d3.select(svgContainerRef.current).selectAll("*").remove();

    const newGraph = new Graph(svgContainerRef.current, 500, 300);

    graphInstanceRef.current = newGraph;

    // Create vectors
    vectorStorageRef.current.a = createVectorHandler(
      "a",
      "blue",
      15,
      10,
      15,
      20,
      false
    );
    vectorStorageRef.current.b = createVectorHandler(
      "b",
      "green",
      15,
      20,
      35,
      20,
      false
    );
    vectorStorageRef.current.s = createVectorHandler(
      "s",
      "red",
      15,
      10,
      0,
      0,
      true
    );

    newGraph.setVectorSum(vectorStorageRef.current.s);
    performOperation();
  }, [createVectorHandler, updateVectorDetails, performOperation]);

  const saveVector = () => {
    const vector = vectorStorageRef.current[activeVector];
    const { xComponent, yComponent } = vectorDetails;
    if (!vector || isNaN(xComponent) || isNaN(yComponent)) return;

    const updatedVector = {
      ...vector,
      endX: vector.startX + xComponent * 10,
      endY: vector.startY - yComponent * 10,
    };

    vectorStorageRef.current[activeVector].updateCoordinates(
      updatedVector.startX,
      updatedVector.startY,
      updatedVector.endX,
      updatedVector.endY
    );

    performOperation();
  };

  // Adjust magnitude or angle and update the x and y components accordingly
  const handleVectorAdjust = (type, value) => {
    const { xComponent, yComponent } = vectorDetails;
    const updatedDetails = { ...vectorDetails };
    const parsedValue = parseFloat(value);
    let angleRadians, magnitude;

    updatedDetails[type] = value;
    if (isNaN(parsedValue)) {
      setVectorDetails(updatedDetails);
      return;
    }

    if (type === "xComponent" || type === "yComponent") {
      updatedDetails.magnitude = Math.sqrt(
        updatedDetails.xComponent ** 2 + updatedDetails.yComponent ** 2
      );
      updatedDetails.angle =
        Math.atan2(updatedDetails.yComponent, updatedDetails.xComponent) *
        (180 / Math.PI);
    } else if (type === "magnitude") {
      magnitude = parsedValue;
      angleRadians = Math.atan2(yComponent, xComponent);
      updatedDetails.xComponent = Math.cos(angleRadians) * magnitude;
      updatedDetails.yComponent = Math.sin(angleRadians) * magnitude;
    } else if (type === "angle") {
      angleRadians = parsedValue * (Math.PI / 180);
      magnitude = Math.sqrt(xComponent ** 2 + yComponent ** 2);
      updatedDetails.xComponent = Math.cos(angleRadians) * magnitude;
      updatedDetails.yComponent = Math.sin(angleRadians) * magnitude;
    }

    setVectorDetails(updatedDetails);
  };

  return (
    <div className="App">
      <div className="vector-values">
        <div className="toggle-container">
          <button className="toggle-button" onClick={saveVector}>
            Update
          </button>
        </div>
        <VectorInput
          label={"|" + (activeVector || "v") + "|"}
          value={activeVector ? vectorDetails.magnitude : ""}
          onChange={(e) => handleVectorAdjust("magnitude", e.target.value)}
          readOnly={!activeVector || activeVector === "s"}
        />
        <VectorInput
          label="θ"
          value={activeVector ? vectorDetails.angle : ""}
          onChange={(e) => handleVectorAdjust("angle", e.target.value)}
          readOnly={!activeVector || activeVector === "s"}
        />
        <VectorInput
          label={activeVector || "v"}
          subLabel="x"
          value={activeVector ? vectorDetails.xComponent : ""}
          onChange={(e) => handleVectorAdjust("xComponent", e.target.value)}
          readOnly={!activeVector || activeVector === "s"}
        />
        <VectorInput
          label={activeVector || "v"}
          subLabel="y"
          value={activeVector ? vectorDetails.yComponent : ""}
          onChange={(e) => handleVectorAdjust("yComponent", e.target.value)}
          readOnly={!activeVector || activeVector === "s"}
        />
      </div>
      <div ref={svgContainerRef} />
      <div>
        <label>Operation: </label>
        <select
          value={selectedOperation}
          onChange={(e) => {
            setSelectedOperation(e.target.value);
            graphInstanceRef.current.selectedOperation = e.target.value;
            performOperation();
          }}
        >
          <option value="Addition">Addition</option>
          <option value="Subtraction">Subtraction</option>
        </select>
      </div>
    </div>
  );
};

export default App;
