class Node {
  constructor(
    public value: string,
    public neighbors: Node[] = [],
  ) {}

  static createBlankClone(value: string = "", neighbors: Node[] = []): Node {
    return new Node(value, neighbors);
  }
}

//      A -----> B
//      ↑        |
//      |        |
//      |        ↓
//      D <----- C

const a = new Node("A");
const b = new Node("B");
const c = new Node("C");
const d = new Node("D");

a.neighbors.push(b);
b.neighbors.push(c);
c.neighbors.push(d);
d.neighbors.push(a);

let visitedNodes = new Map<Node, Node>();

function cloneGraph(node: Node): Node {
  let cloned = visitedNodes.get(node);

  if (cloned) {
    return cloned;
  }

  cloned = Node.createBlankClone(node.value);
  visitedNodes.set(node, cloned);

  node.neighbors.forEach((childNode) => {
    cloned.neighbors.push(cloneGraph(childNode));
  });

  return cloned;
}

console.log(cloneGraph(a));
