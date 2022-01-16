import * as d3 from "d3";
import uuid from "./utils/uuid";
import renderOptionList from "./optionList";
import { deletIcon } from "./utils/icon";
import "./less/index.less";

class NodeLayout {
  constructor (params = {}) {
    this.objectWrap = null;
    this.svgWrap = null;
    this.svgWrapg = null;
    this.gWrap = null;
    this.pathWrap = null;
    // control the animation
    this.isInit = true;
    // circle radius
    this.mainCirceRadius = 25;
    this.smallCirceRadius = 5;
    this.svgWidth = 1000;
    this.svgHeight = 800;
    // the x,y change when zoom
    this.zoomX = 0;
    this.zoomY = 0;
    this.zoomK = 0;
    // onNodeClick 
    this.onNodeClick = null;
    // onPathClick
    this.onPathClick = null;
    // line type
    this.connectType = "line";
    // node type
    this.nodeType = "circle";
    // offset size
    this.leftSize = 0;
    this.topSize = 0;
    this.nodePosition = {}
    this.nodeData = [];
    this.connectData = [];
    const $this = this;
    this.zoom = d3.zoom()
      .scaleExtent([.1, 100])
      .on("zoom", (d) => this.svgZoomed(d));
    // main circle drag
    this.drag = d3
      .drag()
      .on("start", this.dragstart)
      .on("drag", function (event, d) { $this.draging(event, d, $this, this) })
      .on("end", this.dragend);
    this.smallCircleDrag = d3
      .drag()
      .on("start", function (event, d) { $this.smallCircleDragstart(event, d, $this, this) })
      .on("drag", function (event, d) { $this.smallCircleDraging(event, d, $this) })
      .on("end", function (event, d) { $this.smallCircleDragend(event, d, $this, this) });
    this.handleDeleteNode = this.handleDeleteNode.bind(this);
  }
  // on click
  handleClick (event, d) {
    if (this.onNodeClick) this.onNodeClick(d);
    d3.selectAll(".unit-dis").attr("class", "unit-dis");
    d3.selectAll('.connect-fixed-line').attr('data-selected', '')
    d3.select(this).attr("class", "unit-dis selected");
  }
  // on path click
  handlePathClick (event, d) {
    d3.selectAll(".unit-dis").attr("class", "unit-dis");
    d3.selectAll('.connect-fixed-line').attr('data-selected', '')
    d3.select(this).attr("data-selected", true);
    if (this.onPathClick) this.onPathClick(d);
  }
  // drag start
  dragstart (event, d) {
    d.dx = event.sourceEvent.x;
    d.dy = event.sourceEvent.y;
  }
  // draging
  draging (event, d, $this, $that) {
    d.xp = d.x - (d.dx - event.sourceEvent.x);
    d.yp = d.y - (d.dy - event.sourceEvent.y);
    this.connectData.forEach(item => {
      const index = item.source === d.id ? item.startIndex : item.endIndex;
      const xValue = Math.cos(Math.PI / 180 * index * 90) * this.mainCirceRadius;
      const yValue = Math.sin(Math.PI / 180 * index * 90) * this.mainCirceRadius;
      if (item.source === d.id) {
        item.x1 = d.xp + xValue;
        item.y1 = d.yp + yValue;
      } else if (item.target === d.id) {
        item.x2 = d.xp + xValue;
        item.y2 = d.yp + yValue;
      }
    });
    this.renderLines({ data: this.connectData });
    d3.select($that).attr("transform", () => `translate(${d.xp}, ${d.yp})`);
  }
  // drag end
  dragend (event, d) {
    d.x = d.xp || event.sourceEvent.x;
    d.y = d.yp || event.sourceEvent.y;
  }
  renderNodes (params = {}) {
    d3.selectAll(".unit-dis").remove();
    this.objectWrap = this.gWrap.selectAll("g")
      .data(params.data)
      .enter()
      .append("g")
      .attr("id", d => d.id)
      .attr("class", "unit-dis")
      .call(this.drag)
      .on("click", this.handleClick)
      .attr('transform', (d) => this.isInit ? `translate(0, 0)` : `translate(${d.x}, ${d.y})` );
    if (this.isInit) {
      this.objectWrap.transition()
        .duration(750)
        .delay(function(d, i) { return i * 10; })
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }
    this.renderMain();
  }
  // draw connect lines
  renderLines (params = {}) {
    this.pathWrap.selectAll(".connect-fixed-line").remove();
    const allPath = this.pathWrap.selectAll(".connect-fixed-line")
      .data(params.data)
      .enter()
      .append("path")
      .attr("class", (d) => `start-${d.source} end-${d.target} connect-fixed-line`)
      .attr("marker-end","url(#arrowEnd)")
      .attr("d", (d) => this.isInit ? `M0,0 0,0` : `M${d.x1},${d.y1} ${d.x2},${d.y2}`)
      .attr("data-id", d => d.id)
      .on("click", this.handlePathClick);
    if (this.isInit) {
      allPath.transition()
        .duration(750)
        .delay(function(d, i) { return i * 10; })
        .attr("d", (d) => `M${d.x1},${d.y1} ${d.x2},${d.y2}`);
    }
    this.isInit = false;
  }
  handleDeleteNode(event, d) {
    this.nodeData = this.nodeData.filter (item => d.id !== item.id);
    this.renderNodes({ data: this.nodeData });
    this.connectData = this.connectData.filter (item => {
      return item.source !== d.id && item.target !== d.id;
    });
    this.renderLines({ data: this.connectData });
  }
  smallCircleDragstart (event, d, $this, $that) {
    d3.selectAll(".unit-dis").attr("data-ready", "true");
    d3.select($that.parentNode).attr("data-ready", "");
    d.dx = event.sourceEvent.layerX - Math.cos(Math.PI / 180 * d.index * 90) * $this.smallCirceRadius;
    d.dy = event.sourceEvent.layerY - Math.sin(Math.PI / 180 * d.index * 90) * $this.smallCirceRadius;
  }
  smallCircleDraging (event, d, $this) {
    const k = $this.zoomK === 0 ? 1 : $this.zoomK;
    d.x1 = (d.dx - $this.zoomX)/k;
    d.y1 = (d.dy - $this.zoomY)/k;
    d.x2 = (event.sourceEvent.layerX - $this.zoomX)/k;
    d.y2 = (event.sourceEvent.layerY - $this.zoomY)/k;
    let pos = `M${d.x1},${d.y1} ${d.x2},${d.y2}`;
    if ($this.connectType === "path") {
      switch (d.index) {
        case 0:
          pos = `M${d.x1},${d.y1} C${(d.x1 + d.x2)/2},${d.y1} ${(d.x2 + d.x1)/2},${d.y2}  ${d.x2},${d.y2}`;
        break;
        case 1:
          pos = `M${d.x1},${d.y1} C${d.x1},${d.y2} ${d.x2},${d.y1}  ${d.x2},${d.y2}`;
        break;
        case 2:
          pos = `M${d.x1},${d.y1} C${(d.x2 + d.x1)/2},${d.y1} ${(d.x1 + d.x2)/2},${d.y2}  ${d.x2},${d.y2}`;
        break;
        case 3:
          pos = `M${d.x1},${d.y1} C${d.x1},${d.y2} ${d.x2},${d.y1}  ${d.x2},${d.y2}`;
        break;
        default:
          pos = `M${d.x1},${d.y1} ${d.x2},${d.y2}`;
      }
    }
    d3.select(".connect-line")
      .attr("class", "connect-line show")
      .attr("d", pos);
  }
  smallCircleDragend (event, d, $this, $that) {
    d3.selectAll(".unit-dis").attr("data-ready", "");
    d3.select(".connect-line").attr("class", "connect-line");
    const hasAcitve = document.querySelector(".small-circle.active");
    if (hasAcitve) {
      $this.connectData.push({
        source: $that.parentNode.getAttribute("id"),
        target: hasAcitve.parentNode.getAttribute("id"),
        startIndex: d.index,
        endIndex: Number(hasAcitve.dataset.index),
        x1: d.x1,
        y1: d.y1,
        x2: d.x2,
        y2: d.y2
      });
      $this.renderLines({ data: $this.connectData });
    }
  }
  renderMain () {
    // delete button
    this.objectWrap.append("g")
      .attr("class", "delete-circle")
      .attr("title", "delete")
      .attr("transform", `translate(${this.mainCirceRadius}, ${-this.mainCirceRadius - 5})`)
      .on("click", this.handleDeleteNode)
      .html(deletIcon);
    // main circle
    if (this.nodeType === "rect") {
      this.objectWrap.append("rect")
        .attr("fill", "#fff")
        .attr("class", "main-circle")
        .attr("stroke", "#227AE6")
        .attr("x", -this.mainCirceRadius)
        .attr("y", -this.mainCirceRadius)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", this.mainCirceRadius * 2)
        .attr("width", this.mainCirceRadius * 2);
    } else {
      this.objectWrap.append("circle")
        .attr("fill", "#fff")
        .attr("class", "main-circle")
        .attr("stroke", "#227AE6")
        .attr("r", this.mainCirceRadius);
    }
    // small circle
    const smallCircelData = [{
      x : this.mainCirceRadius,
      y : 0,
      index: 0
    },{
      x : 0,
      y : this.mainCirceRadius,
      index: 1
    },{
      x : -this.mainCirceRadius,
      y : 0,
      index: 2
    },{
      x : 0,
      y : -this.mainCirceRadius,
      index: 3
    }];
    this.objectWrap.selectAll(".small-circle")
      .data(smallCircelData)
      .enter()
      .append("circle")
      .attr("class","small-circle")
      .attr("data-index", (d) => d.index)
      .attr("cx",d => d.x)
      .attr("cy",d => d.y)
      .attr("r", this.smallCirceRadius)
      .on("mouseenter",function(d){
        this.setAttribute("class","small-circle active");
      })
      .on("mouseleave",function(d){
        this.setAttribute("class","small-circle");
      })
      .call(this.smallCircleDrag);
    // icon
    this.objectWrap.append("g")
      .attr("transform", "translate(-15, -15)")
      .html((d) => {
        return d.icon ? d.icon : ''
      });
    this.objectWrap.append("text")
      .attr("y", (d) => {
        return d.icon ? 45 : 8
      })
      .attr("fill", "#111")
      .attr("style", "text-anchor: middle;")
      .text((d) => d.text);
  }
  svgZoomed(d) {
    this.zoomX = d.transform.x;
    this.zoomY = d.transform.y;
    this.zoomK = d.transform.k;
    this.svgWrapg.attr("transform", d.transform);
  }
  init(params = {}) {
    const wrap = d3.select(`#${params.id}`).attr("height", this.svgHeight).html("");
    const queryWrap = document.querySelector(`#${params.id}`)
    this.leftSize = queryWrap.offsetLeft
    this.topSize = queryWrap.offsetTop
    this.connectType = params.connectType || "line"
    this.nodeType = params.nodeType || "circle"
    renderOptionList({
      wrap,
      add: (params = {}) => this.add(params),
      option: params.list
    });
    const wraps = wrap.append("div");
    this.svgWrap = wraps.append("svg").call(this.zoom);
    // fill pattern
    this.svgWrap.append("rect")
      .attr("width", "100%")
      .attr("height", this.svgHeight)
      .attr("fill", "url(#diagramPattern)")
      .on("click", (event) => {
        d3.selectAll(".unit-dis").attr("class", "unit-dis");
      });
    this.svgWrapg = this.svgWrap.append("g");
    this.pathWrap = this.svgWrapg.append("g");
    this.gWrap = this.svgWrapg.append("g");
    wrap.attr("class", "nodelayout-wrap");
    this.svgWrap
      .attr("width", "100%")
      .attr("height", this.svgHeight);
    // connect line
    this.gWrap.append("path")
      .attr("class", "connect-line")
      .attr("marker-end","url(#arrowEnd)");
    if (!params.nodes) params.nodes = [];
    if (params.onNodeClick) this.onNodeClick = params.onNodeClick;
    if (params.onPathClick) this.onPathClick = params.onPathClick;
    this.nodeData = params.nodes.map((item, index) => {
      let x = item.x || 100 * index + 200
      let y = item.y || this.svgHeight/5
      this.nodePosition[item.id] = {
        x,
        y
      }
      return {
        ...item,
        id: item.id,
        text: item.title,
        x,
        y
      };
    });
    this.renderNodes({ data: this.nodeData });
    // node connect line
    if (params.lines) {
      this.connectData = []
      params.lines.forEach((item, index) => {
        const startIndex = item.startIndex
        const endIndex = item.endIndex
        this.connectData.push({
          id: uuid(),
          source: item.source,
          target: item.target,
          startIndex,
          endIndex,
          x1: this.nodePosition[item.source].x + Math.cos(Math.PI / 180 * startIndex * 90) * this.mainCirceRadius,
          y1: this.nodePosition[item.source].y + Math.sin(Math.PI / 180 * startIndex * 90) * this.mainCirceRadius,
          x2: this.nodePosition[item.target].x + Math.cos(Math.PI / 180 * endIndex * 90) * this.mainCirceRadius,
          y2: this.nodePosition[item.target].y + Math.sin(Math.PI / 180 * endIndex * 90) * this.mainCirceRadius
        });
      });
      this.renderLines({ data: this.connectData });
    }
    // arrow  
    let markerWrap = this.svgWrap.append("defs");  
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
    /* 网格 */
    const gridArr = new Array(20);
    const patternWrap = markerWrap
      .append("pattern")
      .attr("id", "diagramPattern")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 100)
      .attr("height", 100)
      .attr("patternUnits", "userSpaceOnUse");
    patternWrap
      .selectAll("path")
      .data(gridArr)
      .enter()
      .append("path")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", "0.25")
      .attr("dashArray", "")
      .attr("d", (d, index) => {
        if (index === 0) {
        return `M0,0.5 L100,0.5 Z`;
        } else if (index < 10 && index > 0) {
        return `M0,${index * 10}.125 L100,${index * 10}.125 Z`;
        } else if (index === 10) {
        return `M0.5,0 L0.5,100 Z`;
        } else if (index > 10) {
        return `M${(index - 10) * 10}.125,0 L${(index - 10) * 10}.125,100 Z`;
          }
      });
  }
  add (params = {}) {
    const x = params.x || Math.random() * 1000;
    const y = params.y || Math.random() * 600 + 200;
    const k = this.zoomK === 0 ? 1 : this.zoomK;
    this.nodeData.push({
      id: uuid(),
      text: params.title || params + (this.nodeData.length + 1),
      x: (x - this.zoomX) / k - this.leftSize,
      y: (y - this.zoomY) / k - this.topSize
    });
    this.renderNodes({ data: this.nodeData });
  }
  zoomIn () {
    this.svgWrap.transition().call(this.zoom.scaleBy, 1.5)
  }
  zoomOut () {
    this.svgWrap.transition().call(this.zoom.scaleBy, 0.5)
  }
  reset () {
    this.svgWrap.transition().duration(750).call(
      this.zoom.transform,
      d3.zoomIdentity
    )
  }
}
function init () {
  return new NodeLayout;
}

export {
  NodeLayout
}