(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Fullscreen Detector must run unsandboxed');
    }

    function _getCanvas() {
        return Scratch.vm.runtime.renderer && Scratch.vm.runtime.renderer.canvas
            ? Scratch.vm.runtime.renderer.canvas
            : null;
    }

    function _isStageFullscreen() {
        const canvas = _getCanvas();
        if (!canvas) return false;
        let el = canvas.parentElement;
        while (el) {
            const cls = el.className || '';
            if (
                cls.includes('stage-wrapper_stage-wrapper_') ||
                cls.includes('stage_full-screen') ||
                cls.includes('fullscreen') ||
                el.dataset.isFullscreen === 'true'
            ) {
                if (
                    cls.includes('full-screen') ||
                    cls.includes('fullscreen') ||
                    cls.includes('isFullScreen') ||
                    el.dataset.isFullscreen === 'true'
                ) {
                    return true;
                }
            }
            el = el.parentElement;
        }
        const doc = canvas.ownerDocument || document;
        const stageWrappers = doc.querySelectorAll('[class*="stage-wrapper"]');
        for (const wrapper of stageWrappers) {
            const cls = wrapper.className || '';
            if (cls.includes('full-screen') || cls.includes('fullscreen') || cls.includes('isFullScreen')) {
                return true;
            }
        }
        return false;
    }

    let _isFullscreen = false;
    let _enterCount = 0;
    let _exitCount = 0;
    let _enteredAt = null;
    let _exitedAt = null;
    let _lastChangedAt = null;
    let _totalFullscreenMs = 0;
    let _fsStart = null;
    let _pendingEnter = false;
    let _pendingExit = false;

    function _poll() {
        const now = _isStageFullscreen();
        if (now === _isFullscreen) return;
        _isFullscreen = now;
        _lastChangedAt = Date.now();
        if (now) {
            _enterCount++;
            _enteredAt = Date.now();
            _fsStart = Date.now();
            _pendingEnter = true;
        } else {
            _exitCount++;
            _exitedAt = Date.now();
            if (_fsStart !== null) {
                _totalFullscreenMs += Date.now() - _fsStart;
                _fsStart = null;
            }
            _pendingExit = true;
        }
    }

    const _observer = new MutationObserver(_poll);
    _observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'data-is-fullscreen'] });

    Scratch.vm.runtime.on('BEFORE_EXECUTE', () => {
        _poll();
        Scratch.vm.runtime.startHats('fullscreenDetector_whenEnterFullscreen');
        Scratch.vm.runtime.startHats('fullscreenDetector_whenExitFullscreen');
        Scratch.vm.runtime.startHats('fullscreenDetector_whenFullscreenChanges');
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
                        text: 'fullscreen state'
                    },
                    {
                        opcode: 'fullscreenStateNumber',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as number'
                    },
                    {
                        opcode: 'fullscreenStateEmoji',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as emoji'
                    },
                    {
                        opcode: 'fullscreenStateWord',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as yes or no'
                    },
                    {
                        opcode: 'fullscreenStateOnOff',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as on or off'
                    },
                    {
                        opcode: 'fullscreenStateBinary',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fullscreen as true or false'
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
                        text: 'Counts and Timing'
                    },
                    {
                        opcode: 'enterCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'times entered fullscreen'
                    },
                    {
                        opcode: 'exitCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'times exited fullscreen'
                    },
                    {
                        opcode: 'totalChanges',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total fullscreen changes'
                    },
                    {
                        opcode: 'totalFullscreenSeconds',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total seconds in fullscreen'
                    },
                    {
                        opcode: 'totalFullscreenMs',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total milliseconds in fullscreen'
                    },
                    {
                        opcode: 'secondsSinceLastChange',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'seconds since last fullscreen change'
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Timestamps'
                    },
                    {
                        opcode: 'lastChangedTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last change timestamp (ms)'
                    },
                    {
                        opcode: 'lastEnteredTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last entered fullscreen timestamp (ms)'
                    },
                    {
                        opcode: 'lastExitedTimestamp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last exited fullscreen timestamp (ms)'
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Actions'
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

        fullscreenStateOnOff() {
            return _isFullscreen ? 'on' : 'off';
        }

        fullscreenStateBinary() {
            return _isFullscreen ? 'true' : 'false';
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

        secondsSinceLastChange() {
            if (_lastChangedAt === null) return 0;
            return +((Date.now() - _lastChangedAt) / 1000).toFixed(2);
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