/**
 * Offline Capability and Sync System
 * Enables data collection when offline with automatic sync when connection restored
 */

class OfflineCapabilitySync {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineData = new Map();
        this.syncQueue = [];
        this.syncInProgress = false;
        this.syncRetryAttempts = 0;
        this.maxRetryAttempts = 3;
        this.syncStatus = 'idle'; // idle, syncing, error
        this.lastSyncTime = null;
        this.pendingOperations = [];
        this.conflictResolutionStrategy = 'client_wins'; // client_wins, server_wins, merge
        
        this.initializeOfflineCapability();
    }

    // Initialize offline capability
    initializeOfflineCapability() {
        // Setup service worker for offline caching
        this.registerServiceWorker();
        
        // Listen for connectivity changes
        this.setupConnectivityListeners();
        
        // Load existing offline data
        this.loadOfflineData();
        
        // Setup automatic sync intervals
        this.setupPeriodicSync();
        
        // Initialize IndexedDB for large data storage
        this.initializeIndexedDB();
    }

    // Register service worker for offline functionality
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw-data-collection.js');
                console.log('Data collection service worker registered:', registration);
                
                // Listen for service worker messages
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event);
                });
                
            } catch (error) {
                console.error('Service worker registration failed:', error);
            }
        }
    }

    // Setup connectivity listeners
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });
        
        // Check initial status
        this.handleOnlineStatus(navigator.onLine);
    }

    // Handle online/offline status changes
    async handleOnlineStatus(isOnline) {
        const wasOffline = !this.isOnline;
        this.isOnline = isOnline;
        
        this.updateConnectionStatus();
        
        if (isOnline && wasOffline) {
            // Connection restored - start sync
            console.log('Connection restored - starting sync');
            await this.syncOfflineData();
        } else if (!isOnline) {
            // Connection lost
            console.log('Connection lost - switching to offline mode');
            this.showOfflineNotification();
        }
    }

    // Initialize IndexedDB for offline storage
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MindMapOfflineDB', 1);
            
            request.onerror = () => {
                console.error('IndexedDB initialization failed');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('responses')) {
                    const responseStore = db.createObjectStore('responses', { keyPath: 'id', autoIncrement: true });
                    responseStore.createIndex('sessionId', 'sessionId', { unique: false });
                    responseStore.createIndex('timestamp', 'timestamp', { unique: false });
                    responseStore.createIndex('synced', 'synced', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
                    sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
                    sessionStore.createIndex('synced', 'synced', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('attachments')) {
                    const attachmentStore = db.createObjectStore('attachments', { keyPath: 'id', autoIncrement: true });
                    attachmentStore.createIndex('sessionId', 'sessionId', { unique: false });
                    attachmentStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Save data offline
    async saveOffline(dataType, data, sessionId = null) {
        const offlineEntry = {
            id: this.generateOfflineId(),
            dataType,
            data,
            sessionId: sessionId || this.generateSessionId(),
            timestamp: new Date().toISOString(),
            synced: false,
            offline: true,
            retryCount: 0
        };

        try {
            // Save to IndexedDB
            await this.saveToIndexedDB('responses', offlineEntry);
            
            // Add to sync queue
            this.addToSyncQueue(offlineEntry);
            
            // Update UI
            this.updateOfflineStatus();
            
            // Try immediate sync if online
            if (this.isOnline) {
                this.attemptSync(offlineEntry);
            }
            
            return offlineEntry.id;
            
        } catch (error) {
            console.error('Failed to save offline data:', error);
            // Fallback to localStorage
            return this.saveToLocalStorageFallback(offlineEntry);
        }
    }

    // Save to IndexedDB
    async saveToIndexedDB(storeName, data) {
        if (!this.db) {
            await this.initializeIndexedDB();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Save to localStorage as fallback
    saveToLocalStorageFallback(data) {
        try {
            const existingData = JSON.parse(localStorage.getItem('offline_data_fallback') || '[]');
            existingData.push(data);
            localStorage.setItem('offline_data_fallback', JSON.stringify(existingData));
            return data.id;
        } catch (error) {
            console.error('LocalStorage fallback failed:', error);
            return null;
        }
    }

    // Load offline data
    async loadOfflineData() {
        try {
            // Load from IndexedDB
            const offlineResponses = await this.getFromIndexedDB('responses', 'synced', false);
            const offlineSessions = await this.getFromIndexedDB('sessions', 'synced', false);
            
            // Add to sync queue
            offlineResponses.forEach(response => this.addToSyncQueue(response));
            offlineSessions.forEach(session => this.addToSyncQueue(session));
            
            // Load from localStorage fallback
            const fallbackData = JSON.parse(localStorage.getItem('offline_data_fallback') || '[]');
            fallbackData.forEach(item => this.addToSyncQueue(item));
            
            console.log(`Loaded ${this.syncQueue.length} offline items`);
            
        } catch (error) {
            console.error('Failed to load offline data:', error);
        }
    }

    // Get data from IndexedDB
    async getFromIndexedDB(storeName, indexName = null, indexValue = null) {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            let request;
            if (indexName && indexValue !== null) {
                const index = store.index(indexName);
                request = index.getAll(indexValue);
            } else {
                request = store.getAll();
            }
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // Add to sync queue
    addToSyncQueue(item) {
        // Avoid duplicates
        const existingIndex = this.syncQueue.findIndex(queued => 
            queued.id === item.id || 
            (queued.sessionId === item.sessionId && queued.dataType === item.dataType)
        );
        
        if (existingIndex === -1) {
            this.syncQueue.push(item);
        } else {
            // Update existing item if newer
            if (new Date(item.timestamp) > new Date(this.syncQueue[existingIndex].timestamp)) {
                this.syncQueue[existingIndex] = item;
            }
        }
    }

    // Sync offline data when connection restored
    async syncOfflineData() {
        if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
            return;
        }
        
        this.syncInProgress = true;
        this.syncStatus = 'syncing';
        this.updateSyncStatus();
        
        const syncBatch = [...this.syncQueue];
        const syncResults = {
            successful: 0,
            failed: 0,
            conflicts: 0,
            errors: []
        };
        
        try {
            // Sort by timestamp to maintain order
            syncBatch.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            for (const item of syncBatch) {
                try {
                    const result = await this.syncSingleItem(item);
                    
                    if (result.success) {
                        syncResults.successful++;
                        this.removeFromSyncQueue(item.id);
                        await this.markAsSynced(item);
                    } else if (result.conflict) {
                        syncResults.conflicts++;
                        await this.handleSyncConflict(item, result.conflictData);
                    } else {
                        syncResults.failed++;
                        syncResults.errors.push(result.error);
                        item.retryCount = (item.retryCount || 0) + 1;
                    }
                    
                } catch (error) {
                    console.error(`Sync failed for item ${item.id}:`, error);
                    syncResults.failed++;
                    syncResults.errors.push(error.message);
                    item.retryCount = (item.retryCount || 0) + 1;
                }
            }
            
            // Remove items that have exceeded retry limit
            this.cleanupFailedItems();
            
            this.lastSyncTime = new Date().toISOString();
            this.syncStatus = syncResults.failed > 0 ? 'error' : 'idle';
            
            this.showSyncResults(syncResults);
            
        } catch (error) {
            console.error('Sync process failed:', error);
            this.syncStatus = 'error';
            syncResults.errors.push(error.message);
        } finally {
            this.syncInProgress = false;
            this.updateSyncStatus();
        }
        
        return syncResults;
    }

    // Sync single item
    async syncSingleItem(item) {
        const endpoint = this.getEndpointForDataType(item.dataType);
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'X-Offline-Sync': 'true',
                    'X-Original-Timestamp': item.timestamp
                },
                body: JSON.stringify({
                    ...item.data,
                    offline_metadata: {
                        offline_id: item.id,
                        original_timestamp: item.timestamp,
                        retry_count: item.retryCount || 0
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                return { success: true, serverData: result };
            } else if (response.status === 409) {
                // Conflict detected
                const conflictData = await response.json();
                return { conflict: true, conflictData };
            } else {
                return { 
                    success: false, 
                    error: `HTTP ${response.status}: ${response.statusText}` 
                };
            }
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get API endpoint for data type
    getEndpointForDataType(dataType) {
        const endpoints = {
            'mood_tracking': '/api/v1/mood/entry',
            'geographic_data': '/api/v1/geographic/entry',
            'sdoh_response': '/api/v1/sdoh/entry',
            'environmental_context': '/api/v1/environmental/entry',
            'session_data': '/api/v1/sessions/entry'
        };
        
        return endpoints[dataType] || '/api/v1/data/entry';
    }

    // Handle sync conflicts
    async handleSyncConflict(localItem, serverData) {
        const resolution = await this.resolveSyncConflict(localItem, serverData);
        
        switch (resolution.strategy) {
            case 'use_server':
                await this.markAsSynced(localItem);
                this.removeFromSyncQueue(localItem.id);
                break;
                
            case 'use_client':
                // Force update server with client data
                const forceResult = await this.forceSyncItem(localItem);
                if (forceResult.success) {
                    await this.markAsSynced(localItem);
                    this.removeFromSyncQueue(localItem.id);
                }
                break;
                
            case 'merge':
                const mergedData = this.mergeConflictData(localItem.data, serverData);
                localItem.data = mergedData;
                const mergeResult = await this.forceSyncItem(localItem);
                if (mergeResult.success) {
                    await this.markAsSynced(localItem);
                    this.removeFromSyncQueue(localItem.id);
                }
                break;
                
            case 'manual':
                // Present conflict to user for manual resolution
                this.presentConflictToUser(localItem, serverData);
                break;
        }
    }

    // Resolve sync conflict
    async resolveSyncConflict(localItem, serverData) {
        // Automatic resolution based on strategy
        switch (this.conflictResolutionStrategy) {
            case 'client_wins':
                return { strategy: 'use_client' };
                
            case 'server_wins':
                return { strategy: 'use_server' };
                
            case 'merge':
                if (this.canMergeData(localItem.data, serverData)) {
                    return { strategy: 'merge' };
                } else {
                    return { strategy: 'manual' };
                }
                
            default:
                return { strategy: 'manual' };
        }
    }

    // Check if data can be automatically merged
    canMergeData(localData, serverData) {
        // Simple merge compatibility check
        if (typeof localData !== 'object' || typeof serverData !== 'object') {
            return false;
        }
        
        // Check for conflicting timestamps
        if (localData.timestamp && serverData.timestamp) {
            const timeDiff = Math.abs(
                new Date(localData.timestamp) - new Date(serverData.timestamp)
            );
            return timeDiff < 60000; // Within 1 minute
        }
        
        return true;
    }

    // Merge conflict data
    mergeConflictData(localData, serverData) {
        const merged = { ...serverData };
        
        // Merge non-conflicting fields
        Object.keys(localData).forEach(key => {
            if (!serverData.hasOwnProperty(key)) {
                merged[key] = localData[key];
            } else if (key === 'timestamp') {
                // Use the later timestamp
                merged[key] = new Date(localData[key]) > new Date(serverData[key]) 
                    ? localData[key] : serverData[key];
            }
        });
        
        // Add merge metadata
        merged.merge_metadata = {
            merged_at: new Date().toISOString(),
            local_timestamp: localData.timestamp,
            server_timestamp: serverData.timestamp,
            merge_strategy: 'automatic'
        };
        
        return merged;
    }

    // Present conflict to user
    presentConflictToUser(localItem, serverData) {
        const conflictUI = this.createConflictResolutionUI(localItem, serverData);
        document.body.appendChild(conflictUI);
    }

    // Create conflict resolution UI
    createConflictResolutionUI(localItem, serverData) {
        const overlay = document.createElement('div');
        overlay.className = 'conflict-resolution-overlay';
        overlay.innerHTML = `
            <div class="conflict-resolution-modal">
                <div class="modal-header">
                    <h3>🔄 Data Sync Conflict</h3>
                    <p>We found conflicting data that needs your attention.</p>
                </div>
                
                <div class="conflict-details">
                    <div class="conflict-side local">
                        <h4>Your Local Data</h4>
                        <div class="data-preview">
                            <div class="timestamp">Created: ${new Date(localItem.timestamp).toLocaleString()}</div>
                            <div class="data-summary">${this.summarizeData(localItem.data)}</div>
                        </div>
                    </div>
                    
                    <div class="conflict-side server">
                        <h4>Server Data</h4>
                        <div class="data-preview">
                            <div class="timestamp">Created: ${new Date(serverData.timestamp).toLocaleString()}</div>
                            <div class="data-summary">${this.summarizeData(serverData)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="resolution-options">
                    <button class="resolution-btn use-local" data-resolution="use_client">
                        Use My Data
                    </button>
                    <button class="resolution-btn use-server" data-resolution="use_server">
                        Use Server Data
                    </button>
                    <button class="resolution-btn merge" data-resolution="merge">
                        Merge Both
                    </button>
                </div>
                
                <div class="modal-footer">
                    <button class="cancel-btn">Resolve Later</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('resolution-btn')) {
                const resolution = e.target.dataset.resolution;
                this.resolveConflictManually(localItem, serverData, resolution);
                overlay.remove();
            } else if (e.target.classList.contains('cancel-btn')) {
                overlay.remove();
            }
        });
        
        return overlay;
    }

    // Resolve conflict manually
    async resolveConflictManually(localItem, serverData, resolution) {
        await this.handleSyncConflict(localItem, serverData, { strategy: resolution });
    }

    // Summarize data for conflict UI
    summarizeData(data) {
        if (data.responses) {
            const responseCount = Object.keys(data.responses).length;
            return `${responseCount} responses recorded`;
        } else if (data.location) {
            return `Location: ${data.location.latitude?.toFixed(4)}, ${data.location.longitude?.toFixed(4)}`;
        } else if (data.mood_scores) {
            return `Mood scores: PHQ-9: ${data.mood_scores.phq9}, GAD-7: ${data.mood_scores.gad7}`;
        }
        
        return 'Data entry';
    }

    // Force sync item (override server)
    async forceSyncItem(item) {
        const endpoint = this.getEndpointForDataType(item.dataType);
        
        try {
            const response = await fetch(endpoint, {
                method: 'PUT', // Use PUT to force update
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'X-Force-Update': 'true'
                },
                body: JSON.stringify(item.data)
            });
            
            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: `HTTP ${response.status}` };
            }
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Mark item as synced
    async markAsSynced(item) {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['responses'], 'readwrite');
                const store = transaction.objectStore('responses');
                
                item.synced = true;
                item.syncedAt = new Date().toISOString();
                
                store.put(item);
            }
        } catch (error) {
            console.error('Failed to mark item as synced:', error);
        }
    }

    // Remove from sync queue
    removeFromSyncQueue(itemId) {
        this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
    }

    // Clean up failed items
    cleanupFailedItems() {
        this.syncQueue = this.syncQueue.filter(item => 
            (item.retryCount || 0) < this.maxRetryAttempts
        );
    }

    // Setup periodic sync
    setupPeriodicSync() {
        // Sync every 5 minutes when online
        setInterval(() => {
            if (this.isOnline && this.syncQueue.length > 0) {
                this.syncOfflineData();
            }
        }, 5 * 60 * 1000);
        
        // Quick sync every 30 seconds for recent items
        setInterval(() => {
            if (this.isOnline) {
                this.quickSyncRecentItems();
            }
        }, 30 * 1000);
    }

    // Quick sync for recent items
    async quickSyncRecentItems() {
        const recentItems = this.syncQueue.filter(item => {
            const ageMinutes = (Date.now() - new Date(item.timestamp)) / (1000 * 60);
            return ageMinutes < 5; // Items from last 5 minutes
        });
        
        for (const item of recentItems.slice(0, 3)) { // Max 3 items per quick sync
            await this.attemptSync(item);
        }
    }

    // Attempt single sync
    async attemptSync(item) {
        if (!this.isOnline) return;
        
        try {
            const result = await this.syncSingleItem(item);
            if (result.success) {
                this.removeFromSyncQueue(item.id);
                await this.markAsSynced(item);
            }
        } catch (error) {
            console.error('Quick sync failed:', error);
        }
    }

    // Update connection status UI
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.className = `connection-status ${this.isOnline ? 'online' : 'offline'}`;
            statusElement.innerHTML = this.isOnline 
                ? '🟢 Online' 
                : '🔴 Offline';
        }
    }

    // Update sync status UI
    updateSyncStatus() {
        const syncElement = document.getElementById('sync-status');
        if (syncElement) {
            const pendingCount = this.syncQueue.length;
            
            let statusText = '';
            let statusClass = '';
            
            switch (this.syncStatus) {
                case 'syncing':
                    statusText = '🔄 Syncing...';
                    statusClass = 'syncing';
                    break;
                case 'error':
                    statusText = `❌ ${pendingCount} items need sync`;
                    statusClass = 'error';
                    break;
                case 'idle':
                    if (pendingCount > 0) {
                        statusText = `⏳ ${pendingCount} items pending`;
                        statusClass = 'pending';
                    } else {
                        statusText = '✅ All data synced';
                        statusClass = 'synced';
                    }
                    break;
            }
            
            syncElement.textContent = statusText;
            syncElement.className = `sync-status ${statusClass}`;
        }
    }

    // Update offline status UI
    updateOfflineStatus() {
        const offlineElement = document.getElementById('offline-status');
        if (offlineElement && !this.isOnline) {
            const pendingCount = this.syncQueue.length;
            offlineElement.innerHTML = `
                📱 Offline Mode Active
                <span class="pending-count">${pendingCount} items stored locally</span>
            `;
            offlineElement.style.display = 'block';
        } else if (offlineElement) {
            offlineElement.style.display = 'none';
        }
    }

    // Show offline notification
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📱</span>
                <span class="notification-text">You're now offline. Data will be saved locally and synced when connected.</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Show sync results
    showSyncResults(results) {
        if (results.successful === 0 && results.failed === 0) return;
        
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🔄</span>
                <span class="notification-text">
                    Sync completed: ${results.successful} successful, ${results.failed} failed
                    ${results.conflicts > 0 ? `, ${results.conflicts} conflicts` : ''}
                </span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Handle service worker messages
    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'BACKGROUND_SYNC':
                this.syncOfflineData();
                break;
            case 'CACHE_UPDATED':
                console.log('Offline cache updated');
                break;
            case 'SYNC_CONFLICT':
                this.handleSyncConflict(data.localItem, data.serverData);
                break;
        }
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    // Generate offline ID
    generateOfflineId() {
        return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Export offline data
    exportOfflineData() {
        return {
            syncQueue: this.syncQueue,
            syncStatus: this.syncStatus,
            lastSyncTime: this.lastSyncTime,
            pendingOperations: this.pendingOperations,
            offlineMetadata: {
                isOnline: this.isOnline,
                syncInProgress: this.syncInProgress,
                conflictResolutionStrategy: this.conflictResolutionStrategy,
                maxRetryAttempts: this.maxRetryAttempts
            },
            exportTimestamp: new Date().toISOString()
        };
    }

    // Manual sync trigger
    async manualSync() {
        if (!this.isOnline) {
            alert('Cannot sync while offline. Please check your connection.');
            return;
        }
        
        return await this.syncOfflineData();
    }

    // Clear synced data
    async clearSyncedData() {
        try {
            if (this.db) {
                const transaction = this.db.transaction(['responses'], 'readwrite');
                const store = transaction.objectStore('responses');
                const index = store.index('synced');
                const request = index.getAll(true);
                
                request.onsuccess = () => {
                    const syncedItems = request.result;
                    syncedItems.forEach(item => {
                        store.delete(item.id);
                    });
                };
            }
            
            // Clear localStorage fallback
            localStorage.removeItem('offline_data_fallback');
            
        } catch (error) {
            console.error('Failed to clear synced data:', error);
        }
    }

    // Get sync statistics
    getSyncStatistics() {
        return {
            totalPendingItems: this.syncQueue.length,
            syncStatus: this.syncStatus,
            lastSyncTime: this.lastSyncTime,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            retryableItems: this.syncQueue.filter(item => 
                (item.retryCount || 0) < this.maxRetryAttempts
            ).length,
            failedItems: this.syncQueue.filter(item => 
                (item.retryCount || 0) >= this.maxRetryAttempts
            ).length
        };
    }

    // Create offline status UI
    createOfflineStatusUI() {
        const container = document.createElement('div');
        container.className = 'offline-status-container';
        container.innerHTML = `
            <div id="connection-status" class="connection-status">
                🔄 Checking connection...
            </div>
            <div id="sync-status" class="sync-status">
                ⏳ Checking sync status...
            </div>
            <div id="offline-status" class="offline-status" style="display: none;">
                📱 Offline Mode
            </div>
            <button id="manual-sync-btn" class="manual-sync-btn" style="display: none;">
                🔄 Sync Now
            </button>
        `;
        
        // Add manual sync button listener
        container.querySelector('#manual-sync-btn').addEventListener('click', () => {
            this.manualSync();
        });
        
        return container;
    }
}

// Export for use in other modules
window.OfflineCapabilitySync = OfflineCapabilitySync;