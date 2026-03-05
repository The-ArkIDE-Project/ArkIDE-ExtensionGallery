class AdvancedKeyboard {
  constructor(runtime) {
    this.runtime = runtime;

    this.keys           = new Set();
    this.keyTimes       = {};
    this.keyCounts      = {};
    this.lastDown       = "";
    this.lastUp         = "";
    this.keyOrderList   = [];
    this.comboOnceLatch = new Set();

    // FIX: edge trigger state for HAT blocks (combo was NOT active last tick)
    this._prevComboState = {};

    const normalizeKey = (e) => {
      if (e.key === " ") return "space";
      return e.key.toLowerCase();
    };

    window.addEventListener("keydown", e => {
      const k = normalizeKey(e);
      if (!this.keys.has(k)) {
        this.keyTimes[k] = Date.now();
        this.keyCounts[k] = (this.keyCounts[k] || 0) + 1;
        this.lastDown = k;
        this.keyOrderList.push(k);
        if (this.keyOrderList.length > 20) this.keyOrderList.shift();
      }
      this.keys.add(k);
    });

    window.addEventListener("keyup", e => {
      const k = normalizeKey(e);
      this.keys.delete(k);
      // FIX: also clear keyTime on keyup so keyHeld resets properly
      delete this.keyTimes[k];
      this.lastUp = k;
      this.comboOnceLatch.clear();
    });
  }

  getInfo() {
    return {
      id: "advancedkeyboard",
      name: "Advanced Keyboard",
      color1: "#e53935",
      color2: "#b71c1c",
      color3: "#ff8a80",
      blocks: [
        /* -------- BASIC -------- */
        {
          opcode: "isKeyPressed",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "key [KEY] pressed?",
          arguments: { KEY: { type: Scratch.ArgumentType.STRING, menu: "keys", defaultValue: "a" } }
        },

        /* -------- COMBO BOOLEANS -------- */
        ...[2, 3, 4, 5].map(n => ({
          opcode: `combo${n}`,
          blockType: Scratch.BlockType.BOOLEAN,
          text: `combo ${n} ${Array.from({ length: n }, (_, i) => `[K${i + 1}]`).join(" + ")} pressed?`,
          arguments: Object.fromEntries(
            Array.from({ length: n }, (_, i) => [`K${i + 1}`, { type: Scratch.ArgumentType.STRING, menu: "keys", defaultValue: "a" }])
          )
        })),

        /* -------- COMBO EVENTS (HAT with edge trigger) -------- */
        ...[2, 3, 4, 5].map(n => ({
          opcode: `whenCombo${n}`,
          blockType: Scratch.BlockType.HAT,
          text: `when combo ${n} ${Array.from({ length: n }, (_, i) => `[K${i + 1}]`).join(" + ")}`,
          arguments: Object.fromEntries(
            Array.from({ length: n }, (_, i) => [`K${i + 1}`, { type: Scratch.ArgumentType.STRING, menu: "keys" }])
          )
        })),

        /* -------- COMBO ONCE -------- */
        {
          opcode: "comboOnce3",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "combo 3 [K1] + [K2] + [K3] (once)?",
          arguments: {
            K1: { type: Scratch.ArgumentType.STRING, menu: "keys" },
            K2: { type: Scratch.ArgumentType.STRING, menu: "keys" },
            K3: { type: Scratch.ArgumentType.STRING, menu: "keys" }
          }
        },

        /* -------- LONG PRESS -------- */
        {
          opcode: "keyHeld",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "key [KEY] held for more than [SEC] seconds?",
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, menu: "keys", defaultValue: "space" },
            SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
          }
        },

        /* -------- SPECIAL -------- */
        {
          opcode: "onlyKey",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "only key [KEY] pressed?",
          arguments: { KEY: { type: Scratch.ArgumentType.STRING, menu: "keys" } }
        },
        {
          opcode: "noKeys",
          blockType: Scratch.BlockType.BOOLEAN,
          text: "no keys pressed?"
        },

        /* -------- REPORTERS -------- */
        {
          opcode: "keyCount",
          blockType: Scratch.BlockType.REPORTER,
          text: "times key [KEY] pressed",
          arguments: { KEY: { type: Scratch.ArgumentType.STRING, menu: "keys" } }
        },
        {
          opcode: "resetKeyCount",
          blockType: Scratch.BlockType.COMMAND,
          text: "reset key [KEY] counter",
          arguments: { KEY: { type: Scratch.ArgumentType.STRING, menu: "keys" } }
        },
        { opcode: "lastKeyDown", blockType: Scratch.BlockType.REPORTER, text: "last key pressed" },
        { opcode: "lastKeyUp",   blockType: Scratch.BlockType.REPORTER, text: "last key released" },
        { opcode: "keyTotal",    blockType: Scratch.BlockType.REPORTER, text: "number of keys pressed" },
        { opcode: "allKeys",     blockType: Scratch.BlockType.REPORTER, text: "all pressed keys" },
        {
          opcode: "keyOrder",
          blockType: Scratch.BlockType.REPORTER,
          text: "last [N] key presses",
          arguments: { N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 } }
        },
        { opcode: "wasdDirection", blockType: Scratch.BlockType.REPORTER, text: "WASD direction" }
      ],

      menus: {
        keys: {
          acceptReporters: true,
          items: [
            ..."abcdefghijklmnopqrstuvwxyz".split(""),
            ..."0123456789".split(""),
            "space", "enter", "escape", "tab",
            "shift", "control", "alt",
            "backspace", "delete",
            "arrowup", "arrowdown", "arrowleft", "arrowright",
            "f1", "f2", "f3", "f4", "f5", "f6",
            "f7", "f8", "f9", "f10", "f11", "f12"
          ]
        }
      }
    };
  }

  isKeyPressed(a) { return this.keys.has(a.KEY); }

  _combo(args, n) {
    return Array.from({ length: n }, (_, i) => args[`K${i + 1}`])
      .every(k => this.keys.has(k));
  }

  combo2(a) { return this._combo(a, 2); }
  combo3(a) { return this._combo(a, 3); }
  combo4(a) { return this._combo(a, 4); }
  combo5(a) { return this._combo(a, 5); }

  // FIX: HAT blocks now use edge detection (fire once when combo first becomes active)
  _comboEdge(a, n) {
    const id = Array.from({ length: n }, (_, i) => a[`K${i + 1}`]).join("+");
    const active = this._combo(a, n);
    const wasActive = this._prevComboState[id] || false;
    this._prevComboState[id] = active;
    return active && !wasActive; // only true on the rising edge
  }

  whenCombo2(a) { return this._comboEdge(a, 2); }
  whenCombo3(a) { return this._comboEdge(a, 3); }
  whenCombo4(a) { return this._comboEdge(a, 4); }
  whenCombo5(a) { return this._comboEdge(a, 5); }

  comboOnce3(a) {
    const id = `${a.K1}+${a.K2}+${a.K3}`;
    if (this.combo3(a) && !this.comboOnceLatch.has(id)) {
      this.comboOnceLatch.add(id);
      return true;
    }
    return false;
  }

  // FIX: guard against missing keyTime (key was already down before page load)
  keyHeld(a) {
    if (!this.keys.has(a.KEY)) return false;
    if (!this.keyTimes[a.KEY]) return false; // unknown start time
    return (Date.now() - this.keyTimes[a.KEY]) / 1000 >= a.SEC;
  }

  onlyKey(a) { return this.keys.size === 1 && this.keys.has(a.KEY); }
  noKeys()   { return this.keys.size === 0; }

  keyCount(a)      { return this.keyCounts[a.KEY] || 0; }
  resetKeyCount(a) { this.keyCounts[a.KEY] = 0; }

  lastKeyDown()  { return this.lastDown; }
  lastKeyUp()    { return this.lastUp; }
  keyTotal()     { return this.keys.size; }
  allKeys()      { return [...this.keys].join("+"); }
  keyOrder(a)    { return this.keyOrderList.slice(-a.N).join(","); }

  wasdDirection() {
    if (this.keys.has("w")) return "up";
    if (this.keys.has("s")) return "down";
    if (this.keys.has("a")) return "left";
    if (this.keys.has("d")) return "right";
    return "none";
  }
}

Scratch.extensions.register(new AdvancedKeyboard(Scratch.vm.runtime));
