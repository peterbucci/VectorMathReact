import * as d3 from "d3";
import Vector from "./Vector";

class Graph {
  constructor(container, width, height, onUpdate, onSelect) {
    this.container = container;
    this.width = width;
    this.height = height;
    this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
    this.cellSize = 10;
    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.xScale = d3.scaleLinear().domain([0, 50]).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([0, 30]).range([this.height, 0]);
    this.vectorSum = null; // Hold the sum vector
    this.onSelect = onSelect; // Callback for when this vector is clicked
    this.onUpdate = onUpdate; // Callback for when vector is updated

    // Add arrowhead to the svg
    this.svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10") // Set the viewport to contain the arrowhead
      .attr("refX", 8) // Position of the tip of the arrowhead
      .attr("refY", 0)
      .attr("markerWidth", 4) // Marker size relative to the line
      .attr("markerHeight", 4)
      .attr("orient", "auto-start-reverse") // Ensures the arrowhead points correctly
      .append("path")
      .attr("d", "M0,-5L10,0L0,5Z") // Path for a solid triangle
      .style("fill", "black");
  }

  drawAxes() {
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .tickValues(d3.range(0, 51, 5))
          .tickFormat((d) => (d % 10 === 0 ? d : ""))
      );

    this.svg.append("g").call(
      d3
        .axisLeft(this.yScale)
        .tickValues(d3.range(0, 31, 5))
        .tickFormat((d) => (d % 10 === 0 ? d : ""))
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
          .ticks(50)
          .tickSize(-this.height)
          .tickFormat(() => "")
      )
      .selectAll(".tick")
      .classed("tick--minor", (d) => d % 10 !== 0);

    this.svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(this.yScale)
          .ticks(30)
          .tickSize(-this.width)
          .tickFormat(() => "")
      )
      .selectAll(".tick")
      .classed("tick--minor", (d) => d % 10 !== 0);
  }

  updateVectorSum(vector1, vector2) {
    const v1x = vector1.endX - vector1.startX; // X component of vector1
    const v1y = vector1.endY - vector1.startY; // Y component of vector1
    const v2x = vector2.endX - vector2.startX; // X component of vector2
    const v2y = vector2.endY - vector2.startY; // Y component of vector2

    // Calculate sum components
    const sumX = v1x + v2x;
    const sumY = v1y + v2y;

    if (this.vectorSum) {
      // Use the current start position of the sum vector and update only the end position
      this.vectorSum.endX = this.vectorSum.startX + sumX;
      this.vectorSum.endY = this.vectorSum.startY + sumY;
      this.vectorSum.update();
    } else {
      // Initially set the sum vector from a central or specific starting point
      const startX = this.width / 2;
      const startY = this.height / 2;
      const endX = startX + sumX;
      const endY = startY + sumY;

      this.vectorSum = new Vector(
        "s",
        this.svg,
        startX,
        startY,
        endX,
        endY,
        null,
        this.onSelect,
        this.onUpdate,
        true // This is the sum vector
      );
    }
  }
}

export default Graph;
