import { SortedKeyedBinaryTree } from './tree';

const treeSpec = {
  key: 100,
  value: "Bob",
  left: {
      key: 50,
      value: "Bob",
      left: null,
      right: {
          key: 64,
          value: "Emily",
          left: null,
          right: null,
      },
  },
  right: {
      key: 128,
      value: "Emily",
      left: {
          key: 110,
          value: "Georgia",
          left: null,
          right: null,
      },
      right: {
          key: 130,
          value: "Georgia",
          right: {
              key: 256,
              value: "Emily",
              left: null,
              right: null,
          },
      },
  },
};

const tree = new SortedKeyedBinaryTree(treeSpec);

console.log(tree.root.left.valueOf());

console.log(tree.findValueByKey(100));
console.log(tree.findValueByKey(64));
console.log(tree.findValueByKey(10));

console.log(tree.findKeyByValueDepthFirst("Bob"));
console.log(tree.findKeyByValueDepthFirst("Georgia"));
console.log(tree.findKeyByValueDepthFirst("Emily"));
console.log(tree.findKeyByValueDepthFirst("James"));

console.log(tree.findKeyByValueBreadthFirst("Bob"));
console.log(tree.findKeyByValueBreadthFirst("Georgia"));
console.log(tree.findKeyByValueBreadthFirst("Emily"));
console.log(tree.findKeyByValueBreadthFirst("James"));

console.log(tree.accumulateKeysByValueDepthFirst("Bob"));
console.log(tree.accumulateKeysByValueDepthFirst("Georgia"));
console.log(tree.accumulateKeysByValueDepthFirst("Emily"));
console.log(tree.accumulateKeysByValueDepthFirst("James"));

console.log(tree.accumulateKeysByValueBreadthFirst("Bob"));
console.log(tree.accumulateKeysByValueBreadthFirst("Georgia"));
console.log(tree.accumulateKeysByValueBreadthFirst("Emily"));
console.log(tree.accumulateKeysByValueBreadthFirst("James"));
