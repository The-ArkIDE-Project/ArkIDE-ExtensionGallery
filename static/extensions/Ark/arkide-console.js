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
            .controls {
              display: flex;
              gap: 8px;
            }
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
            button:hover {
              background: #e6f2ff;
              transform: translateY(-1px);
            }
            button:active {
              transform: translateY(0);
            }
            .filter-bar {
              background: #2d2d2d;
              padding: 8px 16px;
              display: flex;
              gap: 8px;
              border-bottom: 1px solid #3d3d3d;
            }
            .filter-btn {
              background: #3d3d3d;
              color: #fff;
              padding: 4px 10px;
              font-size: 11px;
            }
            .filter-btn.active {
              background: #4c97ff;
            }
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
            .log-entry:hover {
              background: rgba(255,255,255,0.05);
            }
            .log-timestamp {
              color: #888;
              font-size: 11px;
              min-width: 80px;
            }
            .log-type {
              font-weight: bold;
              min-width: 60px;
              text-transform: uppercase;
              font-size: 11px;
            }
            .log-text {
              flex: 1;
              word-break: break-word;
            }
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
            ::-webkit-scrollbar {
              width: 10px;
            }
            ::-webkit-scrollbar-track {
              background: #1e1e1e;
            }
            ::-webkit-scrollbar-thumb {
              background: #4c97ff;
              border-radius: 5px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #3373cc;
            }
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
            let currentFilter = 'all';
            
            function setFilter(filter) {
              currentFilter = filter;
              document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
              });
              event.target.classList.add('active');
              window.opener.postMessage({action: 'setFilter', filter: filter}, '*');
            }
            
            function clearConsole() {
              window.opener.postMessage({action: 'clear'}, '*');
            }
            
            function exportConsole() {
              window.opener.postMessage({action: 'export'}, '*');
            }
          </script>
        </body>
        </html>
      `);

      window.addEventListener('message', (e) => {
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
        }
      });

      this.updateConsoleWindow();
    }

    addLog(text, color = '#ffffff', type = 'log') {
      if (this.paused) return;

      const timestamp = new Date().toLocaleTimeString();
      const log = { text, color, type, timestamp, id: Date.now() + Math.random() };
      
      this.logs.push(log);
      
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

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