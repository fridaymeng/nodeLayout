# nodeLayout

<a href="https://zkboxing.com/nodeLayout/" targer="_blank">Demo</a>

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
nodeLayout.init({
  id: "node-wrap",
  onNodeClick: function (d) {
    console.log(d);
  },
  onPathClick: function (d) {
    console.log(d);
  },
  option: [{
    title: "step1",
    id: 0
  }, {
    title: "step2",
    id: 1
  }, {
    title: "step3",
    id: 2
  }, {
    title: "step4",
    id: 3
  }, {
    title: "step5",
    id: 4
  }, {
    title: "step6",
    id: 5
  }, {
    title: "step7",
    id: 6
  }],
  data: [{
    title: "step8",
    id: 0
  }, {
    title: "step9",
    id: 1
  }] 
})
```
### Add
```js
nodeLayout.add({
  title: 'step',
  id: Math.random()
});
```