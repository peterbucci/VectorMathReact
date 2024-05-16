import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Graph from "./components/Graph";
import VectorInput from "./components/VectorInput";
import createVector, { renameVectors } from "./helpers/create_vector";
import "./styles/App.css";

const App = () => {
  const svgContainerRef = useRef(null); // Reference to the SVG container
  const graphInstanceRef = useRef(null); // Reference to the Graph instance
  const vectorStorageRef = useRef({}); // Reference to the vector storage
  // State to keep track of the selected operation
  const [selectedOperation, setSelectedOperation] = useState("Addition");
  // State to keep track of the active vector
  const [activeVector, setActiveVector] = useState(null);
  // State to keep track of the vector details
  const [vectorDetails, setVectorDetails] = useState({
    magnitude: 0,
    angle: 0,
    xComponent: 0,
    yComponent: 0,
  });
  const [lockToGrid, setLockToGrid] = useState(true); // State to keep track of the lock to grid setting

  /**
   * Function to perform the selected operation on the vectors
   * and update the vector sum or difference
   */
  const performOperation = useCallback(() => {
    // Destructure the vector storage and remove the vector sum
    const { s, ...vectorStorage } = vectorStorageRef.current;
    const graphInstance = graphInstanceRef.current; // Reference to the Graph instance
    if (vectorStorage < 3) return; // Return if there are less than 3 vectors
    // Perform the selected operation
    switch (graphInstance.selectedOperation) {
      case "Addition":
        graphInstance.updateVectorSum(Object.values(vectorStorage)); // Update the vector sum
        break;
      case "Subtraction":
        graphInstance.updateVectorSubtraction(Object.values(vectorStorage)); // Update the vector difference
        break;
      default:
        break;
    }
  }, []);

  /**
   * Function to update the vector details based on the active vector
   * and calculate the magnitude, angle, x and y components of the active vector
   * @param {Object} vector - The active vector
   */
  const updateVectorDetails = useCallback(
    (vector) => {
      if (!vector) return; // Return if there is no active vector
      /*
       * Calculate the x and y components of the vector by dividing the difference between the end
       * and start coordinates by 10 to scale the vector to the graph
       */
      const x = (vector.endX - vector.startX) / 10;
      const y = (vector.startY - vector.endY) / 10;

      performOperation(); // Perform the selected operation

      const angle = Math.atan2(y, x) * (180 / Math.PI); // Calculate the angle of the vector
      const magnitude = Math.sqrt(x ** 2 + y ** 2); // Calculate the magnitude of the vector

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

  /**
   * UseEffect hook to update the vector details when the active vector changes
   */
  useEffect(() => {
    const vector = vectorStorageRef.current[activeVector]; // Get the active vector
    updateVectorDetails(vector); // Update the vector details
  }, [activeVector, updateVectorDetails]);

  /**
   * Function to create a new vector and update the vector storage
   * @param {number} startX - The x-coordinate of the start point of the vector
   * @param {number} startY - The y-coordinate of the start point of the vector
   * @param {number} endX - The x-coordinate of the end point of the vector
   * @param {number} endY - The y-coordinate of the end point of the vector
   * @param {boolean} isSum - A boolean to determine if the vector is the sum vector
   * @param {string} name - The name of the vector
   */
  const createVectorHandler = useCallback(
    (...args) => {
      // Create a new vector if there are less than 11 vectors
      if (Object.values(vectorStorageRef.current).length < 11)
        createVector(
          vectorStorageRef,
          graphInstanceRef,
          setActiveVector,
          updateVectorDetails,
          ...args
        );
    },
    [updateVectorDetails]
  );

  /**
   * UseEffect hook to create the graph and vectors when the component mounts
   */
  useEffect(() => {
    // Return if the SVG container or Graph instance is not available
    if (!svgContainerRef.current || graphInstanceRef.current) return;

    // Remove all elements from the SVG container
    d3.select(svgContainerRef.current).selectAll("*").remove();

    // Create a new Graph instance
    const newGraph = new Graph(svgContainerRef.current, 55, 35, lockToGrid);

    // Update the Graph instance reference
    graphInstanceRef.current = newGraph;

    // Create starting vectors
    createVectorHandler(15, 10, 0, 0, true, "s");
    createVectorHandler(15, 10, 15, 20);
    createVectorHandler(15, 20, 35, 20);

    // Set the vector sum and perform the operation
    newGraph.setVectorSum(vectorStorageRef.current.s);
    performOperation();
  }, [createVectorHandler, updateVectorDetails, performOperation]);

  useEffect(() => {
    saveVector();
  }, [lockToGrid]);

  /**
   * Function to save the vector details and update the vector coordinates
   */
  const saveVector = () => {
    const vector = vectorStorageRef.current[activeVector]; // Get the active vector
    const { xComponent, yComponent } = vectorDetails; // Get the x and y components
    // Return if the vector, x component or y component is not available
    if (!vector || isNaN(xComponent) || isNaN(yComponent)) return;

    // Calculate the new end coordinates based on the x and y components
    let newEndX = vector.startX + xComponent * 10;
    let newEndY = vector.startY - yComponent * 10;

    // If lockToGrid is true, snap to the nearest grid point (multiple of 10)
    if (lockToGrid) {
      newEndX = Math.round(newEndX / 10) * 10;
      newEndY = Math.round(newEndY / 10) * 10;
    }

    // Update the vector coordinates
    vector.updateCoordinates(vector.startX, vector.startY, newEndX, newEndY);
    updateVectorDetails({ ...vector, endX: newEndX, endY: newEndY }); // Update the vector details

    performOperation(); // Perform the selected operation
  };

  /**
   * Function to handle the adjustment of the vector details based on the type
   * If the type is xComponent or yComponent, the magnitude and angle are calculated
   * If the type is magnitude or angle, the x and y components are calculated
   * @param {string} type - The type of the vector detail
   * @param {string} value - The value of the vector detail
   */
  const handleVectorAdjust = (type, value) => {
    const { xComponent, yComponent } = vectorDetails; // Get the x and y components
    const updatedDetails = { ...vectorDetails }; // Get the updated vector details

    // Return if the value is not a number
    if (value === "") {
      updatedDetails[type] = value;
      setVectorDetails(updatedDetails);
      return;
    }

    const parsedValue = parseFloat(value); // Parse the value to a float
    let angleRadians, magnitude; // Initialize the angle in radians and magnitude
    updatedDetails[type] = parsedValue; // Update the vector details based on the type

    // If the type is xComponent or yComponent, calculate the magnitude and angle
    if (type === "xComponent" || type === "yComponent") {
      // To calculate the magnitude, use the Pythagorean theorem
      updatedDetails.magnitude = Math.sqrt(
        updatedDetails.xComponent ** 2 + updatedDetails.yComponent ** 2
      );
      // To calculate the angle, use the arctangent function and convert to degrees by multiplying by 180/π
      updatedDetails.angle =
        Math.atan2(updatedDetails.yComponent, updatedDetails.xComponent) *
        (180 / Math.PI);
    } else if (type === "magnitude") {
      // If the type is magnitude, calculate the x and y components
      magnitude = parsedValue; // Set the magnitude to the parsed value
      angleRadians = Math.atan2(yComponent, xComponent); // Calculate the angle using the arctangent function
      updatedDetails.xComponent = Math.cos(angleRadians) * magnitude; // Calculate the x component
      updatedDetails.yComponent = Math.sin(angleRadians) * magnitude; // Calculate the y component
    } else if (type === "angle") {
      // If the type is angle, calculate the x and y components
      angleRadians = parsedValue * (Math.PI / 180); // Convert the angle to radians by multiplying by π/180
      magnitude = Math.sqrt(xComponent ** 2 + yComponent ** 2); // Calculate the magnitude using the Pythagorean theorem
      updatedDetails.xComponent = Math.cos(angleRadians) * magnitude; // Calculate the x component
      updatedDetails.yComponent = Math.sin(angleRadians) * magnitude; // Calculate the y component
    }

    // Correct for floating-point precision errors
    updatedDetails.xComponent = parseFloat(
      updatedDetails.xComponent.toFixed(6)
    );
    updatedDetails.yComponent = parseFloat(
      updatedDetails.yComponent.toFixed(6)
    );

    setVectorDetails(updatedDetails); // Update the vector details
  };

  /**
   * Function to delete the active vector and update the vector storage
   * @param {string} vector - The active vector
   */
  const handleVectorDelete = (vector) => {
    // Return if the active vector is not available
    if (vectorStorageRef.current[vector]) {
      vectorStorageRef.current[vector].remove(); // Remove the active vector
      delete vectorStorageRef.current[vector]; // Delete the active vector from the vector storage
      renameVectors(vectorStorageRef); // Rename the vectors in the vector storage
      performOperation(); // Perform the selected operation
      setActiveVector(null); // Set the active vector to null
    }
  };

  const openExternalLink = (url) => {
    // Check if the electron shell module is available
    if (window.require) {
      const { shell } = window.require("electron");
      shell.openExternal(url);
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="App">
      <div className="vector-values">
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
          </>
        ) : (
          <p>Select a vector to view details</p>
        )}
      </div>
      <div ref={svgContainerRef} />
      <div>
        <input
          type="checkbox"
          id="lock-to-grid"
          checked={lockToGrid}
          onChange={(e) => {
            graphInstanceRef.current.lockToGrid = e.target.checked;
            setLockToGrid(e.target.checked);
          }}
        />
        <label htmlFor="lock-to-grid">Lock vectors to grid lines</label>
      </div>
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
        <button
          className="add-vector-button"
          onClick={() => {
            createVectorHandler();
            setActiveVector(
              vectorStorageRef.current[
                Object.keys(vectorStorageRef.current).pop()
              ].name
            );
          }}
          disabled={Object.values(vectorStorageRef.current).length >= 11}
        >
          Add Vector
        </button>
        <button
          className="remove-vector-button"
          onClick={() => handleVectorDelete(activeVector)}
          disabled={
            !activeVector ||
            activeVector === "s" ||
            Object.values(vectorStorageRef.current).length < 2
          }
        >
          Delete Vector
        </button>
      </div>
      <div className="github-container">
        Check out the code on{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openExternalLink("https://github.com/peterbucci/VectorMathReact");
          }}
        >
          Github
        </a>
      </div>
    </div>
  );
};

export default App;
