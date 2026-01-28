(function(Scratch) {
    'use strict';

    const API_BASE = 'https://projstorage.arkide.site';
    let currentMode = 'server';
    let lastResponse = 'Ready';

    const iconDataURI = "data:image/svg+xml,%3Csvg%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%2064%2064%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23594ae2%22%2F%3E%3Cpath%20d%3D%22M16%2020h32v4h-32zM20%2028h24v4h-24zM20%2036h24v4h-24z%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E";

    const DB_NAME = 'arkide_storage';
    const STORE_NAME = 'data_store';

    // IndexedDB helper functions
    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const idbGet = async (key) => {
        const db = await openDatabase();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    };

    const idbSet = async (key, value) => {
        const db = await openDatabase();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    };

    const idbDelete = async (key) => {
        const db = await openDatabase();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    };

    class ArkIDEStorage {
        getInfo() {
            return {
                id: 'arkideStorage',
                name: 'Store My Stuff',
                color1: '#594ae2',
                color2: '#3545bd',
                menuIconURI: iconDataURI,
                blocks: [
                    {
                        opcode: 'showDisclaimer',
                        blockType: Scratch.BlockType.BUTTON,
                        text: 'View Disclaimer'
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Credit to G1nX for the extension idea.'
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: '── Configuration ──'
                    },
                    {
                        opcode: 'setStorageMode',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'use [MODE] storage',
                        arguments: {
                            MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'storageMode',
                                defaultValue: 'server'
                            }
                        }
                    },
                    {
                        opcode: 'getStorageMode',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'storage mode'
                    },
                    {
                        opcode: 'getLastResponse',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last response'
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: '── Basic Operations ──'
                    },
                    {
                        opcode: 'setValue',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [KEY] to [VALUE] [LOCK]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myKey'
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myValue'
                            },
                            LOCK: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'lockMenu',
                                defaultValue: 'unlocked'
                            }
                        }
                    },
                    {
                        opcode: 'getValue',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myKey'
                            }
                        }
                    },
                    {
                        opcode: 'deleteKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'delete [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myKey'
                            }
                        }
                    },
                    {
                        opcode: 'keyExists',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[KEY] exists?',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myKey'
                            }
                        }
                    },
                    {
                        opcode: 'getKeyInfo',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'info of [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myKey'
                            }
                        }
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: '── Math Operations ──'
                    },
                    {
                        opcode: 'changeValue',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'change [KEY] by [AMOUNT]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'counter'
                            },
                            AMOUNT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: '── List Operations ──'
                    },
                    {
                        opcode: 'appendToList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add [ITEM] to list [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'item'
                            }
                        }
                    },
                    {
                        opcode: 'getListAsJSON',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'list [KEY] as JSON',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            }
                        }
                    },
                    {
                        opcode: 'getListItem',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'item [INDEX] of list [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            },
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'getListLength',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'length of list [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            }
                        }
                    },
                    {
                        opcode: 'listContains',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'list [KEY] contains [ITEM]?',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            },
                            ITEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'item'
                            }
                        }
                    },
                    {
                        opcode: 'removeFromList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'remove item [INDEX] from list [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            },
                            INDEX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'clearList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear list [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myList'
                            }
                        }
                    }
                ],
                menus: {
                    storageMode: {
                        acceptReporters: true,
                        items: [
                            { text: 'Server', value: 'server' },
                            { text: 'Local Storage', value: 'local' },
                            { text: 'IndexedDB', value: 'indexeddb' }
                        ]
                    },
                    lockMenu: {
                        acceptReporters: false,
                        items: [
                            { text: 'unlocked', value: 'unlocked' },
                            { text: 'locked', value: 'locked' }
                        ]
                    }
                }
            };
        }

showDisclaimer() {
    const text = `ArkIDE Storage Extension - Disclaimer

This extension provides cloud storage capabilities through the ArkIDE server.

Important Notes:
- Server storage is shared across all users
- The server may experience downtime
- All requests are logged for security
- Do not store sensitive information
- Use locks to protect important data

For issues or questions, contact the developer.

Storage modes:
- Server: Shared cloud storage
- Local Storage: Browser-only storage
- IndexedDB: Browser-only database storage`;

    alert(text);
}

        setStorageMode({ MODE }) {
            currentMode = MODE.toLowerCase();
            lastResponse = `Storage mode set to ${currentMode}`;
        }

        getStorageMode() {
            return currentMode;
        }

        getLastResponse() {
            return lastResponse;
        }

        async _serverRequest(endpoint, method = 'GET', body = null) {
            try {
                const options = {
                    method: method,
                    headers: { 'Content-Type': 'application/json' }
                };
                
                if (body) {
                    options.body = JSON.stringify(body);
                }

                const response = await Scratch.fetch(`${API_BASE}${endpoint}`, options);
                const data = await response.json();
                
                lastResponse = data.message || data.status || 'Success';
                return data;
            } catch (error) {
                lastResponse = `Error: ${error.message}`;
                return { success: false, error: error.message };
            }
        }

        async _getStorageData(key, mode = null) {
            const useMode = mode || currentMode; // Use passed mode or current
            
            if (useMode === 'server') {
                return await this._serverRequest(`/get/${encodeURIComponent(key)}`);
            } else if (useMode === 'local') {
                const data = localStorage.getItem(`arkide_${key}`);
                return data ? JSON.parse(data) : null;
            } else if (useMode === 'indexeddb') {
                return await idbGet(key);
            }
            return null;
        }
        async _setStorageData(key, value, locked = false, mode = null) {
            const useMode = mode || currentMode;
            const data = { value: value, locked: locked };
            
            if (useMode === 'server') {
                return await this._serverRequest('/set', 'POST', { key, value, locked });
            } else if (useMode === 'local') {
                localStorage.setItem(`arkide_${key}`, JSON.stringify(data));
                lastResponse = 'Saved to local storage';
                return { success: true };
            } else if (useMode === 'indexeddb') {
                await idbSet(key, data);
                lastResponse = 'Saved to IndexedDB';
                return { success: true };
            }
        }

        async _deleteStorageData(key, mode = null) {
            const useMode = mode || currentMode;
            
            if (useMode === 'server') {
                return await this._serverRequest(`/delete/${encodeURIComponent(key)}`, 'DELETE');
            } else if (useMode === 'local') {
                localStorage.removeItem(`arkide_${key}`);
                lastResponse = 'Deleted from local storage';
                return { success: true };
            } else if (useMode === 'indexeddb') {
                await idbDelete(key);
                lastResponse = 'Deleted from IndexedDB';
                return { success: true };
            }
        }

        async setValue({ KEY, VALUE, LOCK }) {
            const locked = LOCK === 'locked';
            const mode = currentMode; // Capture mode at start
            
            if (mode === 'server') {
                await this._serverRequest('/set', 'POST', { key: KEY, value: VALUE, locked });
            } else {
                await this._setStorageData(KEY, VALUE, locked);
            }
        }

        async getValue({ KEY }) {
            const mode = currentMode; // Capture mode at start
            const data = await this._getStorageData(KEY);
            if (!data) return '';
            return data.value !== undefined ? data.value : data;
        }

        async deleteKey({ KEY }) {
            const mode = currentMode; // Capture mode at start
            await this._deleteStorageData(KEY);
        }

        async keyExists({ KEY }) {
            const data = await this._getStorageData(KEY);
            return data !== null;
        }

        async getKeyInfo({ KEY }) {
            if (currentMode === 'server') {
                const data = await this._serverRequest(`/info/${encodeURIComponent(KEY)}`);
                return JSON.stringify(data);
            }
            
            const data = await this._getStorageData(KEY);
            if (!data) {
                return JSON.stringify({ exists: false });
            }
            
            return JSON.stringify({
                exists: true,
                value: data.value,
                locked: data.locked || false,
                type: Array.isArray(data.value) ? 'array' : typeof data.value
            });
        }

        async changeValue({ KEY, AMOUNT }) {
            const data = await this._getStorageData(KEY);
            const currentValue = data && data.value !== undefined ? Number(data.value) || 0 : 0;
            const newValue = currentValue + Number(AMOUNT);
            await this._setStorageData(KEY, newValue, data?.locked || false);
        }

        async appendToList({ KEY, ITEM }) {
            const data = await this._getStorageData(KEY);
            let list = [];
            
            if (data && Array.isArray(data.value)) {
                list = data.value;
            }
            
            list.push(ITEM);
            await this._setStorageData(KEY, list, data?.locked || false);
        }

        async getListAsJSON({ KEY }) {
            const data = await this._getStorageData(KEY);
            const list = data && Array.isArray(data.value) ? data.value : [];
            return JSON.stringify(list);
        }

        async getListItem({ KEY, INDEX }) {
            const data = await this._getStorageData(KEY);
            const list = data && Array.isArray(data.value) ? data.value : [];
            const item = list[INDEX - 1];
            return item !== undefined ? item : '';
        }

        async getListLength({ KEY }) {
            const data = await this._getStorageData(KEY);
            const list = data && Array.isArray(data.value) ? data.value : [];
            return list.length;
        }

        async listContains({ KEY, ITEM }) {
            const data = await this._getStorageData(KEY);
            const list = data && Array.isArray(data.value) ? data.value : [];
            return list.includes(ITEM);
        }

        async removeFromList({ KEY, INDEX }) {
            const data = await this._getStorageData(KEY);
            let list = data && Array.isArray(data.value) ? data.value : [];
            
            if (INDEX >= 1 && INDEX <= list.length) {
                list.splice(INDEX - 1, 1);
                await this._setStorageData(KEY, list, data?.locked || false);
            }
        }

        async clearList({ KEY }) {
            const data = await this._getStorageData(KEY);
            await this._setStorageData(KEY, [], data?.locked || false);
        }
    }

    Scratch.extensions.register(new ArkIDEStorage());
})(Scratch);