(function(Scratch) {
  'use strict';

  class NumberJSONArrayTools {
    getInfo() {
      return {
        id: 'numberjsonarraytools',
        name: 'Number JSON Array Tools',
        color1: '#E63946',
        color2: '#D62828',
        color3: '#C1121F',
        blocks: [
          {
            opcode: 'lowestNumber',
            blockType: Scratch.BlockType.REPORTER,
            text: 'lowest number in [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'highestNumber',
            blockType: Scratch.BlockType.REPORTER,
            text: 'highest number in [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'averageNumber',
            blockType: Scratch.BlockType.REPORTER,
            text: 'average number in [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'sumNumbers',
            blockType: Scratch.BlockType.REPORTER,
            text: 'sum of numbers in [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'medianNumber',
            blockType: Scratch.BlockType.REPORTER,
            text: 'median number in [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'arrayLength',
            blockType: Scratch.BlockType.REPORTER,
            text: 'length of [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'rangeNumber',
            blockType: Scratch.BlockType.REPORTER,
            text: 'range of numbers in [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          {
            opcode: 'sortArray',
            blockType: Scratch.BlockType.REPORTER,
            text: 'sort [ARRAY] [ORDER]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[3,1,4,1,5]'
              },
              ORDER: {
                type: Scratch.ArgumentType.STRING,
                menu: 'sortOrder'
              }
            }
          },
          {
            opcode: 'reverseArray',
            blockType: Scratch.BlockType.REPORTER,
            text: 'reverse [ARRAY]',
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '[1,2,3,4,5]'
              }
            }
          },
          '---',
          {
            blockType: Scratch.BlockType.LABEL,
            text: 'Other Random Stuff'
          },
          {
            opcode: 'removeCharacters',
            blockType: Scratch.BlockType.REPORTER,
            text: 'remove [CHARS] from [TEXT]',
            arguments: {
              CHARS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'aeiou'
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello World'
              }
            }
          }
        ],
        menus: {
          sortOrder: {
            acceptReporters: true,
            items: ['ascending', 'descending']
          }
        }
      };
    }

    parseArray(arrayString) {
      try {
        const parsed = JSON.parse(arrayString);
        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter(n => !isNaN(n));
        }
        return [];
      } catch (e) {
        return [];
      }
    }

    lowestNumber(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '';
      return Math.min(...arr);
    }

    highestNumber(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '';
      return Math.max(...arr);
    }

    averageNumber(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '';
      const sum = arr.reduce((a, b) => a + b, 0);
      return sum / arr.length;
    }

    sumNumbers(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '';
      return arr.reduce((a, b) => a + b, 0);
    }

    medianNumber(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '';
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
      }
      return sorted[mid];
    }

    arrayLength(args) {
      const arr = this.parseArray(args.ARRAY);
      return arr.length;
    }

    rangeNumber(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '';
      return Math.max(...arr) - Math.min(...arr);
    }

    sortArray(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '[]';
      const sorted = [...arr].sort((a, b) => {
        return args.ORDER === 'ascending' ? a - b : b - a;
      });
      return JSON.stringify(sorted);
    }

    reverseArray(args) {
      const arr = this.parseArray(args.ARRAY);
      if (arr.length === 0) return '[]';
      return JSON.stringify(arr.reverse());
    }

    removeCharacters(args) {
      let text = String(args.TEXT);
      const charsInput = String(args.CHARS);
      let charsToRemove = [];
      
      // Check if input is a JSON array
      if (charsInput.trim().startsWith('[') && charsInput.trim().endsWith(']')) {
        try {
          const parsed = JSON.parse(charsInput);
          if (Array.isArray(parsed)) {
            charsToRemove = parsed.map(String);
          } else {
            charsToRemove = charsInput.split('');
          }
        } catch (e) {
          charsToRemove = charsInput.split('');
        }
      }
      // Check if input has commas (comma-separated list)
      else if (charsInput.includes(',')) {
        charsToRemove = charsInput.split(',').map(s => s.trim());
      }
      // Otherwise treat as individual characters
      else {
        charsToRemove = charsInput.split('');
      }
      
      // Remove each character/string from the text
      for (let i = 0; i < charsToRemove.length; i++) {
        const char = charsToRemove[i];
        text = text.split(char).join('');
      }
      
      return text;
    }
  }

  Scratch.extensions.register(new NumberJSONArrayTools());
})(Scratch);