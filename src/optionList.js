import { defaultIcon } from "./utils/icon";
import uuid from "./utils/uuid";
import "./less/index.less";
export default function renderOptionList(params = {}) {
  const data = params.option.map(item => {
    return {
      ...item,
      id: uuid()
    };
  })
  function dragEnd(event, d) {
    params.add({
      title: d.title,
      x: event.layerX,
      y: event.layerY - 100
    });
  }
  const optionWrap = params.wrap.append("div")
    .attr("class", "svg-option-list");
  const optionLi = optionWrap.selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .attr("draggable", "true")
    .attr("class", "svg-option-list-li")
    .attr("data-id", (d, index) => d.id)
    .on("dragend", dragEnd);
  optionLi.append("div")
    .html(defaultIcon);
  optionLi.append("div")
    .html(d => d.title);
}