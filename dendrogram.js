class Node {
  constructor(name) {
    this.name = name;
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }

  // Method to get a child node by its name
  getChild(name) {
    return this.children.find((child) => child.name === name);
  }
}

class objDendrogram {
  constructor() {
    this.root = null;
  }

  dfs(node = this.root, depth = 0) {
    console.log(" ".repeat(depth * 2) + node.name); // Print the node's name with indentation based on depth

    node.children.forEach((childNode) => {
      this.dfs(childNode, depth + 1); // Recursively call dfs on each child
    });
  }

  pathExists(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    for (let part of parts) {
      currentNode = currentNode.getChild(part);

      if (!currentNode) {
        return false; // If a part is not found, return false
      }
    }

    return true; // If all parts are found, return true
  }

  addCpe(cpe) {
    const parts = cpe.split(":");
    let currentNode = this.root;

    parts.forEach((part) => {
      let foundNode = currentNode.children.find((node) => node.name === part);

      if (!foundNode) {
        foundNode = new Node(part);
        currentNode.addChild(foundNode);
      }

      currentNode = foundNode;
    });
  }

  build(cpeList) {
    this.root = new Node("cpe");

    cpeList.forEach((cpe) => {
      this.addCpe(cpe);
    });
  }

  getChildrenOfCpe(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    // Traverse the tree to find the node
    for (let part of parts) {
      if (part !== "") {
        // Skip the empty string before the first '/'
        currentNode = currentNode.getChild(part);

        if (!currentNode) {
          return null; // If the node is not found, return null
        }
      }
    }

    // Return the children of the found node
    return currentNode.children;
  }

  getChildrenOfCpeNames(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    // Traverse the tree to find the node
    for (let part of parts) {
      if (part !== "") {
        // Skip the empty string before the first '/'
        currentNode = currentNode.getChild(part);

        if (!currentNode) {
          return null; // If a part is not found, return null
        }
      }
    }

    // Return the names of the children of the found node
    return currentNode.children.map((child) => child.name);
  }

  // Helper method to recursively get all descendant names
  _getAllDescendantNames(node, names = []) {
    node.children.forEach((child) => {
      names.push(child.name);
      this._getAllDescendantNames(child, names); // Recursively get names of all descendants
    });
    return names;
  }

  // Method to get the names of all descendants of a specific node by path
  getAllDescendantNamesOfCpe(path) {
    const parts = path.split(":");
    let currentNode = this.root;

    // Traverse the tree to find the node
    for (let part of parts) {
      if (part !== "") {
        // Skip the empty string before the first '/'
        currentNode = currentNode.getChild(part);

        if (!currentNode) {
          return null; // If a part is not found, return null
        }
      }
    }

    // Use the helper method to get all descendant names
    return this._getAllDescendantNames(currentNode);
  }
}

module.exports = objDendrogram;
