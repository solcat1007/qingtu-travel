/**
 * NVIDIA NIM API 数据采集脚本
 * 采集公交/地铁/景区核心数据，写入本地SQLite
 * 仅用于后台数据采集，用户访问时不调用
 */
const Database = require('better-sqlite3');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

// ========== 配置 ==========
const API_KEY = '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';
const NIM_BASE = 'https://integrate.api.nvidia.com/v1';
const DB_PATH = path.join('G:', '旅游网站项目', '数据库', 'travel.db');
const LOG_DIR = path.join('G:', '旅游网站项目', '日志文件', 'API调用日志');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// ========== 日志工具 ==========
function logApiCall(apiType, endpoint, status, dataCount, error, durationMs) {
  const stmt = db.prepare(`
    INSERT INTO api_logs (api_type, endpoint, response_status, data_count, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(apiType, endpoint, status, dataCount || 0, error || null, durationMs || 0);

  // 写文件日志
  const dateStr = new Date().toISOString().slice(0, 10);
  const logFile = path.join(LOG_DIR, `api_${dateStr}.log`);
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${apiType} | ${endpoint} | status=${status} | count=${dataCount || 0} | error=${error || 'none'} | duration=${durationMs || 0}ms\n`;
  fs.appendFileSync(logFile, logLine, 'utf-8');
}

// ========== NVIDIA NIM API 调用 ==========
async function callNimAPI(prompt, maxTokens = 2048) {
  const start = Date.now();
  try {
    const response = await fetch(`${NIM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.3-70b-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3,
        top_p: 0.9
      }),
      timeout: 300000
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errText = await response.text();
      logApiCall('nvidia-nim', '/chat/completions', response.status, 0, errText, duration);
      throw new Error(`API调用失败: ${response.status} ${errText}`);
    }

    const data = await response.json();
    logApiCall('nvidia-nim', '/chat/completions', 200, 1, null, duration);
    return data;
  } catch (err) {
    const duration = Date.now() - start;
    logApiCall('nvidia-nim', '/chat/completions', 0, 0, err.message, duration);
    throw err;
  }
}

// ========== 解析API返回的JSON ==========
function extractJSON(text) {
  // 尝试直接解析
  try { return JSON.parse(text); } catch (e) {}

  // 尝试提取```json ... ```块
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch (e) {}
  }

  // 尝试提取花括号内容
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]); } catch (e) {}
  }

  return null;
}

// ========== 采集城市公交数据 ==========
async function fetchBusData(cityName, cityId) {
  console.log(`🚌 采集${cityName}公交线路数据...`);

  const prompt = `请以JSON格式返回中国${cityName}的主要公交线路信息，包含至少20条常用线路。格式如下：
{
  "bus_lines": [
    {
      "line_name": "线路全称",
      "line_code": "线路编号",
      "start_station": "起点站",
      "end_station": "终点站",
      "first_bus": "首班车时间",
      "last_bus": "末班车时间",
      "price": "票价",
      "direction": "上行/下行/环线",
      "notes": "备注"
    }
  ]
}
仅返回JSON，不要附加其他文字。数据需要真实准确。`;

  const result = await callNimAPI(prompt, 4096);
  const content = result.choices?.[0]?.message?.content || '';
  const data = extractJSON(content);

  if (data?.bus_lines) {
    const stmt = db.prepare(`
      INSERT INTO bus_lines (city_id, line_name, line_code, start_station, end_station, first_bus, last_bus, price, direction, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((lines) => {
      for (const line of lines) {
        stmt.run(cityId, line.line_name, line.line_code, line.start_station, line.end_station,
          line.first_bus, line.last_bus, line.price, line.direction, line.notes);
      }
    });
    insertMany(data.bus_lines);
    console.log(`  ✅ 插入${data.bus_lines.length}条公交线路`);
    return data.bus_lines.length;
  } else {
    console.log('  ⚠️ 公交数据解析失败，原始内容:', content.substring(0, 200));
    return 0;
  }
}

// ========== 采集城市地铁数据 ==========
async function fetchMetroData(cityName, cityId) {
  console.log(`🚇 采集${cityName}地铁线路数据...`);

  const prompt = `请以JSON格式返回中国${cityName}的地铁线路信息。格式如下：
{
  "metro_lines": [
    {
      "line_name": "线路全称",
      "line_code": "线路编号",
      "color": "代表色（如红色、蓝色）",
      "start_station": "起点站",
      "end_station": "终点站",
      "first_train": "首班车时间",
      "last_train": "末班车时间",
      "price": "票价区间",
      "notes": "备注",
      "stations": ["站名1", "站名2", "站名3"]
    }
  ]
}
仅返回JSON，不要附加其他文字。数据需要真实准确。`;

  const result = await callNimAPI(prompt, 4096);
  const content = result.choices?.[0]?.message?.content || '';
  const data = extractJSON(content);

  if (data?.metro_lines) {
    const lineStmt = db.prepare(`
      INSERT INTO metro_lines (city_id, line_name, line_code, color, start_station, end_station, first_train, last_train, price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const stationStmt = db.prepare(`
      INSERT INTO metro_stations (city_id, station_name, line_id, station_order)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((lines) => {
      for (const line of lines) {
        const info = lineStmt.run(cityId, line.line_name, line.line_code, line.color,
          line.start_station, line.end_station, line.first_train, line.last_train, line.price, line.notes);
        const lineId = info.lastInsertRowid;

        if (line.stations && Array.isArray(line.stations)) {
          line.stations.forEach((station, idx) => {
            stationStmt.run(cityId, station, lineId, idx + 1);
          });
        }
      }
    });
    insertMany(data.metro_lines);
    console.log(`  ✅ 插入${data.metro_lines.length}条地铁线路`);
    return data.metro_lines.length;
  } else {
    console.log('  ⚠️ 地铁数据解析失败');
    return 0;
  }
}

// ========== 采集景区数据 ==========
async function fetchAttractionData(cityName, cityId) {
  console.log(`🏞️ 采集${cityName}景区数据...`);

  const prompt = `请以JSON格式返回中国${cityName}的主要景区/景点信息，包含至少15个热门景区。格式如下：
{
  "attractions": [
    {
      "name": "景区名称",
      "slug": "景区英文缩写",
      "category": "分类（历史古迹/自然风光/文化体验/宗教场所/主题公园）",
      "description": "景区简介（50-100字）",
      "address": "详细地址",
      "open_time": "开放时间",
      "ticket_price": "门票价格",
      "latitude": 纬度（数字）,
      "longitude": 经度（数字）,
      "rating": 评分（4.0-5.0之间）,
      "nearby_stations": "附近地铁站/公交站",
      "tips": "游玩建议"
    }
  ]
}
仅返回JSON，不要附加其他文字。数据需要真实准确。`;

  const result = await callNimAPI(prompt, 4096);
  const content = result.choices?.[0]?.message?.content || '';
  const data = extractJSON(content);

  if (data?.attractions) {
    const stmt = db.prepare(`
      INSERT INTO attractions (city_id, name, slug, category, description, address, open_time, ticket_price, latitude, longitude, rating, nearby_stations, tips)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        stmt.run(cityId, item.name, item.slug, item.category, item.description, item.address,
          item.open_time, item.ticket_price, item.latitude, item.longitude, item.rating,
          item.nearby_stations, item.tips);
      }
    });
    insertMany(data.attractions);
    console.log(`  ✅ 插入${data.attractions.length}个景区`);
    return data.attractions.length;
  } else {
    console.log('  ⚠️ 景区数据解析失败');
    return 0;
  }
}

// ========== 主流程 ==========
async function main() {
  const cityName = process.argv[2] || '西安';
  console.log(`\n🚀 开始采集${cityName}数据...`);
  console.log('='.repeat(50));

  // 获取城市ID
  const city = db.prepare('SELECT id FROM cities WHERE name = ?').get(cityName);
  if (!city) {
    console.error(`❌ 城市不存在: ${cityName}，请先添加城市`);
    db.close();
    process.exit(1);
  }
  const cityId = city.id;

  let totalRecords = 0;
  const errors = [];

  // 按顺序采集：公交→地铁→景区（严控API频次）
  try {
    totalRecords += await fetchBusData(cityName, cityId);
  } catch (e) {
    errors.push(`公交数据采集失败: ${e.message}`);
    console.error(`❌ ${e.message}`);
  }

  // 间隔3秒，避免API限频
  console.log('⏳ 等待3秒...');
  await new Promise(r => setTimeout(r, 3000));

  try {
    totalRecords += await fetchMetroData(cityName, cityId);
  } catch (e) {
    errors.push(`地铁数据采集失败: ${e.message}`);
    console.error(`❌ ${e.message}`);
  }

  console.log('⏳ 等待3秒...');
  await new Promise(r => setTimeout(r, 3000));

  try {
    totalRecords += await fetchAttractionData(cityName, cityId);
  } catch (e) {
    errors.push(`景区数据采集失败: ${e.message}`);
    console.error(`❌ ${e.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 采集完成: 共${totalRecords}条记录`);
  if (errors.length > 0) {
    console.log(`⚠️ 错误: ${errors.length}个`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // 归档临时数据
  const dateStr = new Date().toISOString().slice(0, 10);
  const archiveDir = path.join('G:', '旅游网站项目', '临时采集数据', `API采集_${dateStr}`);
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  fs.writeFileSync(path.join(archiveDir, 'summary.json'), JSON.stringify({
    city: cityName,
    date: dateStr,
    totalRecords,
    errors: errors.length,
    errorDetails: errors
  }, null, 2), 'utf-8');

  db.close();
  console.log('✅ 数据库已关闭');
}

main().catch(err => {
  console.error('致命错误:', err);
  db.close();
  process.exit(1);
});
