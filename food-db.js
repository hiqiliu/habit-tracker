// ==================== 饮食日记 - IndexedDB 数据库 ====================
const FOOD_DB_NAME = 'FoodDiaryDB';
const FOOD_DB_VERSION = 1;

function openFoodDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(FOOD_DB_NAME, FOOD_DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('meals')) {
                const store = db.createObjectStore('meals', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('month', 'month', { unique: false });
                store.createIndex('selfCooked', 'selfCooked', { unique: false });
                store.createIndex('location', 'location', { unique: false });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ==================== 用餐类型配置 ====================
const MEAL_TYPES = {
    'breakfast': { label: '早餐', icon: 'fa-sun', color: '#f59e0b', time: '07:00' },
    'lunch': { label: '午餐', icon: 'fa-cloud-sun', color: '#f97316', time: '12:00' },
    'dinner': { label: '晚餐', icon: 'fa-moon', color: '#6366f1', time: '18:00' },
    'snack': { label: '加餐', icon: 'fa-cookie-bite', color: '#ec4899', time: '15:00' }
};

const COOKED_OPTIONS = {
    'self': { label: '自己做', icon: 'fa-home', color: '#22c55e' },
    'outside': { label: '外食', icon: 'fa-utensils', color: '#f59e0b' },
    'delivery': { label: '外卖', icon: 'fa-motorcycle', color: '#3b82f6' },
    'other': { label: '其他', icon: 'fa-ellipsis-h', color: '#6b7280' }
};

// ==================== 用餐记录 CRUD ====================
async function addMeal(meal) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readwrite');
    const store = tx.objectStore('meals');
    const data = {
        date: meal.date || getToday(),
        time: meal.time || '',
        mealType: meal.mealType || 'lunch',
        selfCooked: meal.selfCooked || 'self',
        location: meal.location || '',
        companion: meal.companion || '',
        rating: meal.rating || 0,
        tags: meal.tags || [],
        content: meal.content || '',
        photo: meal.photo || null,
        thumbnail: meal.thumbnail || null,
        createdAt: new Date().toISOString()
    };
    store.add(data);
    const result = await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(data);
        tx.onerror = () => reject(tx.error);
    });
    db.close();
    return result;
}

async function updateMeal(id, updates) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readwrite');
    const store = tx.objectStore('meals');
    const existing = await new Promise(r => {
        const req = store.get(id);
        req.onsuccess = () => r(req.result);
    });
    if (existing) {
        const updated = { ...existing, ...updates };
        store.put(updated);
        await new Promise(r => { tx.oncomplete = () => r(); });
        db.close();
        return updated;
    }
    db.close();
    return null;
}

async function deleteMeal(id) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readwrite');
    tx.objectStore('meals').delete(id);
    await new Promise(r => { tx.oncomplete = () => r(); });
    db.close();
}

async function getMeal(id) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readonly');
    const meal = await new Promise(r => {
        const req = tx.objectStore('meals').get(id);
        req.onsuccess = () => r(req.result);
    });
    db.close();
    return meal;
}

async function getMealsByDate(date) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readonly');
    const index = tx.objectStore('meals').index('date');
    const meals = await new Promise(r => {
        const req = index.getAll(date);
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return meals.sort((a, b) => {
        const order = ['breakfast', 'lunch', 'snack', 'dinner'];
        return order.indexOf(a.mealType) - order.indexOf(b.mealType);
    });
}

async function getMealsByMonth(month) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readonly');
    const meals = await new Promise(r => {
        const req = tx.objectStore('meals').getAll();
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return meals.filter(m => m.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
}

async function getRecentMeals(days) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readonly');
    const meals = await new Promise(r => {
        const req = tx.objectStore('meals').getAll();
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return meals.filter(m => m.date >= cutoffStr).sort((a, b) => b.date.localeCompare(a.date));
}

// ==================== 月度统计 ====================
async function getFoodStats(month) {
    const meals = await getMealsByMonth(month);
    
    const total = meals.length;
    const selfCooked = meals.filter(m => m.selfCooked === 'self').length;
    const outside = meals.filter(m => m.selfCooked === 'outside').length;
    const delivery = meals.filter(m => m.selfCooked === 'delivery').length;
    
    // 地点排行
    const locationMap = {};
    meals.forEach(m => {
        if (m.location) locationMap[m.location] = (locationMap[m.location] || 0) + 1;
    });
    const topLocations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // 同伴排行
    const companionMap = {};
    meals.forEach(m => {
        if (m.companion) companionMap[m.companion] = (companionMap[m.companion] || 0) + 1;
    });
    const topCompanions = Object.entries(companionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    // 平均评分
    const rated = meals.filter(m => m.rating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((s, m) => s + m.rating, 0) / rated.length).toFixed(1) : 0;
    
    // 每日用餐数
    const dailyMap = {};
    meals.forEach(m => { dailyMap[m.date] = (dailyMap[m.date] || 0) + 1; });
    const avgPerDay = Object.keys(dailyMap).length > 0 ? (total / Object.keys(dailyMap).length).toFixed(1) : 0;
    
    return {
        month, total, selfCooked, outside, delivery,
        topLocations, topCompanions, avgRating, avgPerDay,
        selfCookedPct: total > 0 ? Math.round(selfCooked / total * 100) : 0
    };
}

// ==================== 导出备份 ====================
async function exportFoodBackup() {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readonly');
    const meals = await new Promise(r => {
        const req = tx.objectStore('meals').getAll();
        req.onsuccess = () => r(req.result || []);
    });
    db.close();
    return { version: 1, exportedAt: new Date().toISOString(), meals };
}

// ==================== 导入备份 ====================
async function importFoodBackup(backup) {
    if (!backup || !backup.meals) return;
    const db = await openFoodDB();
    for (const meal of backup.meals) {
        const tx = db.transaction('meals', 'readwrite');
        tx.objectStore('meals').add(meal);
        await new Promise(r => { tx.oncomplete = () => r(); });
    }
    db.close();
}