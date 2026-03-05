(function (Scratch) {
  'use strict';
  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Unsandboxed mode required');
  }

  class GameDevUtils {

    constructor() {
      this.lastTime   = performance.now();
      this.delta      = 0;
      this.fps        = 0;
      this.frameCount = 0;
      this.timers     = {};

      // FIX: update once per animation frame instead of per-block call
      // This prevents multiple update() calls causing wrong delta/fps values
      this._scheduleUpdate();
    }

    _scheduleUpdate() {
      const loop = () => {
        const now = performance.now();
        this.delta = (now - this.lastTime) / 1000;
        if (this.delta > 0) this.fps = 1 / this.delta;
        this.lastTime = now;
        this.frameCount++;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    getInfo() {
      return {
        id: 'gamedevutils',
        name: 'Game Dev Utilities',
        color1: '#1b5e20',
        color2: '#66bb6a',
        color3: '#003300',
        blocks: [
          /* ================= PERFORMANCE ================= */
          { opcode: 'fpsBlock',   blockType: Scratch.BlockType.REPORTER, text: 'fps' },
          { opcode: 'deltaBlock', blockType: Scratch.BlockType.REPORTER, text: 'delta time' },
          { opcode: 'frameBlock', blockType: Scratch.BlockType.REPORTER, text: 'frame count' },

          /* ================= INPUT ================= */
          { opcode: 'keyPressed', blockType: Scratch.BlockType.BOOLEAN,  text: 'key [KEY] pressed?',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'w' } } },
          { opcode: 'mouseX',    blockType: Scratch.BlockType.REPORTER, text: 'mouse x' },
          { opcode: 'mouseY',    blockType: Scratch.BlockType.REPORTER, text: 'mouse y' },
          { opcode: 'mouseDown', blockType: Scratch.BlockType.BOOLEAN,  text: 'mouse down?' },

          /* ================= SCREEN ================= */
          { opcode: 'screenW', blockType: Scratch.BlockType.REPORTER, text: 'screen width' },
          { opcode: 'screenH', blockType: Scratch.BlockType.REPORTER, text: 'screen height' },

          /* ================= CAMERA ================= */
          { opcode: 'cameraFollow', blockType: Scratch.BlockType.REPORTER, text: 'camera follow cam [C] target [T] speed [S]',
            arguments: {
              C: { type: Scratch.ArgumentType.NUMBER },
              T: { type: Scratch.ArgumentType.NUMBER },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.1 }
            }
          },
          { opcode: 'applyCamera', blockType: Scratch.BlockType.REPORTER, text: 'apply camera position [P] camera [C]',
            arguments: {
              P: { type: Scratch.ArgumentType.NUMBER },
              C: { type: Scratch.ArgumentType.NUMBER }
            }
          },

          /* ================= MATH ================= */
          { opcode: 'distance', blockType: Scratch.BlockType.REPORTER, text: 'distance x1 [X1] y1 [Y1] x2 [X2] y2 [Y2]',
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER },
              Y1: { type: Scratch.ArgumentType.NUMBER },
              X2: { type: Scratch.ArgumentType.NUMBER },
              Y2: { type: Scratch.ArgumentType.NUMBER }
            }
          },
          { opcode: 'angle', blockType: Scratch.BlockType.REPORTER, text: 'angle x1 [X1] y1 [Y1] x2 [X2] y2 [Y2]',
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER },
              Y1: { type: Scratch.ArgumentType.NUMBER },
              X2: { type: Scratch.ArgumentType.NUMBER },
              Y2: { type: Scratch.ArgumentType.NUMBER }
            }
          },
          { opcode: 'lerp', blockType: Scratch.BlockType.REPORTER, text: 'lerp from [A] to [B] t [T]',
            arguments: {
              A: { type: Scratch.ArgumentType.NUMBER },
              B: { type: Scratch.ArgumentType.NUMBER },
              T: { type: Scratch.ArgumentType.NUMBER }
            }
          },

          /* ================= COLLISION ================= */
          { opcode: 'rectCollision', blockType: Scratch.BlockType.BOOLEAN,
            text: 'rect collision x1 [X1] y1 [Y1] w1 [W1] h1 [H1] x2 [X2] y2 [Y2] w2 [W2] h2 [H2]',
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER }, Y1: { type: Scratch.ArgumentType.NUMBER },
              W1: { type: Scratch.ArgumentType.NUMBER }, H1: { type: Scratch.ArgumentType.NUMBER },
              X2: { type: Scratch.ArgumentType.NUMBER }, Y2: { type: Scratch.ArgumentType.NUMBER },
              W2: { type: Scratch.ArgumentType.NUMBER }, H2: { type: Scratch.ArgumentType.NUMBER }
            }
          },

          /* ================= GRID / TILE ================= */
          { opcode: 'snapGrid', blockType: Scratch.BlockType.REPORTER, text: 'snap [V] to grid [G]',
            arguments: {
              V: { type: Scratch.ArgumentType.NUMBER },
              G: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 }
            }
          },

          /* ================= TIMERS ================= */
          { opcode: 'startTimer', blockType: Scratch.BlockType.COMMAND,  text: 'start timer [ID]',        arguments: { ID: { type: Scratch.ArgumentType.STRING } } },
          { opcode: 'getTimer',   blockType: Scratch.BlockType.REPORTER, text: 'timer [ID] seconds',      arguments: { ID: { type: Scratch.ArgumentType.STRING } } },
          { opcode: 'resetTimer', blockType: Scratch.BlockType.COMMAND,  text: 'reset timer [ID]',        arguments: { ID: { type: Scratch.ArgumentType.STRING } } },

          /* ================= SCREEN WRAP ================= */
          { opcode: 'wrap', blockType: Scratch.BlockType.REPORTER, text: 'wrap value [V] min [MIN] max [MAX]',
            arguments: {
              V:   { type: Scratch.ArgumentType.NUMBER },
              MIN: { type: Scratch.ArgumentType.NUMBER },
              MAX: { type: Scratch.ArgumentType.NUMBER }
            }
          }
        ]
      };
    }

    // FIX: removed per-block update() calls - now updated via rAF loop
    fpsBlock()   { return Math.round(this.fps); }
    deltaBlock() { return this.delta.toFixed(4); }
    frameBlock() { return this.frameCount; }

    keyPressed(a) { return Scratch.vm.runtime.ioDevices.keyboard.isKeyPressed(a.KEY); }
    mouseX()      { return Scratch.vm.runtime.ioDevices.mouse.getClientX(); }
    mouseY()      { return Scratch.vm.runtime.ioDevices.mouse.getClientY(); }
    mouseDown()   { return Scratch.vm.runtime.ioDevices.mouse.getIsDown(); }

    // FIX: return actual stage dimensions from VM
    screenW() { return Scratch.vm.runtime.stageWidth  || 480; }
    screenH() { return Scratch.vm.runtime.stageHeight || 360; }

    cameraFollow(a) { return a.C + (a.T - a.C) * a.S; }
    applyCamera(a)  { return a.P - a.C; }

    distance(a)      { return Math.hypot(a.X2 - a.X1, a.Y2 - a.Y1); }
    angle(a)         { return Math.atan2(a.Y2 - a.Y1, a.X2 - a.X1) * 180 / Math.PI; }
    lerp(a)          { return a.A + (a.B - a.A) * a.T; }

    rectCollision(a) {
      return (
        a.X1 < a.X2 + a.W2 &&
        a.X1 + a.W1 > a.X2 &&
        a.Y1 < a.Y2 + a.H2 &&
        a.Y1 + a.H1 > a.Y2
      );
    }

    snapGrid(a)   { return Math.round(a.V / a.G) * a.G; }

    startTimer(a) { this.timers[a.ID] = performance.now(); }
    getTimer(a)   { return this.timers[a.ID] ? ((performance.now() - this.timers[a.ID]) / 1000).toFixed(2) : 0; }
    resetTimer(a) { delete this.timers[a.ID]; }

    wrap(a) {
      if (a.V < a.MIN) return a.MAX;
      if (a.V > a.MAX) return a.MIN;
      return a.V;
    }
  }

  Scratch.extensions.register(new GameDevUtils());
})(Scratch);
