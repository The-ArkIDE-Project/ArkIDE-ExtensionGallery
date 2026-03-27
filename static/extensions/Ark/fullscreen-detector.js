(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Fullscreen Detector must run unsandboxed');
    }

    let _isFullscreen = !!document.fullscreenElement;
    let _lastFullscreen = _isFullscreen;
    let _enterCount = 0;
    let _exitCount = 0;
    let _lastChangedAt = null;
    let _enteredAt = null;
    let _exitedAt = null;
    let _totalFullscreenMs = 0;
    let _fsStart = _isFullscreen ? Date.now() : null;
    let _pendingEnter = false;
    let _pendingExit = false;

    function _updateState(nowFull) {
        const prev = _isFullscreen;
        _isFullscreen = nowFull;
        _lastChangedAt = Date.now();

        if (nowFull && !prev) {
            _enterCount++;
            _enteredAt = Date.now();
            _fsStart = Date.now();
            _pendingEnter = true;
        }

        if (!nowFull && prev) {
            _exitCount++;
            _exitedAt = Date.now();
            if (_fsStart !== null) {
                _totalFullscreenMs += Date.now() - _fsStart;
                _fsStart = null;
            }
            _pendingExit = true;
        }
    }

    document.addEventListener('fullscreenchange', () => {
        _updateState(!!document.fullscreenElement);
    });

    document.addEventListener('webkitfullscreenchange', () => {
        _updateState(!!(document.fullscreenElement || document.webkitFullscreenElement));
    });

    document.addEventListener('mozfullscreenchange', () => {
        _updateState(!!(document.fullscreenElement || document.mozFullScreenElement));
    });

    document.addEventListener('msfullscreenchange', () => {
        _updateState(!!(document.fullscreenElement || document.msFullscreenElement));
    });

    Scratch.vm.runtime.on('BEFORE_EXECUTE', () => {
        Scratch.vm.runtime.startHats('fullscreenDetector_whenEnterFullscreen');
        Scratch.vm.runtime.startHats('fullscreenDetector_whenExitFullscreen');
        Scratch.vm.runtime.startHats('fullscreenDetector_whenFullscreenChanges');
        _lastFullscreen = _isFullscreen;
        _pendingEnter = false;
        _pendingExit = false;
    });

    function _getTotalMs() {
        if (_isFullscreen && _fsStart !== null) {
            return _totalFullscreenMs + (Date.now() - _fsStart);
        }
        return _totalFullscreenMs;
    }

    class FullscreenDetector {
        getInfo() {
            return {
                id: 'fullscreenDetector',
                name: 'Fullscreen Detector',
                color1: '#1a1a2e',
                color2: '#16213e',
                color3: '#0f3460',
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'State'
                    },
                    {
                        opcode: 'isFullscreen',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is fullscreen?'
                    },
                    {
                        opcode: 'isNotFullscreen',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is NOT fullscreen?'
                    },
                    {
                        opcode: 'fullscreenState',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen state',
                        disableMonitor: false
                    },
                    {
                        opcode: 'fullscreenStateNumber',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as number',
                        disableMonitor: false
                    },
                    {
                        opcode: 'fullscreenStateEmoji',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as emoji',
                        disableMonitor: false
                    },
                    {
                        opcode: 'fullscreenStateWord',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen word',
                        disableMonitor: false
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Events'
                    },
                    {
                        opcode: 'whenEnterFullscreen',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when entering fullscreen',
                        isEdgeActivated: false
                    },
                    {
                        opcode: 'whenExitFullscreen',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when exiting fullscreen',
                        isEdgeActivated: false
                    },
                    {
                        opcode: 'whenFullscreenChanges',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when fullscreen changes',
                        isEdgeActivated: false
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Counts & Tracking'
                    },
                    {
                        opcode: 'enterCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'times entered fullscreen',
                        disableMonitor: false
                    },
                    {
                        opcode: 'exitCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'times exited fullscreen',
                        disableMonitor: false
                    },
                    {
                        opcode: 'totalChanges',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total fullscreen changes',
                        disableMonitor: false
                    },
                    {
                        opcode: 'totalFullscreenSeconds',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total seconds in fullscreen',
                        disableMonitor: false
                    },
                    {
                        opcode: 'totalFullscreenMs',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total milliseconds in fullscreen',
                        disableMonitor: false
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Timestamps'
                    },
                    {
                        opcode: 'lastChangedTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last fullscreen change timestamp (ms)',
                        disableMonitor: false
                    },
                    {
                        opcode: 'lastEnteredTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last entered fullscreen at (ms)',
                        disableMonitor: false
                    },
                    {
                        opcode: 'lastExitedTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last exited fullscreen at (ms)',
                        disableMonitor: false
                    },
                    {
                        opcode: 'secondsSinceLastChange',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'seconds since last fullscreen change',
                        disableMonitor: false
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Element Info'
                    },
                    {
                        opcode: 'fullscreenElementTag',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen element tag name',
                        disableMonitor: false
                    },
                    {
                        opcode: 'fullscreenElementId',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen element id',
                        disableMonitor: false
                    },
                    {
                        opcode: 'hasFullscreenElement',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'fullscreen element exists?'
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Actions'
                    },
                    {
                        opcode: 'requestFullscreen',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'request fullscreen'
                    },
                    {
                        opcode: 'exitFullscreen',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'exit fullscreen'
                    },
                    {
                        opcode: 'toggleFullscreen',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'toggle fullscreen'
                    },
                    {
                        opcode: 'resetCounts',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset fullscreen counts and timers'
                    }
                ]
            };
        }

        isFullscreen() {
            return _isFullscreen;
        }

        isNotFullscreen() {
            return !_isFullscreen;
        }

        fullscreenState() {
            return _isFullscreen ? 'fullscreen' : 'windowed';
        }

        fullscreenStateNumber() {
            return _isFullscreen ? 1 : 0;
        }

        fullscreenStateEmoji() {
            return _isFullscreen ? '🖥️' : '🪟';
        }

        fullscreenStateWord() {
            return _isFullscreen ? 'yes' : 'no';
        }

        whenEnterFullscreen() {
            return _pendingEnter;
        }

        whenExitFullscreen() {
            return _pendingExit;
        }

        whenFullscreenChanges() {
            return _pendingEnter || _pendingExit;
        }

        enterCount() {
            return _enterCount;
        }

        exitCount() {
            return _exitCount;
        }

        totalChanges() {
            return _enterCount + _exitCount;
        }

        totalFullscreenSeconds() {
            return Math.floor(_getTotalMs() / 1000);
        }

        totalFullscreenMs() {
            return _getTotalMs();
        }

        lastChangedTimestamp() {
            return _lastChangedAt !== null ? _lastChangedAt : 0;
        }

        lastEnteredTimestamp() {
            return _enteredAt !== null ? _enteredAt : 0;
        }

        lastExitedTimestamp() {
            return _exitedAt !== null ? _exitedAt : 0;
        }

        secondsSinceLastChange() {
            if (_lastChangedAt === null) return 0;
            return ((Date.now() - _lastChangedAt) / 1000).toFixed(2);
        }

        fullscreenElementTag() {
            const el = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            return el ? el.tagName.toLowerCase() : '';
        }

        fullscreenElementId() {
            const el = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            return el ? (el.id || '') : '';
        }

        hasFullscreenElement() {
            return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        }

        requestFullscreen() {
            const el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {});
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            }
        }

        exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        toggleFullscreen() {
            if (_isFullscreen) {
                this.exitFullscreen();
            } else {
                this.requestFullscreen();
            }
        }

        resetCounts() {
            _enterCount = 0;
            _exitCount = 0;
            _totalFullscreenMs = 0;
            _fsStart = _isFullscreen ? Date.now() : null;
            _enteredAt = null;
            _exitedAt = null;
            _lastChangedAt = null;
        }
    }

    Scratch.extensions.register(new FullscreenDetector());
})(Scratch);