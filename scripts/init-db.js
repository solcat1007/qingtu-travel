/**
 * SQLite数据库初始化脚本
 * 全国公交地铁景区旅游网站 - 数据库建表
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join('G:', '旅游网站项目', '数据库');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, 'travel.db');
console.log('数据库路径:', DB_PATH);

const db = new Database(DB_PATH);

// 启用WAL模式提升并发性能
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ========== 城市表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    province TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ========== 公交线路表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS bus_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    line_name TEXT NOT NULL,
    line_code TEXT,
    start_station TEXT,
    end_station TEXT,
    first_bus TEXT,
    last_bus TEXT,
    price TEXT,
    direction TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
  )
`);

// ========== 公交站点表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS bus_stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    station_name TEXT NOT NULL,
    line_id INTEGER NOT NULL,
    station_order INTEGER,
    latitude REAL,
    longitude REAL,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (line_id) REFERENCES bus_lines(id)
  )
`);

// ========== 地铁线路表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS metro_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    line_name TEXT NOT NULL,
    line_code TEXT,
    color TEXT,
    start_station TEXT,
    end_station TEXT,
    first_train TEXT,
    last_train TEXT,
    price TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
  )
`);

// ========== 地铁站点表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS metro_stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    station_name TEXT NOT NULL,
    line_id INTEGER NOT NULL,
    station_order INTEGER,
    is_transfer INTEGER DEFAULT 0,
    latitude REAL,
    longitude REAL,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (line_id) REFERENCES metro_lines(id)
  )
`);

// ========== 景区表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS attractions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT,
    category TEXT,
    description TEXT,
    address TEXT,
    open_time TEXT,
    ticket_price TEXT,
    latitude REAL,
    longitude REAL,
    cover_image TEXT,
    rating REAL,
    nearby_stations TEXT,
    tips TEXT,
    is_open INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
  )
`);

// ========== 行程规划表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS trip_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    attractions TEXT,
    transport TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
  )
`);

// ========== 用户反馈表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER,
    type TEXT,
    content TEXT NOT NULL,
    contact TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ========== API调用日志表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_type TEXT NOT NULL,
    endpoint TEXT,
    request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_status INTEGER,
    data_count INTEGER,
    error_message TEXT,
    duration_ms INTEGER
  )
`);

// ========== 数据异常表 ==========
db.exec(`
  CREATE TABLE IF NOT EXISTS data_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER,
    alert_type TEXT NOT NULL,
    description TEXT,
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
  )
`);

// ========== 创建索引 ==========
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_bus_lines_city ON bus_lines(city_id);
  CREATE INDEX IF NOT EXISTS idx_metro_lines_city ON metro_lines(city_id);
  CREATE INDEX IF NOT EXISTS idx_attractions_city ON attractions(city_id);
  CREATE INDEX IF NOT EXISTS idx_attractions_slug ON attractions(slug);
  CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
  CREATE INDEX IF NOT EXISTS idx_api_logs_type ON api_logs(api_type);
  CREATE INDEX IF NOT EXISTS idx_data_alerts_city ON data_alerts(city_id);
`);

// ========== 插入西安初始数据 ==========
const insertCity = db.prepare(`
  INSERT OR IGNORE INTO cities (name, province, slug, description, latitude, longitude)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertCity.run('西安', '陕西省', 'xian', '十三朝古都，世界四大古都之一，拥有秦始皇兵马俑、大雁塔、城墙等众多历史文化遗迹', 34.2658, 108.9541);

console.log('✅ 数据库初始化完成');
console.log('📊 数据库路径:', DB_PATH);

// 验证表
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('📋 已创建表:', tables.map(t => t.name).join(', '));

db.close();
