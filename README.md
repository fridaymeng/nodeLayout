# nodeLayout

<a href="https://zkboxing.com/nodeLayout/" target="_blank">Demo</a>

## For Graph Layout or Edit.

### How to use

```bash
yarn add nodelayout
```
OR
```bash
npm install nodelayout
```

### Demo
```bash
yarn start
```

### Init
```js
import * as nodelayout from "nodelayout";
nodelayout.init({
      id: "node-wrap",
      connectType: "line", // path or line
      nodeType: "rect", // rect or circle
      onNodeClick: function (d) {
        console.log(d);
      },
      onPathClick: function (d) {
        console.log(d);
      },
      list: [{
        title: "step1",
        id: "0"
      }, {
        title: "step2",
        id: "1"
      }, {
        title: "step3",
        id: "2"
      }, {
        title: "step4",
        id: "3"
      }, {
        title: "step5",
        id: "4"
      }, {
        title: "step6",
        id: "5"
      }, {
        title: "step7",
        id: "6"
      }],
      nodes: [{
        title: "step8",
        id: "0",
        x: 100,
        y: 200
      }, {
        title: "step9",
        id: "1"
      }],
      lines: [{
        source: "0",
        target: "1",
        startIndex: 0, //0, 1, 2, 3
        endIndex: 3
      }]
    })
```
### Add
```js
nodelayout.add({
  title: 'step',
  id: Math.random() + ''
});
```