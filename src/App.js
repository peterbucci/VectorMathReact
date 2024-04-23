import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./App.css";

class Graph {
  constructor(container, width, height) {
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
        this.svg,
        startX,
        startY,
        endX,
        endY,
        null,
        true // This is the sum vector
      );
    }
  }
}

class Vector {
  constructor(svg, startX, startY, endX, endY, onUpdate, isSum = false) {
    this.svg = svg;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.onUpdate = onUpdate; // Callback for when vector is updated
    this.isSum = isSum; // Flag to determine if this is a sum vector
    this.draw();
  }

  draw() {
    this.line = this.svg
      .append("line")
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", this.endX)
      .attr("y2", this.endY)
      .attr("stroke", "black")
      .attr("stroke-width", 4)
      .style("cursor", "move")
      .call(d3.drag().on("drag", this.dragged.bind(this)));

    if (this.isSum) this.line.attr("marker-start", "url(#arrowhead)");
    else this.line.attr("marker-end", "url(#arrowhead)");

    if (!this.isSum)
      this.arrowhead = this.svg
        .append("circle")
        .attr("cx", this.endX)
        .attr("cy", this.endY)
        .attr("r", 10)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .call(d3.drag().on("drag", this.arrowheadDragged.bind(this)));
  }

  dragged(event) {
    this.startX += event.dx;
    this.startY += event.dy;
    this.endX += event.dx;
    this.endY += event.dy;
    this.update();
  }

  arrowheadDragged(event) {
    this.endX += event.dx;
    this.endY += event.dy;
    this.update();
    if (this.onUpdate) this.onUpdate();
  }

  update() {
    this.line
      .attr("x1", this.startX)
      .attr("y1", this.startY)
      .attr("x2", this.endX)
      .attr("y2", this.endY);
    if (!this.isSum) this.arrowhead.attr("cx", this.endX).attr("cy", this.endY);
  }
}

const App = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current) {
      // Clear any existing SVG elements
      d3.select(d3Container.current).selectAll("*").remove();

      // Initialize the graph
      const graph = new Graph(d3Container.current, 500, 300);
      graph.drawAxes();
      graph.drawGridLines();

      // Define a function to update the sum vector whenever any vector is adjusted
      const updateSum = () => {
        if (vector1 && vector2) {
          graph.updateVectorSum(vector1, vector2);
        }
      };

      // Create the vectors
      const vector1 = new Vector(
        graph.svg,
        0,
        graph.height,
        10 * graph.cellSize,
        graph.height - 10 * graph.cellSize,
        updateSum
      );

      const vector2 = new Vector(
        graph.svg,
        10 * graph.cellSize,
        graph.height - 10 * graph.cellSize,
        20 * graph.cellSize,
        graph.height - 10 * graph.cellSize,
        updateSum
      );

      // Initial sum vector creation
      graph.updateVectorSum(vector1, vector2);
    }
  }, []);

  return (
    <div className="App">
      <div ref={d3Container} />
    </div>
  );
};

export default App;
