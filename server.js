/**
 * 晴途 - Express服务器 (sql.js版)
 * 所有数据从本地SQLite读取，用户访问时零API调用
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join('G:', '旅游网站项目', '数据库', 'travel.db');

let db;

// sql.js 查询辅助函数
function queryAll(sql, ...params) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function queryGet(sql, ...params) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  let result = null;
  if (stmt.step()) result = stmt.getAsObject();
  stmt.free();
  return result;
}

function queryRun(sql, ...params) {
  db.run(sql, params);
}

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/douyin', express.static(path.join('G:', '旅游网站项目', '抖音宣传页')));
app.use(express.json());

// ========== 公共工具：把 cityId（数字或slug）转为数字id ==========
function resolveCityId(cityId, callback) {
  const num = parseInt(cityId, 10);
  if (!isNaN(num)) return callback(null, num);
  // 是 slug，先查 cities 表
  const city = queryGet('SELECT id FROM cities WHERE slug = ?', cityId);
  if (!city) return callback(new Error('城市不存在'));
  callback(null, city.id);
}

// ========== API路由 ==========

app.get('/api/cities', (req, res) => {
  try {
    const cities = queryAll('SELECT * FROM cities ORDER BY id');
    for (const city of cities) {
      city.busCount = queryGet('SELECT COUNT(*) as c FROM bus_lines WHERE city_id = ?', city.id).c;
      city.metroCount = queryGet('SELECT COUNT(*) as c FROM metro_lines WHERE city_id = ?', city.id).c;
      city.attractionCount = queryGet('SELECT COUNT(*) as c FROM attractions WHERE city_id = ?', city.id).c;
      city.hotelCount = queryGet('SELECT COUNT(*) as c FROM hotels WHERE city_id = ?', city.id).c;
      city.foodCount = queryGet('SELECT COUNT(*) as c FROM foods WHERE city_id = ?', city.id).c;
      city.shoppingCount = queryGet('SELECT COUNT(*) as c FROM shopping WHERE city_id = ?', city.id).c;
      city.guideCount = queryGet('SELECT COUNT(*) as c FROM guides WHERE city_id = ?', city.id).c;
    }
    res.json({ success: true, data: cities });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/cities/:cityId', (req, res) => {
  try {
    const num = parseInt(req.params.cityId, 10);
    let city;
    if (!isNaN(num)) {
      city = queryGet('SELECT * FROM cities WHERE id = ?', num);
    }
    if (!city) {
      city = queryGet('SELECT * FROM cities WHERE slug = ?', req.params.cityId);
    }
    if (!city) return res.status(404).json({ success: false, error: '城市不存在' });
    res.json({ success: true, data: city });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 公交线路 + 站点
app.get('/api/cities/:cityId/bus', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const lines = queryAll(`
        SELECT bl.*,
          GROUP_CONCAT(bs.station_name, '|') as station_list
        FROM bus_lines bl
        LEFT JOIN bus_stations bs ON bl.id = bs.line_id
        WHERE bl.city_id = ?
        GROUP BY bl.id
        ORDER BY bl.line_code
      `, cityId);
      lines.forEach(line => {
        line.stations = line.station_list ? line.station_list.split('|').filter(Boolean) : [];
        delete line.station_list;
      });
      res.json({ success: true, data: lines });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 地铁线路 + 站点
app.get('/api/cities/:cityId/metro', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const lines = queryAll(`
        SELECT ml.*,
          GROUP_CONCAT(ms.station_name, '|') as station_list
        FROM metro_lines ml
        LEFT JOIN metro_stations ms ON ml.id = ms.line_id
        WHERE ml.city_id = ?
        GROUP BY ml.id
        ORDER BY ml.line_code
      `, cityId);
      lines.forEach(line => {
        line.stations = line.station_list ? line.station_list.split('|').filter(Boolean) : [];
        delete line.station_list;
      });
      res.json({ success: true, data: lines });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 景区列表（按城市）
app.get('/api/cities/:cityId/attractions', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const attractions = queryAll('SELECT * FROM attractions WHERE city_id = ? ORDER BY rating DESC', cityId);
      res.json({ success: true, data: attractions });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 景区列表（全部）
app.get('/api/attractions', (req, res) => {
  try {
    const { limit, offset, city_id } = req.query;
    let sql = 'SELECT a.*, c.name as city_name, c.slug as city_slug FROM attractions a JOIN cities c ON a.city_id = c.id';
    const params = [];
    if (city_id) { sql += ' WHERE a.city_id = ?'; params.push(parseInt(city_id)); }
    sql += ' ORDER BY a.rating DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
    if (offset) { sql += ' OFFSET ?'; params.push(parseInt(offset)); }
    const attractions = queryAll(sql, ...params);
    const total = queryGet('SELECT COUNT(*) c FROM attractions').c;
    res.json({ success: true, data: attractions, total });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 景区详情
app.get('/api/attractions/:id', (req, res) => {
  try {
    const a = queryGet(`
      SELECT a.*, c.name as city_name, c.slug as city_slug
      FROM attractions a JOIN cities c ON a.city_id = c.id WHERE a.id = ?
    `, req.params.id);
    if (!a) return res.status(404).json({ success: false, error: '景区不存在' });
    res.json({ success: true, data: a });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 搜索
app.get('/api/search', (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const results = queryAll(`
      SELECT a.*, c.name as city_name, c.slug as city_slug FROM attractions a
      JOIN cities c ON a.city_id = c.id
      WHERE a.name LIKE ? OR a.description LIKE ? OR a.address LIKE ?
      ORDER BY a.rating DESC LIMIT 20
    `, q, q, q);
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 异常提醒
app.get('/api/alerts/:cityId', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const alerts = queryAll('SELECT * FROM data_alerts WHERE city_id = ? AND is_resolved = 0 ORDER BY created_at DESC', cityId);
      res.json({ success: true, data: alerts });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 提交反馈
app.post('/api/feedback', (req, res) => {
  try {
    const { type, content, contact } = req.body;
    if (!content) return res.status(400).json({ success: false, error: '内容不能为空' });
    queryRun('INSERT INTO feedbacks (type, content, contact) VALUES (?, ?, ?)', type || 'other', content, contact || null);
    res.json({ success: true, message: '感谢反馈！' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 酒店列表
app.get('/api/cities/:cityId/hotels', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const hotels = queryAll('SELECT * FROM hotels WHERE city_id = ? ORDER BY stars DESC, price ASC', cityId);
      res.json({ success: true, data: hotels });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 航班列表
app.get('/api/flights', (req, res) => {
  try {
    let sql = `SELECT f.*, 
      dc.name as departure_city, dc.slug as departure_slug,
      ac.name as arrival_city, ac.slug as arrival_slug
      FROM flights f 
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id`;
    const params = [];
    if (req.query.city_id) {
      sql += ' WHERE f.departure_city_id = ? OR f.arrival_city_id = ?';
      params.push(parseInt(req.query.city_id), parseInt(req.query.city_id));
    }
    sql += ' LIMIT 200';
    const flights = queryAll(sql, ...params);
    res.json({ success: true, data: flights, total: flights.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 高铁列表
app.get('/api/trains', (req, res) => {
  try {
    let sql = `SELECT t.*, 
      dc.name as departure_city, dc.slug as departure_slug,
      ac.name as arrival_city, ac.slug as arrival_slug
      FROM high_speed_trains t 
      JOIN cities dc ON t.departure_city_id = dc.id
      JOIN cities ac ON t.arrival_city_id = ac.id`;
    const params = [];
    if (req.query.city_id) {
      sql += ' WHERE t.departure_city_id = ? OR t.arrival_city_id = ?';
      params.push(parseInt(req.query.city_id), parseInt(req.query.city_id));
    }
    sql += ' LIMIT 200';
    const trains = queryAll(sql, ...params);
    res.json({ success: true, data: trains, total: trains.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 城市美食
app.get('/api/cities/:cityId/foods', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const foods = queryAll('SELECT * FROM foods WHERE city_id = ? ORDER BY category, name', cityId);
      res.json({ success: true, data: foods, total: foods.length });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 城市购物
app.get('/api/cities/:cityId/shopping', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const shops = queryAll('SELECT * FROM shopping WHERE city_id = ? ORDER BY category, name', cityId);
      res.json({ success: true, data: shops, total: shops.length });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 城市攻略
app.get('/api/cities/:cityId/guides', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const guides = queryAll('SELECT * FROM guides WHERE city_id = ? ORDER BY duration, title', cityId);
      res.json({ success: true, data: guides, total: guides.length });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// 数据总览统计
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      cities: queryGet('SELECT COUNT(*) c FROM cities').c,
      attractions: queryGet('SELECT COUNT(*) c FROM attractions').c,
      bus_lines: queryGet('SELECT COUNT(*) c FROM bus_lines').c,
      bus_stations: queryGet('SELECT COUNT(*) c FROM bus_stations').c,
      metro_lines: queryGet('SELECT COUNT(*) c FROM metro_lines').c,
      metro_stations: queryGet('SELECT COUNT(*) c FROM metro_stations').c,
      flights: queryGet('SELECT COUNT(*) c FROM flights').c,
      high_speed_trains: queryGet('SELECT COUNT(*) c FROM high_speed_trains').c,
      hotels: queryGet('SELECT COUNT(*) c FROM hotels').c,
      foods: queryGet('SELECT COUNT(*) c FROM foods').c,
      shopping: queryGet('SELECT COUNT(*) c FROM shopping').c,
      guides: queryGet('SELECT COUNT(*) c FROM guides').c,
    };
    res.json({ success: true, data: stats });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 数据导出CSV
app.get('/api/export/:cityId/:type', (req, res) => {
  resolveCityId(req.params.cityId, (err, cityId) => {
    if (err) return res.status(404).json({ success: false, error: err.message });
    try {
      const { type } = req.params;
      let rows, headers;
      if (type === 'bus') {
        headers = ['线路名','编号','起点','终点','首班','末班','票价'];
        rows = queryAll('SELECT line_name,line_code,start_station,end_station,first_bus,last_bus,price FROM bus_lines WHERE city_id=?', cityId);
      } else if (type === 'metro') {
        headers = ['线路名','编号','起点','终点','首班','末班','票价'];
        rows = queryAll('SELECT line_name,line_code,start_station,end_station,first_train,last_train,price FROM metro_lines WHERE city_id=?', cityId);
      } else if (type === 'attractions') {
        headers = ['景区名','分类','地址','开放时间','门票','评分'];
        rows = queryAll('SELECT name,category,address,open_time,ticket_price,rating FROM attractions WHERE city_id=?', cityId);
      } else if (type === 'foods') {
        headers = ['名称','分类','描述','价格区间','推荐店铺'];
        rows = queryAll('SELECT name,category,description,price_range,recommend_shop FROM foods WHERE city_id=?', cityId);
      } else if (type === 'shopping') {
        headers = ['名称','分类','描述','地址','营业时间','价格水平'];
        rows = queryAll('SELECT name,category,description,address,business_hours,price_level FROM shopping WHERE city_id=?', cityId);
      } else if (type === 'guides') {
        headers = ['标题','天数','内容','标签','适宜季节','预算'];
        rows = queryAll('SELECT title,duration,content,tags,season,budget FROM guides WHERE city_id=?', cityId);
      } else { return res.status(400).json({ success: false, error: '不支持的类型' }); }

      const BOM = '\uFEFF';
      const csvLines = [headers.join(',')];
      rows.forEach(r => csvLines.push(Object.values(r).map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(',')));

      const city = queryGet('SELECT name FROM cities WHERE id=?', cityId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8-sig');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(city?.name||cityId)}_${type}_${new Date().toISOString().slice(0,10)}.csv"`);
      res.send(BOM + csvLines.join('\r\n'));
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  });
});

// SPA fallback
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

// 启动：先加载数据库再监听端口
(async () => {
  try {
    const fileBuffer = fs.readFileSync(DB_PATH);
    const SQL = await initSqlJs();
    db = new SQL.Database(fileBuffer);
    console.log(`SQLite 数据库加载完成: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    app.listen(PORT, () => {
      console.log('晴途服务器启动成功');
      console.log(`http://localhost:${PORT}`);
      console.log(DB_PATH);
    });
  } catch (err) {
    console.error('启动失败:', err.message);
    process.exit(1);
  }
})();
