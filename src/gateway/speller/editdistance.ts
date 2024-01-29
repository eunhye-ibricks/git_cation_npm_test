type Node = {
  children: { [key: string]: Node };
  value?: any;
  letter?: string;
};

export class EditDistance {
  root: Node;

  constructor() {
    this.root = {
      children: {},
    };
  }

  insert(word: string, value: any): void {
    this._insertNode(this.root, word, value);
  }

  lookup(word: string, maxcost: number): any[] {
    // lookup edit-distance
    const results: any[] = [];

    let crow: number[] = [];
    for (let i = 0; i < word.length + 1; i++) {
      crow.push(i);
    }

    // search root trie
    const nodes: Node[] = [];
    for (const letter in this.root.children) {
      const child = this.root.children[letter];
      child.letter = letter;
      nodes.push(child);
    }

    const stacks = [{ row: crow, nodes: nodes }];

    while (true) {
      const stack = stacks.shift();
      if (stack === undefined) {
        break;
      }

      for (let i = 0; i < stack.nodes.length; i++) {
        const node = stack.nodes[i];

        const columns = word.length + 1;
        crow = [stack.row[0] + 1];

        for (let j = 1; j < columns; j++) {
          const icost = crow[j - 1] + 1;
          const dcost = stack.row[j] + 1;

          let rcost = 0;
          if (word.charAt(j - 1) !== node.letter?.charAt(0)) {
            rcost = stack.row[j - 1] + 1;
          } else {
            rcost = stack.row[j - 1];
          }

          crow.push(Math.min(icost, dcost, rcost));
        }

        const cost = crow[crow.length - 1];
        if (cost <= maxcost && node.value !== undefined) {
          results.push({
            cost: cost,
            value: node.value,
          });
        }

        if (Math.min(...crow) <= maxcost) {
          const nodes: Node[] = [];
          for (const letter in node.children) {
            const child = node.children[letter];
            child.letter = letter;
            nodes.push(child);
          }
          stacks.push({
            row: crow,
            nodes: nodes,
          });
        }
      }
    }

    return results;
  }

  private _insertNode(node: Node, word: string, value: any): void {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (node.children[letter] === undefined) {
        node.children[letter] = {
          children: {},
        };
      }

      node = node.children[letter];
    }

    node.value = value;
  }
}
