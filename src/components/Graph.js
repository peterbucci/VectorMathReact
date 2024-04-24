import * as d3 from "d3";

class Graph {
  constructor(container, width, height) {
    this.container = container;
    this.width = width;
    this.height = height;
    this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
    this.cellSize = 10;
    this.svg = null;
    this.xScale = d3.scaleLinear().domain([0, 50]).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([0, 30]).range([this.height, 0]);
    this.vectorSum = null; // Hold the sum vector
    this.selectedOperation = "Addition";

    this.init();
  }

  init() {
    this.createSvg();
    this.drawAxes();
    this.drawGridLines();
  }

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

    this.vectorSum.endX = this.vectorSum.startX + sumX;
    this.vectorSum.endY = this.vectorSum.startY + sumY;
    this.vectorSum.update();
  }

  updateVectorSubtraction(vector1, vector2) {
    const v1x = vector1.endX - vector1.startX; // X component of vector1
    const v1y = vector1.endY - vector1.startY; // Y component of vector1
    const v2x = vector2.endX - vector2.startX; // X component of vector2
    const v2y = vector2.endY - vector2.startY; // Y component of vector2

    // Calculate subtraction components
    const subX = v1x - v2x;
    const subY = v1y - v2y;

    this.vectorSum.endX = this.vectorSum.startX + subX;
    this.vectorSum.endY = this.vectorSum.startY + subY;
    this.vectorSum.update();
  }

  setVectorSum(vector) {
    this.vectorSum = vector;
  }
}

export default Graph;
