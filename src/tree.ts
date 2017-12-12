// I did a bit of thinking and I have a pretty good idea of how I'm going to do this, I'm going to use a heap to store the tree as a heap will have a much better memory footprint and will create far fewer objects that may have to be disposed, it also allows for O(1) access to any node in the tree if you know its location (eg. the path to get to it)
// I will just  build the abstractions up from a base tree class, and make this heap implementaion completely hidden behind an interface that fits the problems description

import Deque from './deque';

// this includes an abstract implementation of breadth first and depth first searching, I can override the breadth first search later to make an optimization (I specifically do for the value breadth first search, and I could for the general case I've defined but I refrain to save time)

function breadthFirstSearchTree<T>(root: Node<T> | null, condition: (i: T) => boolean) {
  const que = new Deque<Node<T> | null>(0);
  que.push(root);
  while(!que.isEmpty()) {
    const node = que.shift();
    if (node) {
      const nodeValue = node.valueOf();
      if (condition(nodeValue)) {
        return nodeValue;
      } else {
        que.push(...node.children);
      }
    }
  }
  return undefined;
}
function depthFirstSearchTree<T>(node: Node<T> | null, condition: (i: T) => boolean): T {
  if (node) {
    const nodeValue = node.valueOf();
    if (condition(nodeValue)) {
      return nodeValue;
    } else {
      for (const child of node.children) {
        const result = depthFirstSearchTree(child, condition);
        if (result) {
          return result;
        }
      }
    }
  }
  return undefined;
}
function accumulateBreadthFirstTree<T>(root: Node<T> | null, condition: (i: T) => boolean) {
  const que = new Deque<Node<T> | null>(0);
  const result: T[] = [];
  que.push(root);
  while(!que.isEmpty()) {
    const node = que.shift();
    if (node) {
      const nodeValue = node.valueOf();
      if (condition(nodeValue)) {
        result.push(nodeValue);
      }
      que.push(...node.children);
    }
  }
  return result;
}
function accumulateDepthFirstTree<T>(node: Node<T> | null, condition: (i: T) => boolean, accumulator: T[] = []): T[] {
  if (node) {
    const nodeValue = node.valueOf();
    if (condition(nodeValue)) {
      accumulator.push(nodeValue);
    }
    for (const child of node.children) {
      accumulateDepthFirstTree(child, condition, accumulator);
    }
  }
  return accumulator;
}
export abstract class Tree<T> {
  abstract get root(): Node<T> | null;

  find(condition: (i: T) => boolean, method = 'breadthFirst') {
    switch (method) {
      case 'breadthFirst': return breadthFirstSearchTree(this.root, condition);
      case 'depthFirst': return depthFirstSearchTree(this.root, condition);
      default: throw new RangeError(`No such find method "${method}" for Tree`);
    }
  }

  findAll(condition: (i: T) => boolean, method = 'breadthFirst') {
    switch (method) {
      case 'breadthFirst': return accumulateBreadthFirstTree(this.root, condition);
      case 'depthFirst': return accumulateDepthFirstTree(this.root, condition);
      default: throw new RangeError(`No such find method "${method}" for Tree`);
    }
  }
}
export abstract class Node<T> {
  abstract get children(): Node<T>[];
  abstract valueOf(): T;
}

function depthFirstSearchBinaryTree<T>(node: BinaryNode<T> | null, condition: (i: T) => boolean): T {
  if (node) {
    const leftResult = depthFirstSearchBinaryTree(node.left, condition);
    if (leftResult) {
      return leftResult;
    }
    const nodeValue = node.valueOf();
    if (condition(nodeValue)) {
      return nodeValue;
    }
    return depthFirstSearchBinaryTree(node.right, condition);
  }
  return undefined;
}
function accumulateDepthFirstBinaryTree<T>(node: BinaryNode<T> | null, condition: (i: T) => boolean, accumulator: T[] = []): T[] {
  if (node) {
    accumulateDepthFirstBinaryTree(node.left, condition, accumulator);
    const nodeValue = node.valueOf();
    if (condition(nodeValue)) {
      accumulator.push(nodeValue);
    }
    accumulateDepthFirstBinaryTree(node.right, condition, accumulator);
  }
  return accumulator;
}
export abstract class BinaryTree<T> extends Tree<T> {
  abstract get root(): BinaryNode<T>;

  find(condition: (i: T) => boolean, method = 'breadthFirst') {
    switch (method) {
      case 'depthFirst': return depthFirstSearchBinaryTree(this.root, condition);
      default: return super.find(condition, method);
    }
  }
  
  findAll(condition: (i: T) => boolean, method = 'breadthFirst') {
    switch (method) {
      case 'depthFirst': return accumulateDepthFirstBinaryTree(this.root, condition);
      default: return super.findAll(condition, method);
    }
  }
}
export abstract class BinaryNode<T> extends Node<T> {
  abstract get left(): BinaryNode<T> | null;
  abstract get right(): BinaryNode<T> | null;
}

interface NodeSpec<K, V> {
  key: K;
  value: V;
  left?: NodeSpec<K, V> | null;
  right?: NodeSpec<K, V> | null;
}

function nodeSpecToKeyValueHeaps<K, V>(nodeSpec: NodeSpec<K, V>, keys: K[] = nodeSpec ? [nodeSpec.key] : [], values: V[] = nodeSpec ? [nodeSpec.value] : [], index = 0): [K[], V[]] {
  if (nodeSpec) {
    if (nodeSpec.left) {
      keys[index * 2 + 1] = nodeSpec.left.key;
      values[index * 2 + 1] = nodeSpec.left.value;
      nodeSpecToKeyValueHeaps(nodeSpec.left, keys, values, index * 2 + 1);
    }
    if (nodeSpec.right) {
      keys[index * 2 + 2] = nodeSpec.right.key;
      values[index * 2 + 2] = nodeSpec.right.value;
      nodeSpecToKeyValueHeaps(nodeSpec.right, keys, values, index * 2 + 2);
    }
  }
  return [keys, values];
}


export class SortedKeyedBinaryTree<K, V> extends BinaryTree<{key: K, value: V}> {
  private keys: K[];
  private values: V[];
  private size = 0;

  get root() {
    return SortedKeyedBinaryNode.getRoot<K, V>(this.accessor, this.hasNode);
  }

  private accessor = (address: number) => {
    if (address < this.keys.length) {
      return this.keys[address] ? {key: this.keys[address], value: this.values[address]} : undefined;
    }
  }

  private hasNode = (address: number) => this.keys[address] !== undefined;

  // // this is one place where I could reimplement the search operation to be faster on the specific implementation
  // find(condition: (i: {key: K, value: V}) => boolean, method = 'breadthFirst') {
  //   switch (method) {
  //     case 'breadthFirst': {
  //       if (this.keys.length > 2 * this.size) { // to avoid worst case O(N^2)
  //         return super.find(condition, method);
  //       } else {
  //         return breadthFirstSearcKeyValueHeap(this.keys, this.values, condition);
  //       }
  //     } 
  //     default: return super.find(condition, method);
  //   }
  // }

  findValueByKey(key: K) {
    let currentNode = this.root;
    while (currentNode) {
      debugger;
      const current = currentNode.valueOf();
      if (current.key === key) {
        return current.value;
      } else if (current.key > key) {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }
    }
    return undefined;
  }

  findKeyByValueDepthFirst(value: V) {
    const result = this.find(item => item.value === value, 'depthFirst');
    return result ? result.key : result;
  }

  findKeyByValueBreadthFirst(value: V) {
    if (this.keys.length > 2 * this.size) { // to prevent worst case O(N^2) performance
      const result = this.find(item => item.value === value, 'breadthFirst');
      return result ? result.key : result;
    } else {
      // I do the optimization here
      const keys = this.keys;
      const values = this.values;
      for(let i = 0; i < keys.length; ++i) {
        const nodeKey = keys[i];
        if(nodeKey !== undefined && value === values[i]) {
          return nodeKey;
        }
      }
      return undefined;
    }
  }

  accumulateKeysByValueDepthFirst(value: V) {
    return this.findAll(item => item.value === value, 'depthFirst').map(item => item.key);
  }

  accumulateKeysByValueBreadthFirst(value: V) {
    if (this.keys.length > 2 * this.size) { // to prevent worst case O(N^2) performance
      return this.findAll(item => item.value === value, 'breadthFirst').map(item => item.key);
    } else {
      const result: K[] = [];
      const keys = this.keys;
      const values = this.values;
      for(let i = 0; i < keys.length; ++i) {
        const nodeKey = keys[i];
        if(nodeKey !== undefined && value === values[i]) {
          result.push(nodeKey);
        }
      }
      return undefined;
    }
  }

  constructor(nodeSpec: NodeSpec<K, V>) {
    super();
    [this.keys, this.values] = nodeSpecToKeyValueHeaps(nodeSpec);
  }
}
export class SortedKeyedBinaryNode<K, V> extends BinaryNode<{key: K, value: V}> {

  static getRoot<K, V>(treeAccessor: (address: number) => {key: K, value: V}, treeMembership: (address: number) => boolean) {
    return new SortedKeyedBinaryNode<K, V>(treeAccessor, treeMembership, 0);
  }

  get left() {
    const leftAddress = this.address * 2 + 1;
    return this.treeMembership(leftAddress) ? new SortedKeyedBinaryNode<K, V>(this.treeAccessor, this.treeMembership, leftAddress) : null;
  }
  get right() {
    const rightAddress = this.address * 2 + 2;
    return this.treeMembership(rightAddress) ? new SortedKeyedBinaryNode<K, V>(this.treeAccessor, this.treeMembership, rightAddress) : null;
  }
  get children() {
    const left = this.left;
    const right = this.right;
    return left ? right ? [left, right] : [left] : right ? [right] : [];
  }
  valueOf() {
    return this.treeAccessor(this.address);
  }

  private constructor(private treeAccessor: (address: number) => {key: K, value: V}, private treeMembership: (address: number) => boolean, private address: number) {
    super();
  }
}
