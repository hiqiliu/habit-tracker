// ==================== 书架 - IndexedDB 数据库 ====================
const BOOKSHELF_DB_NAME = 'BookshelfDB';
const BOOKSHELF_DB_VERSION = 1;

function openBookshelfDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(BOOKSHELF_DB_NAME, BOOKSHELF_DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('books')) {
                const store = db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('addedAt', 'addedAt', { unique: false });
                store.createIndex('finishedAt', 'finishedAt', { unique: false });
            }
            if (!db.objectStoreNames.contains('notes')) {
                const store = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                store.createIndex('bookId', 'bookId', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
            if (!db.objectStoreNames.contains('readingLog')) {
                const store = db.createObjectStore('readingLog', { keyPath: 'id', autoIncrement: true });
                store.createIndex('bookId', 'bookId', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('bookDate', ['bookId', 'date'], { unique: false });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ==================== 书籍 CRUD ====================
async function addBook(book) {
    const db = await openBookshelfDB();
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const data = {
        title: book.title || '',
        author: book.author || '',
        category: book.category || '其他',
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage || 0,
        status: book.status || 'to_read', // to_read | reading | finished
        rating: book.rating || 0,
        review: book.review || '',
        cover: book.cover || null,
        startedAt: book.startedAt || null,
        finishedAt: book.finishedAt || null,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    store.add(data);
    const result = await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(data);
        tx.onerror = () => reject(tx.error);
    });
    db.close();
    return result;
}

async function updateBook(id, updates) {
    const db = await openBookshelfDB();
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const existing = await new Promise(r => {
        const req = store.get(id);
        req.onsuccess = () => r(req.result);
    });
    if (existing) {
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
        store.put(updated);
        await new Promise(r => { tx.oncomplete = () => r(); });
        db.close();
        return updated;
    }
    db.close();
    return null;
}

async function deleteBook(id) {
    const db = await openBookshelfDB();
    // Delete book
    let tx = db.transaction('books', 'readwrite');
    tx.objectStore('books').delete(id);
    await new Promise(r => { tx.oncomplete = () => r(); });
    // Delete associated notes
    const notes = await getBookNotes(id);
    if (notes.length > 0) {
        tx = db.transaction('notes', 'readwrite');
        const ns = tx.objectStore('notes');
        notes.forEach(n => ns.delete(n.id));
        await new Promise(r => { tx.oncomplete = () => r(); });
    }
    // Delete reading logs
    const logs = await getReadingLogs(id);
    if (logs.length > 0) {
        tx = db.transaction('readingLog', 'readwrite');
        const ls = tx.objectStore('readingLog');
        logs.forEach(l => ls.delete(l.id));
        await new Promise(r => { tx.oncomplete = () => r(); });
    }
    db.close();
}

async function getBook(id) {
    const db = await openBookshelfDB();
    const tx = db.transaction('books', 'readonly');
    const book = await new Promise(r => {
        const req = tx.objectStore('books').get(id);
        req.onsuccess = () => r(req.result);
    });
    db.close();
    return book;
}

async function getAllBooks() {
    const db = await openBookshelfDB();
    const tx = db.transaction('books', 'readonly');
    const books = await new Promise(r => {
        const req = tx.objectStore('books').getAll();
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return books.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

async function getBooksByStatus(status) {
    const all = await getAllBooks();
    return all.filter(b => b.status === status);
}

// ==================== 阅读笔记 ====================
async function addBookNote(bookId, content) {
    const db = await openBookshelfDB();
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    const note = {
        bookId: bookId,
        content: content,
        createdAt: new Date().toISOString()
    };
    store.add(note);
    const result = await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(note);
        tx.onerror = () => reject(tx.error);
    });
    db.close();
    return result;
}

async function deleteBookNote(noteId) {
    const db = await openBookshelfDB();
    const tx = db.transaction('notes', 'readwrite');
    tx.objectStore('notes').delete(noteId);
    await new Promise(r => { tx.oncomplete = () => r(); });
    db.close();
}

async function getBookNotes(bookId) {
    const db = await openBookshelfDB();
    const tx = db.transaction('notes', 'readonly');
    const index = tx.objectStore('notes').index('bookId');
    const notes = await new Promise(r => {
        const req = index.getAll(bookId);
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ==================== 阅读记录（打卡） ====================
async function logReading(bookId, pagesRead) {
    const db = await openBookshelfDB();
    const tx = db.transaction('readingLog', 'readwrite');
    const store = tx.objectStore('readingLog');
    const today = new Date().toISOString().split('T')[0];
    const log = {
        bookId: bookId,
        date: today,
        pagesRead: pagesRead || 0,
        createdAt: new Date().toISOString()
    };
    store.add(log);
    await new Promise(r => { tx.oncomplete = () => r(); });
    db.close();

    // Update book current page
    const book = await getBook(bookId);
    if (book) {
        const newPage = Math.min(book.currentPage + (pagesRead || 0), book.totalPages);
        await updateBook(bookId, { currentPage: newPage });
        // Auto check-in to habit "阅读"
        await checkInReadingHabit(today);
    }
}

async function getReadingLogs(bookId) {
    const db = await openBookshelfDB();
    const tx = db.transaction('readingLog', 'readonly');
    const index = tx.objectStore('readingLog').index('bookId');
    const logs = await new Promise(r => {
        const req = index.getAll(bookId);
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return logs.sort((a, b) => b.date.localeCompare(a.date));
}

async function getReadingLogsByDate(date) {
    const db = await openBookshelfDB();
    const tx = db.transaction('readingLog', 'readonly');
    const index = tx.objectStore('readingLog').index('date');
    const logs = await new Promise(r => {
        const req = index.getAll(date);
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return logs;
}

// ==================== 自动打卡到习惯"阅读" ====================
async function checkInReadingHabit(dateStr) {
    // Find or create a habit called "阅读"
    const readingHabit = items.find(i => i.type === 'habit' && i.title === '阅读');
    if (readingHabit) {
        if (!readingHabit.checks) readingHabit.checks = [];
        if (!readingHabit.checks.includes(dateStr)) {
            readingHabit.checks.push(dateStr);
            saveItems();
        }
    }
}

// ==================== 年度统计 ====================
async function getYearlyStats(year) {
    const books = await getAllBooks();
    const yearBooks = books.filter(b => {
        if (b.status === 'finished' && b.finishedAt) return b.finishedAt.startsWith(year);
        if (b.status === 'reading' && b.startedAt) return b.startedAt.startsWith(year);
        return b.addedAt.startsWith(year);
    });

    const finished = yearBooks.filter(b => b.status === 'finished');
    const reading = yearBooks.filter(b => b.status === 'reading');
    const toRead = yearBooks.filter(b => b.status === 'to_read');

    // Category distribution
    const categoryMap = {};
    finished.forEach(b => {
        categoryMap[b.category] = (categoryMap[b.category] || 0) + 1;
    });

    // Total pages read
    const totalPages = finished.reduce((sum, b) => sum + (b.totalPages || 0), 0);

    // Average rating
    const rated = finished.filter(b => b.rating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1) : 0;

    // Monthly reading count
    const monthlyMap = {};
    finished.forEach(b => {
        if (b.finishedAt) {
            const month = b.finishedAt.substring(0, 7);
            monthlyMap[month] = (monthlyMap[month] || 0) + 1;
        }
    });

    return {
        year: year,
        totalFinished: finished.length,
        totalReading: reading.length,
        totalToRead: toRead.length,
        totalPages: totalPages,
        avgRating: avgRating,
        categoryMap: categoryMap,
        monthlyMap: monthlyMap,
        books: yearBooks
    };
}

// ==================== 书籍分类配置 ====================
const BOOK_CATEGORIES = {
    '小说': { icon: 'fa-book', color: '#6366f1' },
    '非虚构': { icon: 'fa-graduation-cap', color: '#10b981' },
    '技术': { icon: 'fa-code', color: '#f59e0b' },
    '历史': { icon: 'fa-landmark', color: '#8b5cf6' },
    '哲学': { icon: 'fa-brain', color: '#ec4899' },
    '心理': { icon: 'fa-heart', color: '#ef4444' },
    '经济': { icon: 'fa-chart-line', color: '#14b8a6' },
    '科学': { icon: 'fa-flask', color: '#3b82f6' },
    '艺术': { icon: 'fa-palette', color: '#f97316' },
    '传记': { icon: 'fa-user', color: '#6b7280' },
    '其他': { icon: 'fa-bookmark', color: '#a855f7' }
};

const BOOK_STATUS_CONFIG = {
    'to_read': { label: '待阅读', icon: 'fa-clock', color: '#f59e0b' },
    'reading': { label: '阅读中', icon: 'fa-book-open', color: '#6366f1' },
    'finished': { label: '已完成', icon: 'fa-check-circle', color: '#22c55e' }
};