import * as d3 from "d3";
import uuid from "./utils/uuid";
import deepProxy from "./utils/deepProxy";
import icon from "./utils/icon";
import "./less/index.less";

let objectWrap, gWrap, pathWrap;
let nodeData = [];
// circle radius
const mainCirceRadius = 25;
const smallCirceRadius = 5;

const connectData = deepProxy([], (data) => {
  renderLines(data);
});

// main circle drag
const drag = d3
  .drag()
  .on("start", dragstart)
  .on("drag", draging)
  .on("end", dragend);

function renderNodes () {
  d3.selectAll(".unit-dis").remove();
  objectWrap = gWrap.selectAll("g")
    .data(nodeData)
    .enter()
    .append("g")
    .attr("id", d => d.id)
    .attr("class", "unit-dis")
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    .call(drag)
    .on("click", handleClick);
  renderMain();
}

// on click
function handleClick (event, d) {
  d3.selectAll(".unit-dis").attr("class", "unit-dis");
  d3.select(this).attr("class", "unit-dis selected");
}

// drag start
function dragstart (event, d) {
  // d3.select(this).classed("fixed", false);
  d.dx = event.sourceEvent.x;
  d.dy = event.sourceEvent.y;
}
// draging
function draging (event, d) {
  const $this = this;
  d.xp = d.x - (d.dx - event.sourceEvent.x);
  d.yp = d.y - (d.dy - event.sourceEvent.y);
  connectData.forEach(item => {
    const index = item.source === d.id ? item.startIndex : item.endIndex;
    let xValue = Math.cos(Math.PI / 180 * index * 90) * mainCirceRadius;
    let yValue = Math.sin(Math.PI / 180 * index * 90) * mainCirceRadius;
    if (item.source === d.id) {
      item.x1 = d.xp + xValue;
      item.y1 = d.yp + yValue;
    } else if (item.target === d.id) {
      item.x2 = d.xp + xValue;
      item.y2 = d.yp + yValue;
    }
  });
  renderLines(connectData);
  d3.select($this).attr("transform", () => `translate(${d.xp}, ${d.yp})`);
}
// drag end
function dragend (event, d) {
  d.x = d.xp || event.sourceEvent.x;
  d.y = d.yp || event.sourceEvent.y;
}

// draw connect lines
function renderLines (data) {
  pathWrap.selectAll(".connect-fixed-line").remove();
  pathWrap.selectAll(".connect-fixed-line")
    .data(data)
    .enter()
    .append("path")
    .attr("class", (d) => `start-${d.source} end-${d.target} connect-fixed-line`)
    .attr("marker-end","url(#arrowEnd)")
    .attr("d", (d) => `M${d.x1},${d.y1} ${d.x2},${d.y2}`);
}

function renderMain () {
  // small circle drag
  const smallCircleDrag = d3
    .drag()
    .on("start", smallCircleDragstart)
    .on("drag", smallCircleDraging)
    .on("end", smallCircleDragend);
  // handle small circle
  function smallCircleDragstart (event, d) {
    d.dx = event.sourceEvent.x;
    d.dy = event.sourceEvent.y;
  }
  function smallCircleDraging (event, d) {
    d.x1 = d.dx - smallCirceRadius * 2;
    d.y1 = d.dy - smallCirceRadius * 2;
    d.x2 = event.sourceEvent.x - smallCirceRadius * 2;
    d.y2 = event.sourceEvent.y - smallCirceRadius * 2;
    d3.select(".connect-line")
      .attr("class", "connect-line show")
      .attr("d", `M${d.x1},${d.y1} ${d.x2},${d.y2}`);
  }
  function smallCircleDragend (event, d) {
    d3.select(".connect-line").attr("class", "connect-line");
    const hasAcitve = document.querySelector(".small-circle.active");
    if (hasAcitve) {
      connectData.push({
        source: this.parentNode.getAttribute("id"),
        target: hasAcitve.parentNode.getAttribute("id"),
        startIndex: d.index,
        endIndex: Number(hasAcitve.dataset.index),
        x1: d.x1,
        y1: d.y1,
        x2: d.x2,
        y2: d.y2
      });
    }
  }
  // main circle
  objectWrap.append("circle")
    .attr("fill", "#fff")
    .attr("class", "main-circle")
    .attr("stroke", "#227AE6")
    .attr("r", mainCirceRadius);
  // small circle
  const smallCircelData = [{
    x : mainCirceRadius,
    y : 0,
    index: 0
  },{
    x : 0,
    y : mainCirceRadius,
    index: 1
  },{
    x : -mainCirceRadius,
    y : 0,
    index: 2
  },{
    x : 0,
    y : -mainCirceRadius,
    index: 3
  }];
  objectWrap.selectAll(".small-circle")
    .data(smallCircelData)
    .enter()
    .append("circle")
    .attr("class","small-circle")
    .attr("data-index", (d) => d.index)
    .attr("cx",d => d.x)
    .attr("cy",d => d.y)
    .attr("r", smallCirceRadius)
    .on("mouseenter",function(d){
      this.setAttribute("class","small-circle active");
    })
    .on("mouseleave",function(d){
      this.setAttribute("class","small-circle");
    })
    .call(smallCircleDrag);
  // icon
  objectWrap.append("g")
    .attr("transform", "translate(-15, -15)")
    .html(icon);
  objectWrap.append("text")
    .attr("y", 45)
    .attr("fill", "#111")
    .attr("style", "text-anchor: middle;")
    .text((d) => d.text);
}

function init(params = {}) {
  const wrap = d3.select(`#${params.id}`);
  const svgWrap = wrap.append("svg");
  pathWrap = svgWrap.append("g");
  gWrap = svgWrap.append("g");
  wrap.attr("class", "nodelayout-wrap");
  svgWrap
    .attr("width", "100%")
    .attr("height", "100%");
  if (!params.data) params.data = []
  nodeData = params.data.map(item => {
    return {
      id: uuid(16, 62),
      text: item,
      x: Math.random() * 1000,
      y: Math.random() * 300
    }
  });
  renderNodes();
  // arrow  
  let markerWrap = svgWrap.append("defs");  
  markerWrap.append("marker")  
    .attr("id","arrowEnd")  
    .attr("markerUnits","strokeWidth")  
    .attr("markerWidth","12")  
    .attr("markerHeight","12")  
    .attr("viewBox","0 0 12 12")   
    .attr("refX","10")  
    .attr("refY","6")  
    .attr("orient","auto")
    .append("path")
    .attr("d","M2,2 L10,6 L2,10 L6,6 L2,2")  
    .attr("class","pathArrow");
  markerWrap.append("marker")  
    .attr("id","arrowStart")  
    .attr("markerUnits","strokeWidth")  
    .attr("markerWidth","12")  
    .attr("markerHeight","12")  
    .attr("viewBox","0 0 12 12")   
    .attr("refX","0")  
    .attr("refY","6")  
    .attr("orient","auto")
    .append("path")
    .attr("d","M10,2 L2,6 L10,10 L6,6 L10,2")
    .attr("class","pathArrow");
  
  // connect line
  pathWrap.append("path")
    .attr("class", "connect-line")
    .attr("marker-end","url(#arrowEnd)");
}

function add (params = {}) {
  nodeData.push({
    id: uuid(16, 62),
    text: params,
    x: Math.random() * 1000,
    y: Math.random() * 300
  });
  renderNodes();
}
export { init, add };