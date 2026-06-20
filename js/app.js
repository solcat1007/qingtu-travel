/**
 * 晴途 - 前端SPA (v3)
 * 31城公交/地铁/景区一站式查询
 * 图片路径: /images/attractions/:id (动态路由)
 */
const API_BASE = '';
const app = document.getElementById('app');

// ========== 全局状态 ==========
let ALL_CITIES = [];
let _cityDataCache = null;

// ========== 路由 ==========
function navigate(path) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function getRoute() { return window.location.hash.slice(1) || '/'; }

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

async function handleRoute() {
  const route = getRoute();
  app.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中...</p></div>';
  try {
    if (route === '/') await renderHome();
    else if (route === '/cities') await renderCityList();
    else if (route.startsWith('/city/')) await renderCity(route);
    else if (route.startsWith('/attraction/')) await renderAttraction(route.split('/')[2]);
    else if (route === '/feedback') renderFeedback();
    else if (route.startsWith('/search')) {
      const q = new URLSearchParams(route.split('?')[1]).get('q');
      await renderSearch(q);
    } else {
      app.innerHTML = '<div class="container"><div class="error-page"><h2>页面不存在</h2><a href="#/" class="action-btn">返回首页</a></div></div>';
    }
  } catch (err) {
    console.error(err);
    app.innerHTML = '<div class="container"><div class="error-page"><h2>加载失败</h2><p>' + escHtml(err.message) + '</p><a href="#/" class="action-btn">返回首页</a></div></div>';
  }
}

// ========== 工具 ==========
function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ========== API ==========
async function api(path) {
  var res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  var data = await res.json();
  if (!data.success) throw new Error(data.error || '请求失败');
  return data.data;
}

// ========== 景区/城市图片URL ==========
function attrImgUrl(id) { return '/images/attractions/' + id; }
function cityImgUrl(slug) { return '/images/cities/' + slug; }

// ========== 主页搜索框 ==========
function heroSearch() {
  var q = document.getElementById('hero-search-input').value.trim();
  if (!q) return;
  navigate('/search?q=' + encodeURIComponent(q));
}
document.addEventListener('DOMContentLoaded', function() {
  var inp = document.getElementById('hero-search-input');
  if (inp) { inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') heroSearch(); }); }
});

// ========== 城市加载 ==========
async function loadCities() {
  if (ALL_CITIES.length > 0) return ALL_CITIES;
  try { ALL_CITIES = await api('/api/cities'); }
  catch (e) { console.error('加载城市失败:', e); ALL_CITIES = []; }
  return ALL_CITIES;
}

function getCityStatus(c) {
  var total = (c.busCount || 0) + (c.metroCount || 0) + (c.attractionCount || 0);
  return total > 0 ? 'online' : 'building';
}

// ========== 导航栏城市选择器 ==========
function renderCitySelector() {
  if (ALL_CITIES.length === 0) return '';
  var opts = ALL_CITIES.map(function(c) {
    return '<option value="' + c.slug + '">' + getCityEmoji(c.slug) + ' ' + c.name + '</option>';
  }).join('');
  return '<select class="city-selector" onchange="if(this.value)navigate(\'/city/\'+this.value)" title="快速切换城市">' +
    '<option value="">🏙️ 切换城市</option>' + opts + '</select>';
}

function updateNavSelector() {
  var sel = document.getElementById('nav-city-selector');
  if (sel && ALL_CITIES.length > 0) {
    sel.innerHTML = '<option value="">🏙️ 切换城市</option>' +
      ALL_CITIES.map(function(c) { return '<option value="' + c.slug + '">' + getCityEmoji(c.slug) + ' ' + c.name + '</option>'; }).join('');
  }
}

// ========== 首页 ==========
async function renderHome() {
  await loadCities();
  updateNavSelector();

  var totalBus = 0, totalMetro = 0, totalAttr = 0, totalHotel = 0, totalFlight = 0, totalTrain = 0;
  ALL_CITIES.forEach(function(c) {
    totalBus += (c.busCount || 0);
    totalMetro += (c.metroCount || 0);
    totalAttr += (c.attractionCount || 0);
    totalHotel += (c.hotelCount || 0);
  });

  // 拉取全局统计
  try {
    var stats = await api('/api/stats');
    totalFlight = stats.flights || 0;
    totalTrain = stats.high_speed_trains || 0;
  } catch(e) {}

  var cityCard = function(c) {
    var grad = getCityGradient(c.slug);
    var emoji = getCityEmoji(c.slug);
    var desc = (c.description || '数据采集中...').substring(0, 30);
    var hasData = (c.busCount || 0) + (c.metroCount || 0) + (c.attractionCount || 0) > 0;
    return '<div class="city-card' + (hasData ? ' city-card-online' : '') + '" onclick="navigate(\'/city/' + c.slug + '\')">' +
      '<div class="city-card-bg" style="background:' + grad + ';"></div>' +
      '<img class="city-card-img" src="' + cityImgUrl(c.slug) + '" alt="' + escHtml(c.name) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<div class="city-card-body">' +
        '<div class="city-emoji">' + emoji + '</div>' +
        '<div class="city-info">' +
          '<h3>' + escHtml(c.name) + '</h3>' +
          '<p>' + escHtml(desc) + '</p>' +
          '<div class="city-card-counts">' +
            '<span title="景点">' + (c.attractionCount||0) + ' 🎯</span>' +
            '<span title="公交线路">' + (c.busCount||0) + ' 🚌</span>' +
            '<span title="地铁线路">' + (c.metroCount||0) + ' 🚇</span>' +
            '<span title="酒店">' + (c.hotelCount||0) + ' 🏨</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  };

  // 按数据完整度排序：有景区的排前面
  var sorted = ALL_CITIES.slice().sort(function(a, b) {
    return ((b.attractionCount||0) + (b.busCount||0) + (b.metroCount||0)) -
           ((a.attractionCount||0) + (a.busCount||0) + (a.metroCount||0));
  });

  app.innerHTML =
    '<div class="hero-banner">' +
      '<div class="hero-glow"></div>' +
      '<div class="hero-content">' +
        '<div class="hero-logo">🗺️</div>' +
        '<h1>晴途</h1>' +
        '<p>全国公交 · 地铁 · 景区一站式查询平台</p>' +
        '<p class="hero-sub">一天一座城市</p>' +
        '<div class="hero-search-wrap">' +
          '<input type="text" id="hero-search-input" class="hero-search-input" placeholder="搜索城市或景点..." autocomplete="off" />' +
          '<button class="hero-search-btn" onclick="heroSearch()">🔍</button>' +
        '</div>' +
      '</div>' +
      '<div class="hero-stats">' +
        '<div class="stat-item"><div class="stat-num">' + ALL_CITIES.length + '</div><div class="stat-label">城市</div></div>' +
        '<div class="stat-divider"></div>' +
        '<div class="stat-item"><div class="stat-num">' + totalAttr + '</div><div class="stat-label">景点</div></div>' +
        '<div class="stat-divider"></div>' +
        '<div class="stat-item"><div class="stat-num">' + totalHotel + '</div><div class="stat-label">酒店</div></div>' +
        '<div class="stat-divider"></div>' +
        '<div class="stat-item"><div class="stat-num">' + totalFlight + '</div><div class="stat-label">航班</div></div>' +
        '<div class="stat-divider"></div>' +
        '<div class="stat-item"><div class="stat-num">' + totalTrain + '</div><div class="stat-label">高铁</div></div>' +
      '</div>' +
    '</div>' +

    '<div class="section-title">🏙️ 全部城市 <span class="result-count">' + ALL_CITIES.length + '座</span></div>' +
    '<div class="city-grid">' + sorted.map(cityCard).join('') + '</div>' +

    '<div class="build-tip">' +
      '📍 每座城市包含：精选景点 · 酒店住宿 · 公交线路 · 地铁线路<br/>' +
      '✈️ ' + totalFlight + '条航班 · 🚄 ' + totalTrain + '条高铁 · 覆盖' + ALL_CITIES.length + '座城市<br/>' +
      '🎯 持续更新中 · 数据完全本地存储 · 零API调用' +
    '</div>';
}

// ========== 城市列表页 ==========
async function renderCityList() {
  await loadCities();

  var html = ALL_CITIES.map(function(c) {
    var desc = (c.province || '') + ' · ' + ((c.description || '数据采集中').substring(0, 25));
    return '<div class="city-list-item" onclick="navigate(\'/city/' + c.slug + '\')">' +
      '<div class="city-list-emoji">' + getCityEmoji(c.slug) + '</div>' +
      '<div class="city-list-info">' +
        '<h3>' + escHtml(c.name) + '</h3>' +
        '<p>' + escHtml(desc) + '</p>' +
      '</div>' +
      '<div class="city-list-right">' +
        '<span style="font-size:12px;color:var(--text-3);">' +
          (c.attractionCount || 0) + '🎯 ' +
          (c.busCount || 0) + '🚌 ' +
          (c.metroCount || 0) + '🚇 ' +
          (c.hotelCount || 0) + '🏨' +
        '</span>' +
      '</div>' +
    '</div>';
  }).join('');

  app.innerHTML =
    '<div class="container">' +
      '<h2 class="section-title">🏙️ 城市列表 <span class="result-count">' + ALL_CITIES.length + '座城市</span></h2>' +
      '<div class="city-list-wrap">' + html + '</div>' +
    '</div>';
}

// ========== 城市详情页 ==========
async function renderCity(route) {
  var parts = route.split('/');
  var slug = parts[2].split('?')[0];
  var params = new URLSearchParams(parts[3] || '');
  var defaultTab = params.get('tab') || 'attractions';

  var city = await api('/api/cities/' + slug);
  if (window.muqing) window.muqing.onCityLoad();
  _cityDataCache = city;

  var results = await Promise.all([
    api('/api/cities/' + city.id + '/bus').catch(function() { return []; }),
    api('/api/cities/' + city.id + '/metro').catch(function() { return []; }),
    api('/api/cities/' + city.id + '/attractions').catch(function() { return []; })
  ]);
  var busLines = results[0];
  var metroLines = results[1];
  var attractions = results[2];

  var favs = JSON.parse(localStorage.getItem('fav-cities') || '[]');
  var isFav = favs.indexOf(slug) >= 0;

  // 景区卡片
  var attrHtml = attractions.map(function(a) {
    var isF = isAttrFav(a.id);
    return '<div class="attraction-card" onclick="navigate(\'/attraction/' + a.id + '\')">' +
      '<div class="attraction-img-wrap">' +
        '<img class="attraction-img" src="' + attrImgUrl(a.id) + '" alt="' + escHtml(a.name) + '" loading="lazy">' +
        '<div class="attraction-img-overlay"><span class="attraction-cat">' + escHtml(a.category || '景点') + '</span></div>' +
        '<button class="attraction-fav' + (isF ? ' active' : '') + '" onclick="event.stopPropagation(); toggleAttrFav(' + a.id + ', this)">' +
          (isF ? '♥' : '♡') +
        '</button>' +
      '</div>' +
      '<div class="attraction-body">' +
        '<h3>' + escHtml(a.name) + '</h3>' +
        '<p class="attraction-desc">' + escHtml((a.description || '').substring(0, 60)) + '…</p>' +
        '<div class="attraction-foot">' +
          '<span class="attraction-rating">⭐ ' + (a.rating || '--') + '</span>' +
          '<span class="attraction-price">' + escHtml(a.ticket_price || '免费') + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  // 公交HTML
  var busHtml = busLines.map(function(line, li) {
    var stationItems = renderStations(line.stations || [], attractions);
    return '<div class="line-card" id="bus-' + li + '">' +
      '<div class="line-card-header" onclick="toggleLine(this)">' +
        '<div class="line-card-left">' +
          '<div class="line-badge-bus">' + escHtml(line.line_code) + '</div>' +
          '<div class="line-info-main">' +
            '<div class="line-title">' + escHtml(line.line_name) + '</div>' +
            '<div class="line-route">' + escHtml(line.start_station || '--') + ' → ' + escHtml(line.end_station || '--') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="line-card-right">' +
          '<div class="line-meta"><span>首</span>' + escHtml(line.first_bus || '--') + '</div>' +
          '<div class="line-meta"><span>末</span>' + escHtml(line.last_bus || '--') + '</div>' +
          '<div class="line-meta"><span>¥</span>' + escHtml(line.price || '--') + '</div>' +
          '<div class="expand-icon">▾</div>' +
        '</div>' +
      '</div>' +
      '<div class="line-stations" style="display:none;">' +
        '<div class="station-list-wrap">' + stationItems + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  // 地铁HTML
  var metroHtml = metroLines.map(function(line, mi) {
    var color = getMetroColor(line.line_code);
    var stationItems = renderStations(line.stations || [], attractions, color);
    return '<div class="line-card" id="metro-' + mi + '">' +
      '<div class="line-card-header" onclick="toggleLine(this)">' +
        '<div class="line-card-left">' +
          '<div class="line-badge-metro" style="background:' + color + ';">' + escHtml(line.line_code) + '</div>' +
          '<div class="line-info-main">' +
            '<div class="line-title">' + escHtml(line.line_name) + '</div>' +
            '<div class="line-route">' + escHtml(line.start_station || '--') + ' → ' + escHtml(line.end_station || '--') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="line-card-right">' +
          '<div class="line-meta"><span>首</span>' + escHtml(line.first_train || '--') + '</div>' +
          '<div class="line-meta"><span>末</span>' + escHtml(line.last_train || '--') + '</div>' +
          '<div class="line-meta"><span>¥</span>' + escHtml(line.price || '--') + '</div>' +
          '<div class="expand-icon">▾</div>' +
        '</div>' +
      '</div>' +
      '<div class="line-stations" style="display:none;">' +
        '<div class="station-list-wrap">' + stationItems + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  app.innerHTML =
    '<div class="city-header-wrap">' +
      '<div class="city-header-glow"></div>' +
      '<img class="city-header-img" src="' + cityImgUrl(slug) + '" alt="' + escHtml(city.name) + '" onerror="this.style.display=\'none\'">' +
      '<div class="city-header-content">' +
        '<div class="city-header-left">' +
          '<div class="city-emoji-lg">' + getCityEmoji(slug) + '</div>' +
        '</div>' +
        '<div class="city-header-info">' +
          '<h1>' + escHtml(city.name) + '</h1>' +
          '<p>' + escHtml(city.description || '') + '</p>' +
          '<div class="city-tags">' +
            '<span class="city-tag">🚌 ' + busLines.length + '条公交</span>' +
            '<span class="city-tag">🚇 ' + metroLines.length + '条地铁</span>' +
            '<span class="city-tag">🏞️ ' + attractions.length + '个景点</span>' +
          '</div>' +
        '</div>' +
        '<div class="city-header-actions">' +
          '<button class="action-btn' + (isFav ? ' active' : '') + '" onclick="toggleFavCity(\'' + slug + '\', this)">' +
            (isFav ? '❤️ 已收藏' : '🤍 收藏') +
          '</button>' +
          '<button class="action-btn" onclick="exportData(' + city.id + ', \'bus\')">📥 公交</button>' +
          '<button class="action-btn" onclick="exportData(' + city.id + ', \'metro\')">📥 地铁</button>' +
          '<button class="action-btn" onclick="exportData(' + city.id + ', \'attractions\')">📥 景区</button>' +
          '<a href="#/" class="action-btn">🏠 首页</a>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="tab-bar">' +
      '<button class="tab-item' + (defaultTab === 'attractions' ? ' on' : '') + '" onclick="switchTab(\'attractions\', this)">' +
        '<span class="tab-icon">🏞️</span><span>景区(' + attractions.length + ')</span>' +
      '</button>' +
      '<button class="tab-item' + (defaultTab === 'bus' ? ' on' : '') + '" onclick="switchTab(\'bus\', this)">' +
        '<span class="tab-icon">🚌</span><span>公交(' + busLines.length + ')</span>' +
      '</button>' +
      '<button class="tab-item' + (defaultTab === 'metro' ? ' on' : '') + '" onclick="switchTab(\'metro\', this)">' +
        '<span class="tab-icon">🚇</span><span>地铁(' + metroLines.length + ')</span>' +
      '</button>' +
      '<button class="tab-item' + (defaultTab === 'trip' ? ' on' : '') + '" onclick="switchTab(\'trip\', this)">' +
        '<span class="tab-icon">📋</span><span>行程</span>' +
      '</button>' +
    '</div>' +

    // 搜索过滤
    '<div class="filter-bar" id="filter-bar">' +
      '<input type="text" id="lineFilter" placeholder="🔍 搜索线路名或站点…" oninput="filterLines(this.value)" class="filter-input">' +
      '<span class="filter-count" id="filter-count"></span>' +
    '</div>' +

    '<div id="tab-attractions" class="tab-panel" style="' + (defaultTab !== 'attractions' ? 'display:none' : '') + '">' +
      '<div class="attraction-grid">' + (attrHtml || '<div class="empty-state">暂无景区数据</div>') + '</div>' +
    '</div>' +

    '<div id="tab-bus" class="tab-panel" style="' + (defaultTab !== 'bus' ? 'display:none' : '') + '">' +
      '<div class="line-list" id="bus-list">' + (busHtml || '<div class="empty-state">暂无公交数据</div>') + '</div>' +
    '</div>' +

    '<div id="tab-metro" class="tab-panel" style="' + (defaultTab !== 'metro' ? 'display:none' : '') + '">' +
      '<div class="line-list" id="metro-list">' + (metroHtml || '<div class="empty-state">暂无地铁数据</div>') + '</div>' +
    '</div>' +

    '<div id="tab-trip" class="tab-panel" style="display:none">' +
      '<div class="trip-panel">' +
        '<p class="trip-hint">基于本地公交、地铁和景区数据，为您智能推荐行程</p>' +
        '<div id="tripResult"></div>' +
        '<button class="btn-primary-lg" onclick="generateTrip(' + city.id + ')">🧭 生成推荐行程</button>' +
      '</div>' +
    '</div>';
}

// ========== 站点渲染（复用） ==========
function renderStations(stations, attractions, metroColor) {
  return stations.map(function(station, si) {
    var nearby = findNearbyAttractions(station, attractions);
    var nearbyHtml = nearby.length > 0 ? nearby.map(function(a) {
      return '<a href="#/attraction/' + a.id + '" class="nearby-attr" onclick="event.stopPropagation()">' +
        '<div class="nearby-attr-top">' +
          '<span class="nearby-emoji">' + getAttrEmoji(a.category) + '</span>' +
          '<span class="nearby-name">' + escHtml(a.name) + '</span>' +
          '<span class="nearby-stars">⭐ ' + (a.rating || '--') + '</span>' +
          '<span class="nearby-arrow">→</span>' +
        '</div>' +
        '<div class="nearby-desc">' + escHtml((a.description || '').substring(0, 80)) + '…</div>' +
      '</a>';
    }).join('') : '<div class="nearby-none">暂无附近景点</div>';

    var dotStyle = metroColor ? ' style="background:' + metroColor + ';"' : '';
    var dotClass = metroColor ? ' metro-dot' : '';

    return '<div class="station-wrap">' +
      '<div class="station-node' + dotClass + '"' + dotStyle + '></div>' +
      '<div class="station-connector"></div>' +
      '<div class="station-body">' +
        '<div class="station-name-row">' +
          '<span class="station-name">' + escHtml(station) + '</span>' +
          '<span class="station-num">第' + (si + 1) + '站</span>' +
        '</div>' +
        '<div class="nearby-box">' + nearbyHtml + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ========== 附近景点匹配 ==========
function findNearbyAttractions(stationName, attractions) {
  if (!attractions || !stationName) return [];
  var results = [];
  var seen = {};
  var station = stationName.replace(/(站|地铁站|公交站)$/, '');
  for (var i = 0; i < attractions.length; i++) {
    var a = attractions[i];
    if (seen[a.id]) continue;
    if ((a.nearby_stations && a.nearby_stations.indexOf(station) >= 0) ||
        (a.address && a.address.indexOf(station) >= 0)) {
      results.push(a);
      seen[a.id] = true;
    }
  }
  return results;
}

// ========== 景区详情页 ==========
async function renderAttraction(id) {
  var a = await api('/api/attractions/' + id);
  if (window.muqing) window.muqing.onAttraction();
  addRecentAttraction(parseInt(id));

  var nearbyAttractions = await api('/api/cities/' + a.city_id + '/attractions').catch(function() { return []; });
  var related = nearbyAttractions.filter(function(x) { return x.id != a.id; }).slice(0, 4);

  var relatedHtml = related.map(function(r) {
    return '<div class="related-card" onclick="navigate(\'/attraction/' + r.id + '\')">' +
      '<div class="related-img-wrap">' +
        '<img class="related-img" src="' + attrImgUrl(r.id) + '" alt="' + escHtml(r.name) + '" loading="lazy">' +
      '</div>' +
      '<div class="related-info">' +
        '<div class="related-name">' + escHtml(r.name) + '</div>' +
        '<div class="related-meta">⭐ ' + (r.rating || '--') + ' · ' + escHtml(r.ticket_price || '免费') + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  app.innerHTML =
    '<div class="attr-detail-page">' +
      '<div class="attr-detail-back">' +
        '<a href="#/city/' + a.city_slug + '" class="back-link">← 返回' + escHtml(a.city_name) + '</a>' +
      '</div>' +
      '<div class="attr-hero-wrap">' +
        '<img class="attr-hero-img" src="' + attrImgUrl(a.id) + '" alt="' + escHtml(a.name) + '" loading="lazy">' +
        '<div class="attr-hero-overlay">' +
          '<div class="attr-hero-cat">' + escHtml(a.category || '景点') + '</div>' +
          '<h1 class="attr-hero-title">' + escHtml(a.name) + '</h1>' +
          '<div class="attr-hero-rating">⭐ ' + (a.rating || '--') + ' 分</div>' +
        '</div>' +
      '</div>' +
      '<div class="attr-content-wrap">' +
        '<div class="attr-main-col">' +
          '<div class="attr-section">' +
            '<h2 class="attr-section-title">景区介绍</h2>' +
            '<p class="attr-desc">' + escHtml(a.description || '暂无详细介绍') + '</p>' +
          '</div>' +
          '<div class="attr-section">' +
            '<h2 class="attr-section-title">游览建议</h2>' +
            '<div class="attr-tips-box">' +
              '<p>' + escHtml(a.tips || '建议提前查看开放时间和门票信息，合理安排行程') + '</p>' +
            '</div>' +
          '</div>' +
          (related.length > 0 ? (
            '<div class="attr-section">' +
              '<h2 class="attr-section-title">附近景点</h2>' +
              '<div class="related-grid">' + relatedHtml + '</div>' +
            '</div>'
          ) : '') +
        '</div>' +
        '<div class="attr-side-col">' +
          '<div class="attr-info-card">' +
            '<div class="attr-info-row"><span class="attr-info-icon">📍</span><div><div class="attr-info-label">地址</div><div class="attr-info-val">' + escHtml(a.address || '--') + '</div></div></div>' +
            '<div class="attr-info-row"><span class="attr-info-icon">🕐</span><div><div class="attr-info-label">开放时间</div><div class="attr-info-val">' + escHtml(a.open_time || '--') + '</div></div></div>' +
            '<div class="attr-info-row"><span class="attr-info-icon">🎫</span><div><div class="attr-info-label">门票</div><div class="attr-info-val">' + escHtml(a.ticket_price || '免费') + '</div></div></div>' +
            '<div class="attr-info-row"><span class="attr-info-icon">🚉</span><div><div class="attr-info-label">附近交通</div><div class="attr-info-val">' + escHtml(a.nearby_stations || '--') + '</div></div></div>' +
          '</div>' +
          '<div class="attr-actions">' +
            '<button class="btn-primary-full" onclick="navigate(\'/city/' + a.city_slug + '?tab=bus\')">🚌 查看交通</button>' +
            '<button class="btn-outline-full" onclick="toggleAttrFav(' + a.id + ')">' + (isAttrFav(a.id) ? '♥ 已收藏' : '♡ 收藏景区') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// ========== 搜索（增强：支持拼音模糊匹配）==========
async function renderSearch(q) {
  if (window.muqing) window.muqing.onSearch();
  if (!q) {
    // 空搜索时显示 recently viewed
    var recentIds = JSON.parse(localStorage.getItem('recent-attractions') || '[]');
    if (recentIds.length === 0) {
      app.innerHTML = '<div class="container"><h2>请输入搜索关键词</h2></div>';
      return;
    }
    // 加载最近浏览的景点
    var allAttrs = await api('/api/attractions');
    var recent = allAttrs.filter(function(a) { return recentIds.indexOf(a.id) >= 0; });
    if (recent.length === 0) { app.innerHTML = '<div class="container"><h2>请输入搜索关键词</h2></div>'; return; }
    var html = buildAttractionCards(recent.slice(0, 6));
    app.innerHTML =
      '<div class="container">' +
        '<div class="search-header">' +
          '<h2 class="section-title">📋 最近浏览 <span class="result-count">' + recent.length + ' 个</span></h2>' +
        '</div>' +
        '<div class="attraction-grid">' + html + '</div>' +
      '</div>';
    return;
  }

  var results = [];
  var isPinyinQuery = /^[a-z]{1,10}$/.test(q.toLowerCase().trim());

  if (isPinyinQuery) {
    // 纯拼音查询：获取全部景点，本地模糊匹配
    var all = await api('/api/attractions');
    results = window.PinyinUtil.fuzzySearchAttractions(all, q.toLowerCase().trim()).slice(0, 30);
  } else {
    // 正常中文/混合查询：先用服务器 LIKE，再用拼音补充
    var serverResults = await api('/api/search?q=' + encodeURIComponent(q));
    var serverIds = {};
    serverResults.forEach(function(a) { serverIds[a.id] = true; });
    // 如果服务器结果少于10条，用拼音搜索补充
    if (serverResults.length < 10) {
      var all = await api('/api/attractions');
      var extra = window.PinyinUtil.fuzzySearchAttractions(all, q.toLowerCase().trim())
        .filter(function(a) { return !serverIds[a.id]; })
        .slice(0, 20 - serverResults.length);
      serverResults = serverResults.concat(extra);
    }
    results = serverResults;
  }

  var html = buildAttractionCards(results.slice(0, 20));
  app.innerHTML =
    '<div class="container">' +
      '<div class="search-header">' +
        '<h2 class="section-title">🔍 "' + escHtml(q) + '" <span class="result-count">' + results.length + ' 个结果</span></h2>' +
      '</div>' +
      '<div class="attraction-grid">' + (html || '<div class="empty-state">未找到相关结果</div>') + '</div>' +
    '</div>';
}

// 通用景点卡片HTML构建器（供搜索和最近浏览共用）
function buildAttractionCards(attractions) {
  return attractions.map(function(a) {
    return '<div class="attraction-card" onclick="navigate(\'/attraction/' + a.id + '\')">' +
      '<div class="attraction-img-wrap">' +
        '<img class="attraction-img" src="' + attrImgUrl(a.id) + '" alt="' + escHtml(a.name) + '" loading="lazy">' +
        '<div class="attraction-img-overlay"><span class="attraction-cat">' + escHtml(a.city_name || '') + '</span></div>' +
      '</div>' +
      '<div class="attraction-body">' +
        '<h3>' + escHtml(a.name) + '</h3>' +
        '<p class="attraction-desc">' + escHtml((a.description || '').substring(0, 60)) + '…</p>' +
        '<div class="attraction-foot">' +
          '<span class="attraction-rating">⭐ ' + (a.rating || '--') + '</span>' +
          '<span class="attraction-price">' + escHtml(a.ticket_price || '免费') + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// 记录最近浏览（景点详情页调用）
function addRecentAttraction(id) {
  var recent = JSON.parse(localStorage.getItem('recent-attractions') || '[]');
  recent = recent.filter(function(x) { return x !== id; });
  recent.unshift(id);
  if (recent.length > 20) recent = recent.slice(0, 20);
  localStorage.setItem('recent-attractions', JSON.stringify(recent));
}

// ========== 反馈 ==========
function renderFeedback() {
  app.innerHTML =
    '<div class="container">' +
      '<h2 class="section-title">📝 意见反馈</h2>' +
      '<div class="feedback-form">' +
        '<div class="form-group">' +
          '<label>反馈类型</label>' +
          '<select id="fb-type">' +
            '<option value="data-error">数据错误</option>' +
            '<option value="bug">功能异常</option>' +
            '<option value="image">图片问题</option>' +
            '<option value="suggestion">改进建议</option>' +
            '<option value="other">其他</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>反馈内容 *</label>' +
          '<textarea id="fb-content" rows="5" placeholder="请详细描述..."></textarea>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>联系方式（选填）</label>' +
          '<input type="text" id="fb-contact" placeholder="邮箱或手机号">' +
        '</div>' +
        '<button class="btn-primary-lg" onclick="submitFeedback()">提交反馈</button>' +
      '</div>' +
    '</div>';
}

async function submitFeedback() {
  var content = document.getElementById('fb-content').value.trim();
  if (!content) { alert('请填写反馈内容'); return; }
  await fetch(API_BASE + '/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: document.getElementById('fb-type').value,
      content: content,
      contact: document.getElementById('fb-contact').value
    })
  });
  alert('感谢您的反馈！');
  navigate('/');
}

// ========== 交互函数 ==========
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab-item').forEach(function(el) { el.classList.remove('on'); });
  var panel = document.getElementById('tab-' + tab);
  if (panel) panel.style.display = 'block';
  if (btn) btn.classList.add('on');
  // 搜索过滤条只在公交/地铁tab显示
  var filterBar = document.getElementById('filter-bar');
  if (filterBar) filterBar.style.display = (tab === 'bus' || tab === 'metro') ? 'flex' : 'none';
}

function toggleLine(header) {
  var card = header.parentElement;
  var stations = card.querySelector('.line-stations');
  var icon = header.querySelector('.expand-icon');
  var isOpen = stations.style.display !== 'none';
  stations.style.display = isOpen ? 'none' : 'block';
  icon.textContent = isOpen ? '▾' : '▴';
  if (!isOpen) {
    stations.style.animation = 'slideDown 0.3s ease';
    stations.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function filterLines(query) {
  var q = query.toLowerCase();
  var visible = 0;
  var total = 0;
  document.querySelectorAll('.line-card').forEach(function(card) {
    total++;
    var title = card.querySelector('.line-title');
    var route = card.querySelector('.line-route');
    var text = (title ? title.textContent : '') + ' ' + (route ? route.textContent : '');
    // 也搜索站点
    var stationText = '';
    card.querySelectorAll('.station-name').forEach(function(s) { stationText += s.textContent + ' '; });
    var fullText = (text + ' ' + stationText).toLowerCase();
    if (!q || fullText.indexOf(q) >= 0) {
      card.style.display = 'block';
      visible++;
    } else {
      card.style.display = 'none';
    }
  });
  var countEl = document.getElementById('filter-count');
  if (countEl) countEl.textContent = q ? visible + '/' + total : '';
}

function doSearch() {
  if (window.muqing) window.muqing.onSearch();
  var q = document.getElementById('searchInput').value.trim();
  if (q) navigate('/search?q=' + encodeURIComponent(q));
}

function toggleFavCity(slug, btn) {
  var favs = JSON.parse(localStorage.getItem('fav-cities') || '[]');
  var idx = favs.indexOf(slug);
  if (idx >= 0) { favs.splice(idx, 1); btn.textContent = '🤍 收藏'; btn.classList.remove('active'); }
  else { favs.push(slug); btn.textContent = '❤️ 已收藏'; btn.classList.add('active'); }
  localStorage.setItem('fav-cities', JSON.stringify(favs));
}

function isAttrFav(id) { return JSON.parse(localStorage.getItem('fav-attractions') || '[]').indexOf(id) >= 0; }

function toggleAttrFav(id, btn) {
  var favs = JSON.parse(localStorage.getItem('fav-attractions') || '[]');
  var idx = favs.indexOf(id);
  if (idx >= 0) { favs.splice(idx, 1); if (btn) { btn.classList.remove('active'); btn.textContent = '♡'; } }
  else { favs.push(id); if (btn) { btn.classList.add('active'); btn.textContent = '♥'; } }
  localStorage.setItem('fav-attractions', JSON.stringify(favs));
}

function exportData(cityId, type) { window.open(API_BASE + '/api/export/' + cityId + '/' + type, '_blank'); }

async function generateTrip(cityId) {
  var div = document.getElementById('tripResult');
  div.innerHTML = '<div class="loading" style="padding:40px;"><div class="spinner"></div><p>智能规划中…</p></div>';
  var attractions = await api('/api/cities/' + cityId + '/attractions');
  if (!attractions || attractions.length === 0) {
    div.innerHTML = '<div class="empty-state">暂无景区数据</div>';
    return;
  }

  // 按评分排序，取前6个不同类别的景点
  var sorted = attractions.slice().sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); });
  var picked = [];
  var usedCats = {};
  for (var i = 0; i < sorted.length && picked.length < 6; i++) {
    var cat = sorted[i].category || '其他';
    if (!usedCats[cat]) { usedCats[cat] = true; picked.push(sorted[i]); }
  }

  // 时间段分配：上午/下午/晚上 轮流
  var periods = ['🌅 上午', '☀️ 下午', '🌙 晚上', '🌅 次日上午', '☀️ 次日下午', '🌙 次日晚上'];
  // 估算游览时长（小时）
  var estHours = function(a) {
    var cat = a.category || '';
    if (cat.indexOf('博物馆') >= 0 || cat.indexOf('纪念馆') >= 0) return 2;
    if (cat.indexOf('公园') >= 0 || cat.indexOf('广场') >= 0 || cat.indexOf('街区') >= 0) return 2.5;
    if (cat.indexOf('主题乐园') >= 0 || cat.indexOf('游乐场') >= 0) return 4;
    if (cat.indexOf('古镇') >= 0 || cat.indexOf('历史') >= 0 || cat.indexOf('遗迹') >= 0) return 3;
    if (cat.indexOf('自然') >= 0 || cat.indexOf('景区') >= 0 || cat.indexOf('湖泊') >= 0 || cat.indexOf('山') >= 0) return 3.5;
    return 2;
  };
  // 估算门票
  var estTicket = function(a) {
    var p = a.ticket_price || '';
    if (p === '免费' || p === '') return '免费';
    return p;
  };

  var itemsHtml = picked.map(function(a, i) {
    var hours = estHours(a);
    var totalHours = hours + (picked[i-1] ? estHours(picked[i-1]) : 0);
    return '<div class="trip-item" onclick="navigate(\'/attraction/' + a.id + '\')">' +
      '<div class="trip-period">' + periods[i] + '</div>' +
      '<div class="trip-num">' + (i + 1) + '</div>' +
      '<div class="trip-info">' +
        '<div class="trip-name">' + getAttrEmoji(a.category) + ' ' + escHtml(a.name) + '</div>' +
        '<div class="trip-meta">⏰ 约' + hours + 'h · 🎫 ' + escHtml(estTicket(a)) + ' · ⭐ ' + (a.rating || '--') + '</div>' +
        '<div class="trip-desc">' + escHtml((a.description || '').substring(0, 80)) + '</div>' +
      '</div>' +
      '<div class="trip-arrow">→</div>' +
    '</div>';
  }).join('');

  var totalHours = picked.reduce(function(s, a) { return s + estHours(a); }, 0);
  var totalCost = picked.reduce(function(s, a) {
    var p = a.ticket_price || '';
    if (p === '免费' || p === '') return s;
    var m = p.match(/\d+/);
    return s + (m ? parseInt(m[0]) : 0);
  }, 0);

  div.innerHTML =
    '<div class="trip-summary">' +
      '<div class="trip-stat"><span class="trip-stat-num">' + picked.length + '</span><span class="trip-stat-label">个景点</span></div>' +
      '<div class="trip-stat"><span class="trip-stat-num">' + totalHours.toFixed(1) + '</span><span class="trip-stat-label">小时总计</span></div>' +
      '<div class="trip-stat"><span class="trip-stat-num">' + (totalCost > 0 ? totalCost + '元' : '免费') + '</span><span class="trip-stat-label">预估门票</span></div>' +
    '</div>' +
    '<div class="trip-result">' +
      '<h3 class="trip-result-title">🎯 精选行程</h3>' +
      itemsHtml +
      '<p class="trip-disclaimer">💡 行程基于评分自动生成，实际出行请关注开放时间和实时信息</p>' +
    '</div>';
}

// ========== 颜色/Emoji映射 ==========
function getMetroColor(code) {
  var c = { '1':'#E74C3C', '2':'#27AE60', '3':'#F39C12', '4':'#9B59B6', '5':'#3498DB', '6':'#E67E22', '7':'#1ABC9C', '8':'#8E44AD', '9':'#2ECC71', '10':'#E74C3C', '11':'#F39C12', '14':'#D35400' };
  return c[code] || '#4A9FD9';
}

function getCityGradient(slug) {
  var g = {
    xian:'linear-gradient(135deg,#E8D5B7,#F5E6CC,#FFF8F0)',
    beijing:'linear-gradient(135deg,#D4E6F1,#EBF5FB)',
    shanghai:'linear-gradient(135deg,#D5F5E3,#EAFAF1)',
    chengdu:'linear-gradient(135deg,#FADBD8,#FDEDEC)',
    hangzhou:'linear-gradient(135deg,#D5F5E3,#E8F8F5)',
    guangzhou:'linear-gradient(135deg,#FDEBD0,#FEF9E7)',
    nanjing:'linear-gradient(135deg,#E8DAEF,#F4ECF7)',
    wuhan:'linear-gradient(135deg,#D6EAF8,#EBF5FB)',
    chongqing:'linear-gradient(135deg,#FADBD8,#F5B7B1)',
    suzhou:'linear-gradient(135deg,#D5F5E3,#A9DFBF)',
    kunming:'linear-gradient(135deg,#AED6F1,#85C1E9)',
    harbin:'linear-gradient(135deg,#EBF5FB,#D6EAF8)',
    changsha:'linear-gradient(135deg,#FADBD8,#F5B7B1)',
    jinan:'linear-gradient(135deg,#D5F5E3,#A9DFBF)',
    lanzhou:'linear-gradient(135deg,#F5CBA7,#FDEBD0)',
    shenzhen:'linear-gradient(135deg,#AED6F1,#D6EAF8)',
    tianjin:'linear-gradient(135deg,#D5F5E3,#ABEBC6)',
    nanchang:'linear-gradient(135deg,#FADBD8,#F5B7B1)',
    zhengzhou:'linear-gradient(135deg,#FCF3CF,#F9E79F)',
    shenyang:'linear-gradient(135deg,#D6EAF8,#AED6F1)',
    fuzhou:'linear-gradient(135deg,#D5F5E3,#ABEBC6)',
    sanya:'linear-gradient(135deg,#AED6F1,#85C1E9)',
    hefei:'linear-gradient(135deg,#D5F5E3,#A9DFBF)',
    guiyang:'linear-gradient(135deg,#D5F5E3,#ABEBC6)',
    taiyuan:'linear-gradient(135deg,#F5CBA7,#FDEBD0)',
    changchun:'linear-gradient(135deg,#EBF5FB,#D6EAF8)',
    haikou:'linear-gradient(135deg,#AED6F1,#85C1E9)',
    shijiazhuang:'linear-gradient(135deg,#FADBD8,#F5B7B1)',
    yinchuan:'linear-gradient(135deg,#FCF3CF,#F9E79F)',
    xining:'linear-gradient(135deg,#D6EAF8,#AED6F1)',
    xiamen:'linear-gradient(135deg,#AED6F1,#85C1E9)',
    luoyang:'linear-gradient(135deg,#E8D5B7,#F5E6CC)',
    nanning:'linear-gradient(135deg,#A9DFBF,#82E0AA)',
    ningbo:'linear-gradient(135deg,#AED6F1,#D6EAF8)',
    wulumuqi:'linear-gradient(135deg,#D6EAF8,#AED6F1)',
    hohhot:'linear-gradient(135deg,#FCF3CF,#F9E79F)'
  };
  return g[slug] || 'linear-gradient(135deg,#E8F4FD,#FFF8F0)';
}

function getCityEmoji(slug) {
  var e = {
    xian:'🏛️', beijing:'🏯', shanghai:'🌃', chengdu:'🐼',
    hangzhou:'🍃', guangzhou:'🌺', nanjing:'🏯', wuhan:'🌸',
    chongqing:'🌶️', suzhou:'🌸', kunming:'🌸',
    harbin:'❄️', changsha:'🌶️', jinan:'⛰️',
    lanzhou:'🏔️', shenzhen:'🏙️', tianjin:'🏰', nanchang:'🏯',
    zhengzhou:'🏛️', shenyang:'🏯', fuzhou:'🍃', sanya:'🏖️',
    hefei:'🏯', guiyang:'🍃', taiyuan:'🏛️', changchun:'❄️',
    haikou:'🏖️', shijiazhuang:'🏛️', yinchuan:'🏔️', xining:'🏔️',
    xiamen:'🌊', luoyang:'🏛️', nanning:'🌴', ningbo:'🌊',
    wulumuqi:'🏔️', hohhot:'🐎'
  };
  return e[slug] || '🏙️';
}

function getAttrEmoji(cat) {
  var e = {
    '历史古迹':'🏛️', '自然风光':'🏔️',
    '文化体验':'🎭', '宗教场所':'⛩️',
    '主题公园':'🎢', '博物馆':'🏛️',
    '遗址公园':'🏯'
  };
  return e[cat] || '🏞️';
}

// 搜索框回车
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.activeElement.id === 'searchInput') doSearch();
});
