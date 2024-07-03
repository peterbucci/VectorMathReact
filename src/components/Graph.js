import * as d3 from "d3";

class Graph {
  /**
   * Constructor for the Graph class
   * @param {string} container - Container element for the graph
   * @param {number} numXTicks - Number of X-axis ticks
   * @param {number} numYTicks - Number of Y-axis ticks
   * @param {boolean} lockToGrid - Whether to lock the vectors to the grid
   */
  constructor(container, numXTicks, numYTicks, lockToGrid) {
    this.container = container;
    this.cellSize = 10;
    this.numXTicks = numXTicks;
    this.numYTicks = numYTicks;
    this.width = this.cellSize * numXTicks;
    this.height = this.cellSize * numYTicks;
    this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
    this.lockToGrid = lockToGrid;
    this.svg = null;
    this.xScale = d3
      .scaleLinear()
      .domain([0, numXTicks])
      .range([0, this.width]);
    this.yScale = d3
      .scaleLinear()
      .domain([0, numYTicks])
      .range([this.height, 0]);
    this.resultantVector = null;
    this.selectedOperation = "Addition";

    this.init();
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
    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  }

  drawAxes() {
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .tickValues(d3.range(0, this.numXTicks + 1, 5))
          .tickFormat((d) => (d % this.cellSize === 0 ? d : ""))
      );

    this.svg.append("g").call(
      d3
        .axisLeft(this.yScale)
        .tickValues(d3.range(0, this.numYTicks + 1, 5))
        .tickFormat((d) => (d % this.cellSize === 0 ? d : ""))
    );

    this.svg.selectAll(".tick").each(function (d) {
      if (d === 0) {
        this.remove();
      }
    });
  }

  drawGridLines() {
    this.svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${this.height})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .ticks(this.width / this.cellSize)
          .tickSize(-this.height)
          .tickFormat(() => "")
      )
      .selectAll(".tick")
      .classed("tick--minor", (d) => d % this.cellSize !== 0);

    this.svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(this.yScale)
          .ticks(this.height / this.cellSize)
          .tickSize(-this.width)
          .tickFormat(() => "")
      )
      .selectAll(".tick")
      .classed("tick--minor", (d) => d % this.cellSize !== 0);
  }

  /**
   * Perform vector addition on the selected vectors and update the resultant vector
   * @param {Array} arrayOfVectors - Array of vectors to add together
   */
  handleVectorAddition(arrayOfVectors) {
    // Initialize with the first vector's components or zero if the array is empty
    let sumX = 0;
    let sumY = 0;

    // Start from the second vector in the array and update the sum
    arrayOfVectors.forEach((vector) => {
      sumX += vector.endX - vector.startX;
      sumY += vector.endY - vector.startY;
    });

    this.resultantVector.endX = this.resultantVector.startX + sumX; // Update the end X coordinate of the sum vector
    this.resultantVector.endY = this.resultantVector.startY + sumY; // Update the end Y coordinate of the sum vector
    this.resultantVector.update(); // Update the sum vector
  }

  /**
   * Update the vector subtraction based on the selected operation
   * @param {Array} arrayOfVectors - Array of vectors to perform the operation on
   */
  handleVectorSubtraction(arrayOfVectors) {
    let differenceX = 0;
    let differenceY = 0;

    // Start from the second vector in the array and update the difference
    arrayOfVectors.forEach((vector) => {
      differenceX -= vector.endX - vector.startX;
      differenceY -= vector.endY - vector.startY;
    });

    this.resultantVector.endX = this.resultantVector.startX + differenceX; // Update the end X coordinate of the sum vector
    this.resultantVector.endY = this.resultantVector.startY + differenceY; // Update the end Y coordinate of the sum vector
    this.resultantVector.update(); // Update the sum vector
  }
}

export default Graph;
