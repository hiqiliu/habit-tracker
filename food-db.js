// ==================== 健康日记 - IndexedDB 数据库 ====================
const FOOD_DB_NAME = 'FoodDiaryDB';
const FOOD_DB_VERSION = 2;

function openFoodDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(FOOD_DB_NAME, FOOD_DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const oldVersion = event.oldVersion;

            if (!db.objectStoreNames.contains('meals')) {
                const store = db.createObjectStore('meals', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('month', 'month', { unique: false });
                store.createIndex('category', 'category', { unique: false });
            } else if (oldVersion < 2) {
                // Migration: add category index to existing store
                const store = event.target.transaction.objectStore('meals');
                if (!store.indexNames.contains('category')) {
                    store.createIndex('category', 'category', { unique: false });
                }
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ==================== 健康分类配置 ====================
const HEALTH_CATEGORIES = {
    'meal':   { label: '饮食',   icon: 'fa-utensils',     color: '#f59e0b', emoji: '\u{1F37D}\u{FE0F}' },
    'water':  { label: '饮水',   icon: 'fa-droplet',      color: '#3b82f6', emoji: '\u{1F4A7}' },
    'coffee': { label: '咖啡/茶', icon: 'fa-mug-hot',     color: '#92400e', emoji: '\u{2615}' },
    'bowel':  { label: '排泄',   icon: 'fa-toilet',       color: '#22c55e', emoji: '\u{1F6BD}' },
    'care':   { label: '护理',   icon: 'fa-spa',          color: '#ec4899', emoji: '\u{1F6C0}' },
    'sleep':  { label: '睡眠',   icon: 'fa-bed',          color: '#6366f1', emoji: '\u{1F634}' }
};

// ==================== 用餐类型配置 (仅用于 meal 分类) ====================
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

// ==================== 睡眠评价 ====================
const SLEEP_QUALITY_LABELS = {
    1: '很差',
    2: '一般',
    3: '尚可',
    4: '不错',
    5: '很好'
};

// ==================== 健康记录 CRUD ====================
async function addMeal(meal) {
    const db = await openFoodDB();
    const tx = db.transaction('meals', 'readwrite');
    const store = tx.objectStore('meals');

    // Determine category (backward compatibility)
    const category = meal.category || 'meal';

    const data = {
        date: meal.date || getToday(),
        time: meal.time || '',
        category: category,
        amount: meal.amount || null,
        // Meal-specific fields
        mealType: meal.mealType || 'lunch',
        selfCooked: meal.selfCooked || 'self',
        location: meal.location || '',
        companion: meal.companion || '',
        rating: meal.rating || 0,
        tags: meal.tags || [],
        content: meal.content || '',
        note: meal.note || '',
        // Sleep-specific fields
        bedTime: meal.bedTime || '',
        wakeTime: meal.wakeTime || '',
        quality: meal.quality || 0,
        // Photo (meal only)
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
    // Sort by time, then by category order
    const catOrder = ['sleep', 'meal', 'water', 'coffee', 'bowel', 'care'];
    return meals.sort((a, b) => {
        const timeA = a.time || '';
        const timeB = b.time || '';
        if (timeA !== timeB) return timeA.localeCompare(timeB);
        return catOrder.indexOf(a.category || 'meal') - catOrder.indexOf(b.category || 'meal');
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

// ==================== 统计 ====================
async function getFoodStats(month) {
    const meals = await getMealsByMonth(month);

    const total = meals.length;
    const mealRecords = meals.filter(m => m.category === 'meal' || !m.category);
    const selfCooked = mealRecords.filter(m => m.selfCooked === 'self').length;
    const outside = mealRecords.filter(m => m.selfCooked === 'outside').length;
    const delivery = mealRecords.filter(m => m.selfCooked === 'delivery').length;

    // 地点排行
    const locationMap = {};
    mealRecords.forEach(m => {
        if (m.location) locationMap[m.location] = (locationMap[m.location] || 0) + 1;
    });
    const topLocations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 同伴排行
    const companionMap = {};
    mealRecords.forEach(m => {
        if (m.companion) companionMap[m.companion] = (companionMap[m.companion] || 0) + 1;
    });
    const topCompanions = Object.entries(companionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 平均评分
    const rated = mealRecords.filter(m => m.rating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((s, m) => s + m.rating, 0) / rated.length).toFixed(1) : 0;

    // 每日用餐数
    const dailyMap = {};
    mealRecords.forEach(m => { dailyMap[m.date] = (dailyMap[m.date] || 0) + 1; });
    const avgPerDay = Object.keys(dailyMap).length > 0 ? (mealRecords.length / Object.keys(dailyMap).length).toFixed(1) : 0;

    // 饮水统计
    const waterRecords = meals.filter(m => m.category === 'water');
    const totalWater = waterRecords.reduce((s, m) => s + (parseInt(m.amount) || 0), 0);
    const avgWater = waterRecords.length > 0 ? Math.round(totalWater / waterRecords.length) : 0;

    // 咖啡统计
    const coffeeRecords = meals.filter(m => m.category === 'coffee');
    const totalCoffee = coffeeRecords.reduce((s, m) => s + (parseInt(m.amount) || 0), 0);

    // 睡眠统计
    const sleepRecords = meals.filter(m => m.category === 'sleep');
    let totalSleepHours = 0;
    let sleepCount = 0;
    sleepRecords.forEach(s => {
        if (s.bedTime && s.wakeTime) {
            const duration = calcSleepDuration(s.bedTime, s.wakeTime);
            if (duration > 0) {
                totalSleepHours += duration;
                sleepCount++;
            }
        }
    });
    const avgSleep = sleepCount > 0 ? (totalSleepHours / sleepCount).toFixed(1) : 0;

    // 护理统计
    const careRecords = meals.filter(m => m.category === 'care');
    const careCount = careRecords.length;

    // 排泄统计
    const bowelRecords = meals.filter(m => m.category === 'bowel');
    const bowelCount = bowelRecords.length;
    const bowelDays = new Set(bowelRecords.map(m => m.date)).size;

    return {
        month, total, selfCooked, outside, delivery,
        avgRating, avgPerDay,
        selfCookedPct: mealRecords.length > 0 ? Math.round(selfCooked / mealRecords.length * 100) : 0,
        totalWater, avgWater,
        totalCoffee,
        avgSleep, sleepCount,
        careCount,
        bowelCount, bowelDays
    };
}

function calcSleepDuration(bedTime, wakeTime) {
    const [bh, bm] = bedTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let start = bh * 60 + bm;
    let end = wh * 60 + wm;
    if (end < start) end += 24 * 60;
    return (end - start) / 60;
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
    return { version: 2, exportedAt: new Date().toISOString(), meals };
}

// ==================== 导入备份 ====================
async function importFoodBackup(backup) {
    if (!backup || !backup.meals) return;
    const db = await openFoodDB();
    for (const meal of backup.meals) {
        const tx = db.transaction('meals', 'readwrite');
        // Migrate old records: ensure category field exists
        if (!meal.category) meal.category = 'meal';
        tx.objectStore('meals').add(meal);
        await new Promise(r => { tx.oncomplete = () => r(); });
    }
    db.close();
}
