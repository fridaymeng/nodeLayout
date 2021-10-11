import * as d3 from "d3";
export function init(params = {}) {
  const wrap = d3.select(`#${params.id}`);
  const svgWrap = wrap.append("svg");
  const gWrap = svgWrap.append("g");
  wrap.attr("style", `border: 1px solid #ddd; background: #fff; border-radius: 5px; height: 400px; width: 100%`);
  svgWrap
    .attr("width", "100%")
    .attr("height", "100%");
  const objectWrap = gWrap.selectAll("g")
    .data([4, 8, 15, 16, 23, 42])
    .enter()
    .append("g")
    .attr('transform', (d, index) => `translate(${index * 100 + 30}, 100)`)
  objectWrap.append("circle")
    .attr("fill", "#08c")
    .attr("r", 10);
  objectWrap.append("text")
    .attr("y", 40)
    .attr("fill", "#111")
    .attr("style", "text-anchor: middle;")
    .text((d, index) => index);
}