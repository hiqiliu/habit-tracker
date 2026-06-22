// ==================== 积分 & 心愿兑换系统 ====================

// 默认积分规则
const DEFAULT_POINTS_CONFIG = {
    habitCheckIn: 5,        // 习惯打卡
    todoComplete: 3,         // 待办完成
    logRecord: 4,            // 记录型打卡
    scheduleComplete: 10,    // 课表完成一课
    readingCheckIn: 8,       // 阅读打卡
    dailyFirstBonus: 3,     // 每日首次打卡加成
    streak7: 20,             // 连续7天奖励
    streak30: 100,           // 连续30天奖励
    streak90: 300,           // 连续90天奖励
    foodLog: 2               // 饮食记录
};

// 积分规则标签（用于UI显示）
const POINTS_RULE_LABELS = {
    habitCheckIn: '习惯打卡',
    todoComplete: '待办完成',
    logRecord: '记录型打卡',
    scheduleComplete: '课表完成',
    readingCheckIn: '阅读打卡',
    dailyFirstBonus: '每日首次加成',
    streak7: '连续7天奖励',
    streak30: '连续30天奖励',
    streak90: '连续90天奖励',
    foodLog: '饮食记录'
};

// 获取积分规则（支持自定义，自动合并新增字段）
function getPointsConfig() {
    const saved = localStorage.getItem('ht_points_config');
    if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_POINTS_CONFIG, ...parsed };
    }
    return { ...DEFAULT_POINTS_CONFIG };
}

// 保存积分规则
function savePointsConfig(config) {
    localStorage.setItem('ht_points_config', JSON.stringify(config));
}

// 重置积分规则为默认
function resetPointsConfig() {
    localStorage.removeItem('ht_points_config');
}

// 获取当前积分规则（兼容旧代码中的 POINTS_CONFIG 引用）
let POINTS_CONFIG = getPointsConfig();

// 心愿分类
const WISH_CATEGORIES = {
    'small': { label: '小愿望', icon: 'fa-star', color: '#f59e0b', maxPoints: 100 },
    'medium': { label: '中愿望', icon: 'fa-gift', color: '#6366f1', minPoints: 100, maxPoints: 500 },
    'big': { label: '大愿望', icon: 'fa-crown', color: '#ec4899', minPoints: 500 }
};

// ==================== 积分数据管理 ====================
function getPointsData() {
    return JSON.parse(localStorage.getItem('ht_points') || JSON.stringify({
        total: 0,
        spent: 0,
        history: [],       // [{date, type, points, desc}]
        streakDays: 0,
        lastCheckInDate: null,
        dailyFirstDone: false
    }));
}

function savePointsData(data) {
    localStorage.setItem('ht_points', JSON.stringify(data));
}

// 获取可用积分
function getAvailablePoints() {
    const data = getPointsData();
    return data.total - data.spent;
}

// 添加积分
function addPoints(type, points, desc) {
    const data = getPointsData();
    const today = getToday();
    
    // 每日首次加成
    if (!data.dailyFirstDone || data.dailyFirstDone !== today) {
        data.dailyFirstDone = today;
        data.history.push({ date: today, type: 'daily_first', points: POINTS_CONFIG.dailyFirstBonus, desc: '每日首次打卡加成' });
        data.total += POINTS_CONFIG.dailyFirstBonus;
    }
    
    data.total += points;
    data.history.push({ date: today, type: type, points: points, desc: desc });
    
    // 计算连续打卡天数
    updateStreak(data, today);
    
    savePointsData(data);
    updatePointsDisplay();
    return data;
}

// 消耗积分（兑换心愿）
function spendPoints(points, desc) {
    const data = getPointsData();
    if (getAvailablePoints() < points) return false;
    data.spent += points;
    data.history.push({ date: getToday(), type: 'redeem', points: -points, desc: desc });
    savePointsData(data);
    updatePointsDisplay();
    return true;
}

// 更新连续打卡天数
function updateStreak(data, today) {
    if (data.lastCheckInDate === today) return; // 今天已更新
    
    if (data.lastCheckInDate) {
        const last = new Date(data.lastCheckInDate);
        const curr = new Date(today);
        const diff = Math.floor((curr - last) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
            data.streakDays += 1;
        } else if (diff > 1) {
            data.streakDays = 1;
        }
    } else {
        data.streakDays = 1;
    }
    
    data.lastCheckInDate = today;
    
    // 连续打卡奖励
    if (data.streakDays === 7) {
        data.total += POINTS_CONFIG.streak7;
        data.history.push({ date: today, type: 'streak', points: POINTS_CONFIG.streak7, desc: '连续打卡7天奖励' });
    } else if (data.streakDays === 30) {
        data.total += POINTS_CONFIG.streak30;
        data.history.push({ date: today, type: 'streak', points: POINTS_CONFIG.streak30, desc: '连续打卡30天奖励' });
    } else if (data.streakDays === 90) {
        data.total += POINTS_CONFIG.streak90;
        data.history.push({ date: today, type: 'streak', points: POINTS_CONFIG.streak90, desc: '连续打卡90天奖励' });
    }
}

// 获取积分趋势（按天汇总）
function getPointsTrend(days) {
    const data = getPointsData();
    const trend = {};
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    data.history.forEach(h => {
        if (h.date >= cutoff.toISOString().split('T')[0]) {
            trend[h.date] = (trend[h.date] || 0) + h.points;
        }
    });
    
    return Object.entries(trend).sort((a, b) => a[0].localeCompare(b[0]));
}

// 获取本周/本月积分
function getPointsPeriod(period) {
    const data = getPointsData();
    const now = new Date();
    let start;
    
    if (period === 'week') {
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const startStr = start.toISOString().split('T')[0];
    return data.history
        .filter(h => h.date >= startStr && h.points > 0)
        .reduce((sum, h) => sum + h.points, 0);
}

// ==================== 心愿管理 ====================
function getWishes() {
    return JSON.parse(localStorage.getItem('ht_wishes') || '[]');
}

function saveWishes(wishes) {
    localStorage.setItem('ht_wishes', JSON.stringify(wishes));
}

function addWish(wish) {
    const wishes = getWishes();
    wish.id = 'wish_' + Date.now();
    wish.createdAt = new Date().toISOString();
    wish.status = 'pending'; // pending | redeemed
    wish.redeemedAt = null;
    wishes.push(wish);
    saveWishes(wishes);
    return wish;
}

function redeemWish(id) {
    const wishes = getWishes();
    const wish = wishes.find(w => w.id === id);
    if (!wish) return false;
    
    const available = getAvailablePoints();
    if (available < wish.points) return false;
    
    spendPoints(wish.points, '兑换心愿: ' + wish.name);
    wish.status = 'redeemed';
    wish.redeemedAt = new Date().toISOString();
    saveWishes(wishes);
    return true;
}

function deleteWish(id) {
    const wishes = getWishes().filter(w => w.id !== id);
    saveWishes(wishes);
}

function updateWish(id, updates) {
    const wishes = getWishes();
    const wish = wishes.find(w => w.id === id);
    if (wish) {
        Object.assign(wish, updates);
        saveWishes(wishes);
    }
}

// ==================== UI 更新（全局积分显示） ====================
function updatePointsDisplay() {
    const el = document.getElementById('points-badge');
    if (el) {
        el.textContent = getAvailablePoints();
    }
}

// 获取下一个连续打卡奖励
function getNextStreakReward() {
    const data = getPointsData();
    if (data.streakDays < 7) return { days: 7, points: POINTS_CONFIG.streak7, label: '7天' };
    if (data.streakDays < 30) return { days: 30, points: POINTS_CONFIG.streak30, label: '30天' };
    if (data.streakDays < 90) return { days: 90, points: POINTS_CONFIG.streak90, label: '90天' };
    return null;
}