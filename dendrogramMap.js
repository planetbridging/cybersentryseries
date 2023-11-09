class Node {
  constructor(name) {
    this.name = name;
    this.children = new Map(); // Changed from array to Map
  }

  addChild(node) {
    this.children.set(node.name, node); // Use the node's name as the key in the Map
  }

  getChild(name) {
    return this.children.get(name); // Retrieve a child node in constant time
  }

  getChildNames() {
    return Array.from(this.children.keys()); // Retrieve child names as an array
  }
}

class objDendrogram {
  constructor() {
    this.root = new Node("cpe"); // Root node named 'cpe'
  }

  dfs(node = this.root, depth = 0) {
    console.log(" ".repeat(depth * 2) + node.name); // Print the node's name with indentation based on depth

    for (let childNode of node.children.values()) {
      this.dfs(childNode, depth + 1); // Recursively call dfs on each child
    }
  }

  pathExists(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    for (let part of parts) {
      if (part !== "") {
        currentNode = currentNode.getChild(part);
        if (!currentNode) {
          return false; // If a part is not found, return false
        }
      }
    }
    return true; // If all parts are found, return true
  }

  addCpe(cpe) {
    const parts = cpe.split(":");
    let currentNode = this.root;

    for (let part of parts) {
      if (part !== "") {
        let foundNode = currentNode.getChild(part);
        if (!foundNode) {
          foundNode = new Node(part);
          currentNode.addChild(foundNode);
        }
        currentNode = foundNode;
      }
    }
  }

  build(cpeList) {
    this.root = new Node("cpe"); // Reset or initialize the root node

    for (let cpe of cpeList) {
      this.addCpe(cpe);
    }
  }

  getChildrenOfCpe(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    for (let part of parts) {
      if (part !== "") {
        currentNode = currentNode.getChild(part);
        if (!currentNode) {
          return null; // If the node is not found, return null
        }
      }
    }
    return Array.from(currentNode.children.values());
  }

  getChildrenOfCpeNames(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    for (let part of parts) {
      if (part !== "") {
        currentNode = currentNode.getChild(part);
        if (!currentNode) {
          return null; // If the node is not found, return null
        }
      }
    }
    return currentNode.getChildNames();
  }

  _getAllDescendantNames(node, names = []) {
    for (let child of node.children.values()) {
      names.push(child.name);
      this._getAllDescendantNames(child, names); // Recursively get names of all descendants
    }
    return names;
  }

  getAllDescendantNamesOfCpe(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    for (let part of parts) {
      if (part !== "") {
        currentNode = currentNode.getChild(part);
        if (!currentNode) {
          return null; // If the node is not found, return null
        }
      }
    }
    return this._getAllDescendantNames(currentNode);
  }
}

module.exports = objDendrogram;
