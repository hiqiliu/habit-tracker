// ==================== 五年日记 - IndexedDB 数据库 ====================
const DIARY_DB_NAME = 'FiveYearDiary';
const DIARY_DB_VERSION = 1;

// 打开/创建数据库
function openDiaryDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DIARY_DB_NAME, DIARY_DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // 日记本存储
            if (!db.objectStoreNames.contains('notebooks')) {
                const store = db.createObjectStore('notebooks', { keyPath: 'id' });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
            
            // 日记条目存储
            if (!db.objectStoreNames.contains('entries')) {
                const store = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                store.createIndex('notebookId', 'notebookId', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('mood', 'mood', { unique: false });
                store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                // 复合索引：按日记本+日期查询
                store.createIndex('notebookDate', ['notebookId', 'date'], { unique: false });
            }
        };
        
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ==================== 笔记本操作 ====================
async function createNotebook(name) {
    const db = await openDiaryDB();
    const tx = db.transaction('notebooks', 'readwrite');
    const store = tx.objectStore('notebooks');
    
    const notebook = {
        id: 'nb_' + Date.now(),
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entryCount: 0
    };
    
    store.add(notebook);
    const result = await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(notebook);
        tx.onerror = () => reject(tx.error);
    });
    db.close();
    return result;
}

async function getNotebooks() {
    const db = await openDiaryDB();
    const tx = db.transaction('notebooks', 'readonly');
    const store = tx.objectStore('notebooks');
    const notebooks = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
    db.close();
    // 按创建时间降序
    notebooks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return notebooks;
}

async function deleteNotebook(notebookId) {
    const db = await openDiaryDB();
    
    // 删除笔记本
    let tx1 = db.transaction('notebooks', 'readwrite');
    tx1.objectStore('notebooks').delete(notebookId);
    await new Promise((resolve, reject) => {
        tx1.oncomplete = () => resolve();
        tx1.onerror = () => reject(tx1.error);
    });
    
    // 删除所有关联条目
    const entries = await getEntries(notebookId);
    if (entries.length > 0) {
        let tx2 = db.transaction('entries', 'readwrite');
        const entryStore = tx2.objectStore('entries');
        for (const entry of entries) {
            entryStore.delete(entry.id);
        }
        await new Promise((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
        });
    }
    
    db.close();
}

// ==================== 日记条目操作 ====================
async function saveEntry(notebookId, entry) {
    const db = await openDiaryDB();
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    
    const now = new Date().toISOString();
    const data = {
        notebookId: notebookId,
        date: entry.date,               // 'YYYY-MM-DD'
        year: entry.date.split('-')[0],  // 提取年份
        month: parseInt(entry.date.split('-')[1]),
        day: parseInt(entry.date.split('-')[2]),
        mood: entry.mood || '',          // 心情类型: happy/sad/angry/calm/anxious/love
        moodNote: entry.moodNote || '',  // 心情备注
        weather: entry.weather || '',    // 天气
        location: entry.location || '',
        content: entry.content || '',
        photo: entry.photo || null,       // base64 原图
        thumbnail: entry.thumbnail || null, // base64 缩略图
        tags: entry.tags || [],
        updatedAt: now
    };
    
    if (entry.id) {
        data.id = entry.id;
        store.put(data);
    } else {
        data.createdAt = now;
        store.add(data);
    }
    
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(data);
        tx.onerror = () => reject(tx.error);
    });
    
    // 更新笔记本条目计数
    updateNotebookEntryCount(notebookId);
    
    db.close();
    return data;
}

async function getEntry(entryId) {
    const db = await openDiaryDB();
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const entry = await new Promise((resolve, reject) => {
        const req = store.get(entryId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return entry;
}

async function getEntries(notebookId) {
    const db = await openDiaryDB();
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const index = store.index('notebookId');
    
    const entries = await new Promise((resolve, reject) => {
        const req = index.getAll(notebookId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return entries;
}

// 获取某日记本某日的所有历史记录（五年对比用）
async function getEntriesByDate(notebookId, month, day) {
    const allEntries = await getEntries(notebookId);
    return allEntries.filter(e => e.month === month && e.day === day);
}

// 搜索日记
async function searchEntries(notebookId, keyword, moodFilter, tagFilter) {
    let entries = await getEntries(notebookId);
    
    if (keyword) {
        const kw = keyword.toLowerCase();
        entries = entries.filter(e => 
            (e.content && e.content.toLowerCase().includes(kw)) ||
            (e.location && e.location.toLowerCase().includes(kw)) ||
            (e.moodNote && e.moodNote.toLowerCase().includes(kw))
        );
    }
    
    if (moodFilter) {
        entries = entries.filter(e => e.mood === moodFilter);
    }
    
    if (tagFilter && tagFilter.length > 0) {
        entries = entries.filter(e => 
            e.tags && e.tags.some(t => tagFilter.includes(t))
        );
    }
    
    // 按日期降序
    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
}

// 获取最近N天的日记
async function getRecentEntries(notebookId, days = 30) {
    const all = await getEntries(notebookId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    
    return all.filter(e => e.date >= cutoffStr).sort((a, b) => b.date.localeCompare(a.date));
}

async function deleteEntry(entryId) {
    const db = await openDiaryDB();
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    
    // 先获取条目，找到 notebookId
    const entry = await new Promise(r => {
        const req = store.get(entryId);
        req.onsuccess = () => r(req.result);
    });
    
    store.delete(entryId);
    await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    db.close();
    
    if (entry) updateNotebookEntryCount(entry.notebookId);
}

async function updateNotebookEntryCount(notebookId) {
    const entries = await getEntries(notebookId);
    const db = await openDiaryDB();
    const tx = db.transaction('notebooks', 'readwrite');
    const store = tx.objectStore('notebooks');
    const notebook = await new Promise(r => {
        const req = store.get(notebookId);
        req.onsuccess = () => r(req.result);
    });
    if (notebook) {
        notebook.entryCount = entries.length;
        notebook.updatedAt = new Date().toISOString();
        store.put(notebook);
    }
    await new Promise(r => { tx.oncomplete = () => r(); });
    db.close();
}

// 获取所有标签
async function getAllTags(notebookId) {
    const entries = await getEntries(notebookId);
    const tagSet = new Set();
    entries.forEach(e => {
        if (e.tags) e.tags.forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
}

// ==================== 图片压缩 ====================
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = height * maxWidth / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = width * maxHeight / height;
                    height = maxHeight;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== 导出备份 ====================
async function exportDiaryBackup() {
    const notebooks = await getNotebooks();
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        notebooks: []
    };
    
    for (const nb of notebooks) {
        const entries = await getEntries(nb.id);
        backup.notebooks.push({
            id: nb.id,
            name: nb.name,
            createdAt: nb.createdAt,
            entries: entries.map(e => ({
                date: e.date,
                mood: e.mood,
                moodNote: e.moodNote,
                weather: e.weather,
                location: e.location,
                content: e.content,
                photo: e.photo,
                thumbnail: e.thumbnail,
                tags: e.tags
            }))
        });
    }
    
    return backup;
}

// ==================== 导入备份 ====================
async function importDiaryBackup(backup) {
    if (!backup || !backup.notebooks) return;
    
    for (const nb of backup.notebooks) {
        // Create notebook with same ID if not exists
        const db = await openDiaryDB();
        const tx = db.transaction('notebooks', 'readwrite');
        const store = tx.objectStore('notebooks');
        
        const existing = await new Promise(r => {
            const req = store.get(nb.id);
            req.onsuccess = () => r(req.result);
        });
        
        if (!existing) {
            store.add({
                id: nb.id,
                name: nb.name,
                createdAt: nb.createdAt,
                updatedAt: new Date().toISOString(),
                entryCount: nb.entries ? nb.entries.length : 0
            });
        }
        await new Promise(r => { tx.oncomplete = () => r(); });
        db.close();
        
        // Add entries
        if (nb.entries && nb.entries.length > 0) {
            for (const entry of nb.entries) {
                await saveEntry(nb.id, entry);
            }
        }
    }
}

// ==================== 天气图标映射 ====================
const WEATHER_ICONS = {
    '晴': '☀️', '多云': '⛅', '阴': '☁️', '雨': '🌧️',
    '雪': '❄️', '雾': '🌫️', '雷': '⛈️', '风': '🌬️'
};

const MOOD_CONFIG = {
    'happy': { emoji: '😊', color: '#f59e0b', label: '开心' },
    'love': { emoji: '🥰', color: '#ec4899', label: '甜蜜' },
    'calm': { emoji: '😌', color: '#10b981', label: '平静' },
    'anxious': { emoji: '😰', color: '#8b5cf6', label: '焦虑' },
    'sad': { emoji: '😢', color: '#3b82f6', label: '难过' },
    'angry': { emoji: '😤', color: '#ef4444', label: '生气' },
    'tired': { emoji: '😴', color: '#6b7280', label: '疲惫' },
    'excited': { emoji: '🤩', color: '#f97316', label: '兴奋' }
};