(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  const consoleIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNGM5N2ZmIiByeD0iNCIvPjx0ZXh0IHg9IjUiIHk9IjI4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+Jmd0OzwvdGV4dD48L3N2Zz4=';

  class CustomConsole {
    constructor() {
      this.logs = [];
      this.consoleWindow = null;
      this.maxLogs = 1000;
      this.paused = false;
      this.filter = 'all';
      this.registeredCommands = {};
      this.commandInput = null;
      this._messageHandler = null;
      this._lastCommand = '';
      this._lastCommandArg = '';
      this._lastCommandParams = {};
    }

    getInfo() {
      return {
        id: 'customconsole',
        name: 'Custom Console',
        color1: '#4c97ff',
        color2: '#3373cc',
        color3: '#2e5fa3',
        menuIconURI: consoleIcon,
        blockIconURI: consoleIcon,
        blocks: [
          {
            opcode: 'openConsole',
            blockType: Scratch.BlockType.COMMAND,
            text: '🖥️ open console window'
          },
          '---',
          {
            opcode: 'log',
            blockType: Scratch.BlockType.COMMAND,
            text: 'log [TEXT]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, Console!'
              }
            }
          },
          {
            opcode: 'logWithColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'log [TEXT] with color [COLOR]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Colored message'
              },
              COLOR: {
                type: Scratch.ArgumentType.COLOR,
                defaultValue: '#00ff00'
              }
            }
          },
          {
            opcode: 'logWithType',
            blockType: Scratch.BlockType.COMMAND,
            text: '[TYPE] [TEXT]',
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'logTypes'
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Message'
              }
            }
          },
          '---',
          {
            opcode: 'clear',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear console'
          },
          {
            opcode: 'deleteLastLog',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete last log'
          },
          {
            opcode: 'deleteLogAtIndex',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete log # [INDEX]',
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
          '---',
          {
            opcode: 'getLogCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'log count'
          },
          {
            opcode: 'getLogAtIndex',
            blockType: Scratch.BlockType.REPORTER,
            text: 'log # [INDEX]',
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
          {
            opcode: 'exportLogs',
            blockType: Scratch.BlockType.REPORTER,
            text: 'export logs as text'
          },
          '---',
          {
            opcode: 'pauseLogging',
            blockType: Scratch.BlockType.COMMAND,
            text: 'pause logging'
          },
          {
            opcode: 'resumeLogging',
            blockType: Scratch.BlockType.COMMAND,
            text: 'resume logging'
          },
          {
            opcode: 'setMaxLogs',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set max logs to [MAX]',
            arguments: {
              MAX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1000
              }
            }
          },
          '---',
          {
            opcode: 'onUserCommand',
            blockType: Scratch.BlockType.HAT,
            text: 'when user runs command [CMD]',
            arguments: {
              CMD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello'
              }
            },
            isEdgeActivated: false
          },
          {
            opcode: 'registerCommand',
            blockType: Scratch.BlockType.COMMAND,
            text: 'register command [CMD] with description [DESC] and params [PARAMS]',
            arguments: {
              CMD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'translate'
              },
              DESC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Translates text'
              },
              PARAMS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'text language'
              }
            }
          },
          {
            opcode: 'unregisterCommand',
            blockType: Scratch.BlockType.COMMAND,
            text: 'unregister command [CMD]',
            arguments: {
              CMD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello'
              }
            }
          },
          {
            opcode: 'getParam',
            blockType: Scratch.BlockType.REPORTER,
            text: 'param [NAME] from last command',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'text'
              }
            }
          },
          {
            opcode: 'getCommandArg',
            blockType: Scratch.BlockType.REPORTER,
            text: 'command argument (raw)'
          },
          {
            opcode: 'getLastCommand',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last run command'
          }
        ],
        menus: {
          logTypes: {
            acceptReporters: true,
            items: ['log', 'info', 'warn', 'error', 'success', 'debug']
          }
        }
      };
    }

    openConsole() {
      if (this.consoleWindow && !this.consoleWindow.closed) {
        this.consoleWindow.focus();
        return;
      }

      this.consoleWindow = window.open('', 'ScratchConsole', 'width=700,height=500');

      this.consoleWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ArkIDE Console</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
              background: #1e1e1e;
              color: #fff;
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .header {
              background: #4c97ff;
              padding: 12px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .controls { display: flex; gap: 8px; }
            button {
              background: #fff;
              color: #4c97ff;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              font-weight: bold;
              transition: all 0.2s;
            }
            button:hover { background: #e6f2ff; transform: translateY(-1px); }
            button:active { transform: translateY(0); }
            .filter-bar {
              background: #2d2d2d;
              padding: 8px 16px;
              display: flex;
              gap: 8px;
              border-bottom: 1px solid #3d3d3d;
            }
            .filter-btn { background: #3d3d3d; color: #fff; padding: 4px 10px; font-size: 11px; }
            .filter-btn.active { background: #4c97ff; }
            .console-content {
              flex: 1;
              overflow-y: auto;
              padding: 12px;
              font-family: 'Consolas', 'Monaco', monospace;
              font-size: 13px;
              line-height: 1.5;
            }
            .log-entry {
              padding: 4px 8px;
              margin-bottom: 2px;
              border-radius: 3px;
              display: flex;
              gap: 8px;
              transition: background 0.1s;
            }
            .log-entry:hover { background: rgba(255,255,255,0.05); }
            .log-timestamp { color: #888; font-size: 11px; min-width: 80px; }
            .log-type { font-weight: bold; min-width: 60px; text-transform: uppercase; font-size: 11px; }
            .log-text { flex: 1; word-break: break-word; }
            .status-bar {
              background: #2d2d2d;
              padding: 6px 16px;
              font-size: 11px;
              color: #888;
              border-top: 1px solid #3d3d3d;
              display: flex;
              justify-content: space-between;
            }
            .empty-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: #666;
              font-size: 14px;
            }
            ::-webkit-scrollbar { width: 10px; }
            ::-webkit-scrollbar-track { background: #1e1e1e; }
            ::-webkit-scrollbar-thumb { background: #4c97ff; border-radius: 5px; }
            ::-webkit-scrollbar-thumb:hover { background: #3373cc; }
            #commandInput:focus { border-color: #4c97ff; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">
              <span>🖥️</span>
              <span>ArkIDE Console</span>
            </div>
            <div class="controls">
              <button onclick="clearConsole()">Clear</button>
              <button onclick="exportConsole()">Export</button>
              <button onclick="window.close()">Close</button>
            </div>
          </div>
          <div class="filter-bar">
            <button class="filter-btn active" onclick="setFilter('all')">All</button>
            <button class="filter-btn" onclick="setFilter('log')">Log</button>
            <button class="filter-btn" onclick="setFilter('info')">Info</button>
            <button class="filter-btn" onclick="setFilter('warn')">Warn</button>
            <button class="filter-btn" onclick="setFilter('error')">Error</button>
            <button class="filter-btn" onclick="setFilter('success')">Success</button>
            <button class="filter-btn" onclick="setFilter('debug')">Debug</button>
          </div>
          <div class="command-bar" style="background:#252525;border-bottom:1px solid #3d3d3d;padding:8px 16px;display:flex;gap:8px;align-items:center;">
            <span style="color:#aaa;font-size:12px;">▶</span>
            <div style="flex:1;position:relative;">
              <input id="commandInput" type="text" placeholder='e.g.  translate "hello world" "spanish"'
                style="width:100%;background:#1e1e1e;border:1px solid #3d3d3d;color:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;font-size:13px;outline:none;"
                onkeydown="if(event.key==='Enter') runCommand()"
                oninput="updatePreview()" />
              <div id="paramPreview" style="position:absolute;left:0;right:0;top:calc(100% + 4px);background:#2a2a2a;border:1px solid #4c97ff;border-radius:4px;padding:6px 10px;font-size:11px;font-family:monospace;color:#aaa;display:none;z-index:99;pointer-events:none;"></div>
            </div>
            <button onclick="runCommand()">Run</button>
            <button onclick="toggleHelp()" id="helpBtn" style="background:#3d3d3d;color:#fff;">Commands</button>
          </div>
          <div id="helpPanel" style="display:none;background:#1a1a1a;border-bottom:1px solid #3d3d3d;max-height:220px;overflow-y:auto;">
            <div style="padding:10px 16px 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Registered Commands</div>
            <div id="commandList" style="padding:0 8px 8px;"></div>
          </div>
          <div class="console-content" id="consoleContent">
            <div class="empty-state">
              <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
              <div>No logs yet. Start logging from ArkIDE!</div>
            </div>
          </div>
          <div class="status-bar">
            <span id="logCount">0 logs</span>
            <span>Ready</span>
          </div>
          <script>
            function setFilter(filter) {
              document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
              event.target.classList.add('active');
              window.opener.postMessage({ action: 'setFilter', filter: filter }, '*');
            }
            function clearConsole() {
              window.opener.postMessage({ action: 'clear' }, '*');
            }
            function exportConsole() {
              window.opener.postMessage({ action: 'export' }, '*');
            }
            function runCommand() {
              const input = document.getElementById('commandInput');
              const raw = input.value.trim();
              if (!raw) return;
              const firstSpace = raw.indexOf(' ');
              const cmdName = (firstSpace === -1 ? raw : raw.slice(0, firstSpace)).toLowerCase();
              const cmdArg = firstSpace === -1 ? '' : raw.slice(firstSpace + 1).trim();
              input.value = '';
              document.getElementById('paramPreview').style.display = 'none';
              window.opener.postMessage({ action: 'runCommand', name: cmdName, arg: cmdArg }, '*');
            }
            function updatePreview() {
              const input = document.getElementById('commandInput');
              const preview = document.getElementById('paramPreview');
              const raw = input.value.trim();
              if (!raw) { preview.style.display = 'none'; return; }
              const cmdName = raw.split(' ')[0].toLowerCase();
              window.opener.postMessage({ action: 'getParamHint', cmd: cmdName, current: raw }, '*');
            }
            function fillCommand(cmd) {
              const input = document.getElementById('commandInput');
              input.value = cmd + ' ';
              input.focus();
              updatePreview();
            }
            function showParamHint(params, current) {
              const preview = document.getElementById('paramPreview');
              if (!params || params.length === 0) { preview.style.display = 'none'; return; }
              const matches = [...current.matchAll(/"([^"]*)"/g)].map(m => m[1]);
              const hints = params.map((p, i) => {
                const filled = matches[i] !== undefined;
                const tag = filled
                  ? '<span style="color:#0fbd8c">&lt;' + p + ': ' + matches[i] + '&gt;<\\/span>'
                  : '<span style="color:#ffab19">&lt;' + p + '&gt;<\\/span>';
                return tag;
              }).join(' ');
              preview.innerHTML = '⌨️ ' + hints;
              preview.style.display = 'block';
            }
            function toggleHelp() {
              const panel = document.getElementById('helpPanel');
              const btn = document.getElementById('helpBtn');
              const visible = panel.style.display !== 'none';
              panel.style.display = visible ? 'none' : 'block';
              btn.style.background = visible ? '#3d3d3d' : '#4c97ff';
              if (!visible) window.opener.postMessage({ action: 'getCommandList' }, '*');
            }
          <\/script>
        </body>
        </html>
      `);

      if (this._messageHandler) {
        window.removeEventListener('message', this._messageHandler);
      }

      this._messageHandler = (e) => {
        if (e.data.action === 'clear') {
          this.clear();
        } else if (e.data.action === 'export') {
          const text = this.exportLogs();
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `console-logs-${new Date().toISOString()}.txt`;
          a.click();
        } else if (e.data.action === 'setFilter') {
          this.filter = e.data.filter;
          this.updateConsoleWindow();
        } else if (e.data.action === 'runCommand') {
          this._fireCommand(e.data.name, e.data.arg);
          this.addLog(`> ${e.data.name}${e.data.arg ? ' ' + e.data.arg : ''}`, '#888', 'log');
        } else if (e.data.action === 'getCommandList') {
          this.updateCommandList();
        } else if (e.data.action === 'getParamHint') {
          const cmd = this.registeredCommands[e.data.cmd];
          if (cmd && this.consoleWindow && !this.consoleWindow.closed) {
            this.consoleWindow.showParamHint(cmd.params, e.data.current);
          }
        }
      };

      window.addEventListener('message', this._messageHandler);
      this.updateConsoleWindow();
    }

    addLog(text, color = '#ffffff', type = 'log') {
      if (this.paused) return;
      const timestamp = new Date().toLocaleTimeString();
      const log = { text, color, type, timestamp, id: Date.now() + Math.random() };
      this.logs.push(log);
      if (this.logs.length > this.maxLogs) this.logs.shift();
      this.updateConsoleWindow();
    }

    log(args) {
      this.addLog(String(args.TEXT), '#ffffff', 'log');
    }

    logWithColor(args) {
      this.addLog(String(args.TEXT), args.COLOR, 'log');
    }

    logWithType(args) {
      const colors = {
        log: '#ffffff',
        info: '#4c97ff',
        warn: '#ffab19',
        error: '#ff6680',
        success: '#0fbd8c',
        debug: '#bf5af2'
      };
      this.addLog(String(args.TEXT), colors[args.TYPE] || '#ffffff', args.TYPE);
    }

    clear() {
      this.logs = [];
      this.updateConsoleWindow();
    }

    registerCommand(args) {
      const cmd = String(args.CMD).toLowerCase().trim();
      const desc = String(args.DESC);
      const params = String(args.PARAMS).trim().split(/\s+/).filter(Boolean);
      this.registeredCommands[cmd] = { description: desc, params };
      this.updateCommandList();
    }

    unregisterCommand(args) {
      const cmd = String(args.CMD).toLowerCase().trim();
      delete this.registeredCommands[cmd];
      this.updateCommandList();
    }

    onUserCommand(args) {
      return String(args.CMD).toLowerCase().trim() === this._lastCommand.toLowerCase().trim();
    }

    getParam(args) {
      const name = String(args.NAME).toLowerCase().trim();
      return this._lastCommandParams[name] ?? '';
    }

    getCommandArg() {
      return this._lastCommandArg;
    }

    getLastCommand() {
      return this._lastCommand;
    }

    _fireCommand(name, rawArg) {
      this._lastCommand = name.toLowerCase().trim();
      this._lastCommandArg = rawArg;
      this._lastCommandParams = {};

      const cmdDef = this.registeredCommands[this._lastCommand];
      if (cmdDef && cmdDef.params.length > 0) {
        const matches = [...rawArg.matchAll(/"([^"]*)"/g)].map(m => m[1]);
        cmdDef.params.forEach((paramName, i) => {
          if (matches[i] !== undefined) {
            this._lastCommandParams[paramName.toLowerCase()] = matches[i];
          }
        });
      }

      if (Scratch.vm && Scratch.vm.runtime) {
        Scratch.vm.runtime.startHats('customconsole_onUserCommand');
      }
    }

    updateCommandList() {
      if (!this.consoleWindow || this.consoleWindow.closed) return;
      const list = this.consoleWindow.document.getElementById('commandList');
      if (!list) return;

      if (Object.keys(this.registeredCommands).length === 0) {
        list.innerHTML = '<div style="color:#555;font-size:12px;padding:8px;">No commands registered yet.</div>';
        return;
      }

      list.innerHTML = Object.entries(this.registeredCommands).map(([cmd, info]) => {
        const paramTags = (info.params || []).map(p =>
          `<span style="background:#4c97ff22;color:#4c97ff;border:1px solid #4c97ff44;border-radius:3px;padding:1px 6px;font-size:11px;">&lt;${p}&gt;</span>`
        ).join(' ');

        return `
          <div onclick="fillCommand('${this.escapeHtml(cmd)}')"
            style="background:#252525;border:1px solid #333;border-radius:6px;padding:8px 12px;margin:6px 4px;cursor:pointer;transition:border-color 0.15s;"
            onmouseover="this.style.borderColor='#4c97ff'" onmouseout="this.style.borderColor='#333'">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
              <span style="color:#4c97ff;font-weight:bold;font-family:monospace;font-size:14px;">${this.escapeHtml(cmd)}</span>
              <span style="color:#666;font-size:11px;">${this.escapeHtml(info.description)}</span>
            </div>
            ${info.params.length > 0 ? `<div style="display:flex;gap:6px;flex-wrap:wrap;">${paramTags}</div>` : '<div style="color:#555;font-size:11px;">no parameters</div>'}
          </div>`;
      }).join('');
    }

    deleteLastLog() {
      this.logs.pop();
      this.updateConsoleWindow();
    }

    deleteLogAtIndex(args) {
      const index = Number(args.INDEX) - 1;
      if (index >= 0 && index < this.logs.length) {
        this.logs.splice(index, 1);
        this.updateConsoleWindow();
      }
    }

    getLogCount() {
      return this.logs.length;
    }

    getLogAtIndex(args) {
      const index = Number(args.INDEX) - 1;
      if (index >= 0 && index < this.logs.length) {
        return this.logs[index].text;
      }
      return '';
    }

    exportLogs() {
      return this.logs.map((log, i) => `[${i + 1}] ${log.timestamp} [${log.type.toUpperCase()}] ${log.text}`).join('\n');
    }

    pauseLogging() {
      this.paused = true;
    }

    resumeLogging() {
      this.paused = false;
    }

    setMaxLogs(args) {
      this.maxLogs = Math.max(1, Math.min(10000, Number(args.MAX)));
    }

    updateConsoleWindow() {
      if (!this.consoleWindow || this.consoleWindow.closed) return;

      const content = this.consoleWindow.document.getElementById('consoleContent');
      const logCount = this.consoleWindow.document.getElementById('logCount');
      if (!content || !logCount) return;

      const filteredLogs = this.filter === 'all'
        ? this.logs
        : this.logs.filter(log => log.type === this.filter);

      if (filteredLogs.length === 0) {
        content.innerHTML = `
          <div class="empty-state">
            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
            <div>${this.logs.length === 0 ? 'No logs yet. Start logging from ArkIDE!' : 'No logs match the current filter.'}</div>
          </div>
        `;
      } else {
        content.innerHTML = filteredLogs.map(log => `
          <div class="log-entry">
            <span class="log-timestamp">${log.timestamp}</span>
            <span class="log-type" style="color: ${log.color}">${log.type}</span>
            <span class="log-text" style="color: ${log.color}">${this.escapeHtml(log.text)}</span>
          </div>
        `).join('');
        content.scrollTop = content.scrollHeight;
      }

      logCount.textContent = `${this.logs.length} logs`;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  Scratch.extensions.register(new CustomConsole());
})(Scratch);