import * as d3 from "d3";

class Graph {
  /**
   * Constructor for the Graph class
   * @param {string} container - Container element for the graph
   * @param {number} width - Width of the graph
   * @param {number} height - Height of the graph
   */
  constructor(container, width, height) {
    this.container = container; // Container element for the graph (e.g., "#graph")
    this.width = width;
    this.height = height;
    this.margin = { top: 10, right: 30, bottom: 30, left: 60 }; // Margin for the graph
    this.cellSize = 10; // Size of the grid cells
    this.svg = null; // SVG element for the graph
    this.xScale = d3.scaleLinear().domain([0, 50]).range([0, this.width]); // X scale for the graph
    this.yScale = d3.scaleLinear().domain([0, 30]).range([this.height, 0]); // Y scale for the graph
    this.vectorSum = null; // Hold the sum vector
    this.selectedOperation = "Addition"; // Default operation is vector addition

    this.init(); // Initialize the graph
  }

  /**
   * Initialize the graph by creating the SVG element and drawing the axes and grid lines
   */
  init() {
    this.createSvg(); // Create the SVG element
    this.drawAxes(); // Draw the axes
    this.drawGridLines(); // Draw the grid lines
  }

  /**
   * Create the SVG element for the graph
   * This method appends an SVG element to the container element
   */
  createSvg() {
    // Append an SVG element to the container element
    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right) // Set the width of the SVG element to the width of the graph
      .attr("height", this.height + this.margin.top + this.margin.bottom) // Set the height of the SVG element to the height of the graph
      .append("g") // Append a group element to the SVG element
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`); // Translate the group element by the margin
  }

  /**
   * Draw the axes for the graph
   */
  drawAxes() {
    // Draw the x-axis
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`) // Translate the x-axis to the bottom of the graph
      .call(
        d3
          .axisBottom(this.xScale) // Use the x-scale for the x-axis
          .tickValues(d3.range(0, 51, 5)) // Set the tick values to multiples of 5
          .tickFormat((d) => (d % 10 === 0 ? d : "")) // Format the tick labels
      );

    // Draw the y-axis
    this.svg.append("g").call(
      d3
        .axisLeft(this.yScale) // Use the y-scale for the y-axis
        .tickValues(d3.range(0, 31, 5)) // Set the tick values to multiples of 5
        .tickFormat((d) => (d % 10 === 0 ? d : "")) // Format the tick labels
    );

    // Remove the zero tick from the axes
    this.svg.selectAll(".tick").each(function (d) {
      if (d === 0) {
        this.remove();
      }
    });
  }

  /**
   * Draw the grid lines for the graph using the axes
   */
  drawGridLines() {
    // Draw the vertical grid lines
    this.svg
      .append("g") // Append a group element to the SVG
      .attr("class", "grid") // Set the class of the group element to "grid"
      .attr("transform", `translate(0,${this.height})`) // Translate the grid lines to the bottom of the graph
      .call(
        // Call the axis function
        d3
          .axisBottom(this.xScale) // Use the x-scale for the x-axis
          .ticks(50) // Set the number of ticks to 50
          .tickSize(-this.height) // Set the size of the grid lines
          .tickFormat(() => "") // Do not display tick labels
      )
      .selectAll(".tick") // Select all tick elements
      .classed("tick--minor", (d) => d % 10 !== 0); // Add the class "tick--minor" to minor ticks

    // Draw the horizontal grid lines
    this.svg
      .append("g") // Append a group element to the SVG
      .attr("class", "grid") // Set the class of the group element to "grid"
      .call(
        // Call the axis function
        d3
          .axisLeft(this.yScale) // Use the y-scale for the y-axis
          .ticks(30) // Set the number of ticks to 30
          .tickSize(-this.width) // Set the size of the grid lines
          .tickFormat(() => "") // Do not display tick labels
      )
      .selectAll(".tick") // Select all tick elements
      .classed("tick--minor", (d) => d % 10 !== 0); // Add the class "tick--minor" to minor ticks
  }

  /**
   * Update the vector sum based on the selected operation
   * @param {Array} arrayOfVectors - Array of vectors to perform the operation on
   */
  updateVectorSum(arrayOfVectors) {
    // Initialize with the first vector's components or zero if the array is empty
    let sumX =
      arrayOfVectors.length > 0
        ? arrayOfVectors[0].endX - arrayOfVectors[0].startX
        : 0;
    let sumY =
      arrayOfVectors.length > 0
        ? arrayOfVectors[0].endY - arrayOfVectors[0].startY
        : 0;

    // Start from the second vector in the array and update the sum
    arrayOfVectors.slice(1).forEach((vector) => {
      sumX += vector.endX - vector.startX;
      sumY += vector.endY - vector.startY;
    });

    this.vectorSum.endX = this.vectorSum.startX + sumX; // Update the end X coordinate of the sum vector
    this.vectorSum.endY = this.vectorSum.startY + sumY; // Update the end Y coordinate of the sum vector
    this.vectorSum.update(); // Update the sum vector
  }

  /**
   * Update the vector subtraction based on the selected operation
   * @param {Array} arrayOfVectors - Array of vectors to perform the operation on
   */
  updateVectorSubtraction(arrayOfVectors) {
    // Initialize with the first vector's components or zero if the array is empty
    let differenceX =
      arrayOfVectors.length > 0
        ? arrayOfVectors[0].endX - arrayOfVectors[0].startX
        : 0;
    let differenceY =
      arrayOfVectors.length > 0
        ? arrayOfVectors[0].endY - arrayOfVectors[0].startY
        : 0;

    // Start from the second vector in the array and update the difference
    arrayOfVectors.slice(1).forEach((vector) => {
      differenceX -= vector.endX - vector.startX;
      differenceY -= vector.endY - vector.startY;
    });

    this.vectorSum.endX = this.vectorSum.startX + differenceX; // Update the end X coordinate of the sum vector
    this.vectorSum.endY = this.vectorSum.startY + differenceY; // Update the end Y coordinate of the sum vector
    this.vectorSum.update(); // Update the sum vector
  }

  /**
   * Set the sum vector for the graph
   * @param {Object} vector - Sum vector to set
   */
  setVectorSum(vector) {
    this.vectorSum = vector;
  }
}

export default Graph;
