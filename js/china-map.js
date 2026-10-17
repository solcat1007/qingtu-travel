/**
 * 晴途 - 3D中国地图主逻辑
 * 基于 Three.js 的交互式地图可视化
 * 包含：城市地标、地铁线路、公交线路、航班航线、高铁线路、沐晴角色
 */

(function () {
  'use strict';

  // ============================================
  // 全局常量
  // ============================================
  const API_BASE = '/api';
  const COORD_SCALE = 1.8;
  const BACKGROUND_COLOR = 0x0a0e27;

  // 颜色映射：中文颜色名 → Hex
  const COLOR_MAP = {
    '蓝色': 0x3B82F6,
    '红色': 0xEF4444,
    '绿色': 0x22C55E,
    '紫色': 0x8B5CF6,
    '黄色': 0xEAB308,
    '橙色': 0xF97316,
    '青色': 0x06B6D4,
    '粉色': 0xEC4899,
    '棕色': 0x92400E,
    '白色': 0xFFFFFF,
    '灰色': 0x6B7280,
    '黑色': 0x111827
  };

  // 航班航线数据（60条） - 更丰富的颜色
  const FLIGHT_COLORS = [
    0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7,
    0xDDA0DD, 0x98D8C8, 0xF7DC6F, 0xBB8FCE, 0x85C1E9,
    0xF8B500, 0x00CED1, 0xFF7F50, 0x9370DB, 0x20B2AA,
    0xFF69B4, 0x00FA9A, 0xFFD700, 0x7B68EE, 0x00CED1
  ];

  const FLIGHT_ROUTES = [
    // 现有30条航线（保留）
    { name: '京沪线', from: '北京', to: '上海' },
    { name: '京广线', from: '北京', to: '广州' },
    { name: '京深线', from: '北京', to: '深圳' },
    { name: '京成线', from: '北京', to: '成都' },
    { name: '京西线', from: '北京', to: '西安' },
    { name: '沪广线', from: '上海', to: '广州' },
    { name: '沪深线', from: '上海', to: '深圳' },
    { name: '沪成线', from: '上海', to: '成都' },
    { name: '沪渝线', from: '上海', to: '重庆' },
    { name: '沪昆线', from: '上海', to: '昆明' },
    { name: '广深线', from: '广州', to: '深圳' },
    { name: '广成线', from: '广州', to: '成都' },
    { name: '广杭线', from: '广州', to: '杭州' },
    { name: '广宁线', from: '广州', to: '南京' },
    { name: '广厦线', from: '广州', to: '厦门' },
    { name: '深成线', from: '深圳', to: '成都' },
    { name: '深渝线', from: '深圳', to: '重庆' },
    { name: '杭西线', from: '杭州', to: '西安' },
    { name: '成昆线', from: '成都', to: '昆明' },
    { name: '成拉线', from: '成都', to: '拉萨' },
    { name: '北京-东京', from: '北京', to: '东京' },
    { name: '上海-大阪', from: '上海', to: '大阪' },
    { name: '广州-曼谷', from: '广州', to: '曼谷' },
    { name: '深圳-新加坡', from: '深圳', to: '新加坡' },
    { name: '成都-加德满都', from: '成都', to: '加德满都' },
    { name: '北京-首尔', from: '北京', to: '首尔' },
    { name: '上海-台北', from: '上海', to: '台北' },
    { name: '广州-吉隆坡', from: '广州', to: '吉隆坡' },
    { name: '北京-新加坡', from: '北京', to: '新加坡' },
    { name: '昆明-曼德勒', from: '昆明', to: '曼德勒' },
    // 新增30条国际航线
    { name: '京港线', from: '北京', to: '香港' },
    { name: '沪港线', from: '上海', to: '香港' },
    { name: '广港线', from: '广州', to: '香港' },
    { name: '北京-巴黎', from: '北京', to: '巴黎' },
    { name: '北京-伦敦', from: '北京', to: '伦敦' },
    { name: '北京-纽约', from: '北京', to: '纽约' },
    { name: '北京-莫斯科', from: '北京', to: '莫斯科' },
    { name: '北京-悉尼', from: '北京', to: '悉尼' },
    { name: '北京-迪拜', from: '北京', to: '迪拜' },
    { name: '上海-纽约', from: '上海', to: '纽约' },
    { name: '上海-伦敦', from: '上海', to: '伦敦' },
    { name: '上海-巴黎', from: '上海', to: '巴黎' },
    { name: '上海-东京', from: '上海', to: '东京' },
    { name: '上海-首尔', from: '上海', to: '首尔' },
    { name: '广州-东京', from: '广州', to: '东京' },
    { name: '广州-大阪', from: '广州', to: '大阪' },
    { name: '广州-悉尼', from: '广州', to: '悉尼' },
    { name: '广州-迪拜', from: '广州', to: '迪拜' },
    { name: '深圳-东京', from: '深圳', to: '东京' },
    { name: '深圳-香港', from: '深圳', to: '香港' },
    { name: '成都-东京', from: '成都', to: '东京' },
    { name: '成都-新加坡', from: '成都', to: '新加坡' },
    { name: '重庆-曼谷', from: '重庆', to: '曼谷' },
    { name: '昆明-曼谷', from: '昆明', to: '曼谷' },
    { name: '杭州-东京', from: '杭州', to: '东京' },
    { name: '西安-伊斯坦布尔', from: '西安', to: '伊斯坦布尔' },
    { name: '南京-大阪', from: '南京', to: '大阪' },
    { name: '武汉-东京', from: '武汉', to: '东京' },
    { name: '厦门-马尼拉', from: '厦门', to: '马尼拉' },
    { name: '香港-新加坡', from: '香港', to: '新加坡' }
  ];

  // 高铁线路数据（40条） - 更丰富的颜色
  const HSR_COLORS = [
    0xF97316, 0xEAB308, 0x22C55E, 0x8B5CF6, 0x3B82F6,
    0xEF4444, 0x06B6D4, 0xEC4899, 0xF59E0B, 0x10B981,
    0x6366F1, 0xD946EF, 0x14B8A6, 0xF43F5E, 0x84CC16,
    0xA855F7, 0x0EA5E9, 0xFB923C, 0x4ADE80, 0xE879F9
  ];

  const HIGH_SPEED_ROUTES = [
    // 现有20条（保留）
    { name: '京沪高铁', cities: ['北京', '天津', '济南', '南京', '上海'] },
    { name: '京广高铁', cities: ['北京', '石家庄', '郑州', '武汉', '长沙', '广州', '深圳'] },
    { name: '沪昆高铁', cities: ['上海', '杭州', '南昌', '长沙', '贵阳', '昆明'] },
    { name: '哈大高铁', cities: ['哈尔滨', '长春', '沈阳', '大连'] },
    { name: '兰新高铁', cities: ['兰州', '西宁', '乌鲁木齐'] },
    { name: '徐新高铁', cities: ['徐州', '郑州', '西安', '兰州', '乌鲁木齐'] },
    { name: '沪汉高铁', cities: ['上海', '南京', '武汉', '重庆', '成都'] },
    { name: '沿海高铁', cities: ['大连', '天津', '青岛', '上海', '杭州', '福州', '厦门', '深圳', '广州', '海口'] },
    { name: '郑西高铁', cities: ['郑州', '洛阳', '西安'] },
    { name: '哈齐高铁', cities: ['哈尔滨', '齐齐哈尔'] },
    { name: '长吉高铁', cities: ['长春', '吉林'] },
    { name: '长珲高铁', cities: ['长春', '延吉', '珲春'] },
    { name: '京张高铁', cities: ['北京', '张家口'] },
    { name: '京呼高铁', cities: ['北京', '呼和浩特'] },
    { name: '贵广高铁', cities: ['贵阳', '桂林', '贺州', '广州'] },
    { name: '南广高铁', cities: ['南宁', '贵港', '玉林', '广州'] },
    { name: '渝贵高铁', cities: ['重庆', '贵阳'] },
    { name: '西成高铁', cities: ['西安', '汉中', '成都'] },
    { name: '成贵高铁', cities: ['成都', '乐山', '贵阳'] },
    { name: '杭黄高铁', cities: ['杭州', '黄山'] },
    // 新增20条高铁路线
    { name: '合宁高铁', cities: ['合肥', '南京'] },
    { name: '福厦高铁', cities: ['福州', '厦门'] },
    { name: '昌长高铁', cities: ['南昌', '长沙'] },
    { name: '南昆高铁', cities: ['南宁', '昆明'] },
    { name: '贵昆高铁', cities: ['贵阳', '昆明'] },
    { name: '太石高铁', cities: ['太原', '石家庄'] },
    { name: '呼包高铁', cities: ['呼和浩特', '包头'] },
    { name: '长哈高铁', cities: ['长春', '哈尔滨'] },
    { name: '济青高铁', cities: ['济南', '青岛'] },
    { name: '杭甬高铁', cities: ['杭州', '宁波'] },
    { name: '长广高铁', cities: ['长沙', '广州'] },
    { name: '合武高铁', cities: ['合肥', '武汉'] },
    { name: '西兰高铁', cities: ['西安', '兰州'] },
    { name: '渝成高铁', cities: ['重庆', '成都'] },
    { name: '昆南高铁', cities: ['昆明', '南宁'] },
    { name: '福杭高铁', cities: ['福州', '杭州'] },
    { name: '昌福高铁', cities: ['南昌', '福州'] },
    { name: '贵渝高铁', cities: ['贵阳', '重庆'] },
    { name: '兰西高铁', cities: ['兰州', '西宁'] },
    { name: '银兰高铁', cities: ['银川', '兰州'] }
  ];

  // 12种地标类型 → 对应城市列表
  const LANDMARK_TYPES = {
    '电视塔': ['北京', '上海', '广州', '深圳', '重庆', '武汉', '天津', '郑州'],
    '宝塔': ['西安', '南京', '杭州', '苏州', '扬州', '南昌', '长沙'],
    '楼阁': ['济南', '昆明', '贵阳'],
    '圆顶': ['拉萨', '呼和浩特', '乌鲁木齐', '兰州'],
    '宫殿': ['北京', '沈阳'],
    '场馆': ['北京', '广州', '上海', '武汉'],
    '吊脚楼': ['桂林', '丽江', '大理', '阳朔', '张家界'],
    '灯塔': ['青岛', '大连', '宁波', '厦门', '三亚'],
    '石窟': ['洛阳', '大同', '重庆', '天水'],
    '摩天轮': ['天津', '香港'],
    '教堂': ['哈尔滨', '青岛', '沈阳'],
    '现代大厦': ['深圳', '成都', '杭州', '广州']
  };

  // 沐晴气泡内容池
  const BUBBLE_MESSAGES = [
    '欢迎来到晴途！点击城市开始探索吧~',
    '中国那么大，一起去看看吧~',
    '点击城市看看有什么好玩的地方~',
    '想知道各地美食？点个城市试试',
    '晴途在这里陪你探索中国！',
    '每座城市都有独特的魅力~',
    '快来点击地图，发现你的下一站！',
    '景点、美食、路线，晴途全知道~',
    '从北京到广州，从上海到成都',
    '带你走遍中国的每个角落！'
  ];

  // 筛选模式
  const FILTER_MODES = ['全部', '公交', '地铁', '航线', '高铁'];

  // ============================================
  // 全局变量
  // ============================================
  let scene, camera, renderer, controls, clock;
  let cityData = [];           // 所有城市
  let cityMap = {};            // name → city
  let metroLinesData = [];     // 地铁线路
  let busLinesData = [];       // 公交线路
  let currentFilter = '全部';  // 当前筛选

  // Three.js 对象引用
  let cityLandmarks = [];      // 城市地标 meshes
  let metroGroup = null;        // 地铁线路组
  let busGroup = null;         // 公交线路组
  let flightGroup = null;       // 航班航线组
  let hsrGroup = null;          // 高铁线路组
  let metroTrains = [];        // 地铁列车小球
  let hsrTrains = [];           // 高铁列车小球
  let flightPlanes = [];       // 飞机模型

  // 沐晴相关
  let mascotBubbleTimer = null;
  let mascotBubbleIndex = 0;

  // DOM引用
  let progressBar = null;
  let filterBtns = [];
  let infoPanel = null;

  // ============================================
  // 工具函数
  // ============================================

  /**
   * 经纬度 → Three.js 3D坐标
   */
  function geoTo3D(lat, lng) {
    return {
      x: (lng - 105) * COORD_SCALE,
      y: 0,
      z: (36 - lat) * COORD_SCALE
    };
  }

  /**
   * 解析地铁线路颜色
   * 支持中文颜色名和十六进制
   */
  function parseColor(colorStr) {
    if (!colorStr) return 0x888888;
    const trimmed = colorStr.trim();
    // 直接hex
    if (trimmed.startsWith('#')) {
      return parseInt(trimmed.slice(1), 16);
    }
    // 六位hex
    if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
      return parseInt(trimmed, 16);
    }
    // 中文颜色名
    if (COLOR_MAP[trimmed]) return COLOR_MAP[trimmed];
    // 英文颜色名
    const englishMap = {
      'blue': 0x3B82F6, 'red': 0xEF4444, 'green': 0x22C55E,
      'purple': 0x8B5CF6, 'yellow': 0xEAB308, 'orange': 0xF97316,
      'cyan': 0x06B6D4, 'pink': 0xEC4899, 'brown': 0x92400E,
      'white': 0xFFFFFF, 'gray': 0x6B7280, 'grey': 0x6B7280,
      'black': 0x111827
    };
    return englishMap[trimmed.toLowerCase()] || 0x888888;
  }

  /**
   * 日志输出
   */
  function log(msg) {
    console.log('[晴途地图]', msg);
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = msg;
  }

  /**
   * 错误提示
   */
  function showError(msg) {
    console.error('[晴途错误]', msg);
    const el = document.getElementById('error-msg');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(function () { el.style.display = 'none'; }, 5000);
    }
  }

  /**
   * 更新加载进度
   */
  function updateProgress(current, total, label) {
    if (!progressBar) return;
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.width = pct + '%';
    log(label + ' (' + pct + '%)');
  }

  // ============================================
  // 场景初始化
  // ============================================

  // 景点脉冲环存储
  let attractionRings = [];

  /**
   * 初始化 Three.js 场景
   */
  function initScene() {
    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.fog = new THREE.FogExp2(BACKGROUND_COLOR, 0.003);

    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 80, 100);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 时钟
    clock = new THREE.Clock();

    // 控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 300;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 0, 0);

    // 灯光
    setupLights();

    // 星空背景
    createStarfield();

    // 地面
    createGround();

    // 云朵装饰
    createClouds();

    log('场景初始化完成');
  }

  /**
   * 设置灯光
   */
  function setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x7eb8da, 0.4);
    scene.add(ambientLight);

    // 主方向光
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -150;
    dirLight.shadow.camera.right = 150;
    dirLight.shadow.camera.top = 150;
    dirLight.shadow.camera.bottom = -150;
    scene.add(dirLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0x5a9bc7, 0.3);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);

    // 半球光
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x1a3a5c, 0.3);
    scene.add(hemiLight);
  }

  /**
   * 创建星空背景
   */
  function createStarfield() {
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 600 + Math.random() * 400;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // 颜色：白色到淡蓝
      const t = Math.random();
      colors[i * 3] = 0.8 + t * 0.2;
      colors[i * 3 + 1] = 0.8 + t * 0.2;
      colors[i * 3 + 2] = 1.0;

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  }

  /**
   * 创建地面
   */
  function createGround() {
    // 主地面圆
    const groundGeo = new THREE.CircleGeometry(120, 64);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0x0f1f3a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // 经纬网格线
    const gridHelper = new THREE.GridHelper(200, 40, 0x1e3a5f, 0x152a45);
    gridHelper.position.y = -0.4;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
  }

  // ============================================
  // 城市地标
  // ============================================

  /**
   * 创建城市地标（所有192个城市）
   */
  function createCityLandmarks() {
    cityLandmarks = [];

    cityData.forEach(function (city) {
      if (!city.latitude || !city.longitude) return;

      const pos = geoTo3D(city.latitude, city.longitude);
      const type = getLandmarkType(city.name);
      const landmark = createLandmarkByType(type, pos.x, pos.z);

      landmark.userData = { city: city, type: 'landmark' };
      scene.add(landmark);
      cityLandmarks.push(landmark);

      // 同时创建底部圆环
      const ring = createCityRing(pos.x, pos.z, type);
      scene.add(ring);
    });

    log('创建了 ' + cityLandmarks.length + ' 个城市地标');

    // 为城市地标创建景点脉冲环
    createAttractionPulseRings();
  }

  /**
   * 为城市地标创建景点脉冲光环
   */
  function createAttractionPulseRings() {
    attractionRings = [];
    cityLandmarks.forEach(function(landmark) {
      if (!landmark.userData || !landmark.userData.city) return;
      var attCount = landmark.userData.city.attractionCount || 0;
      if (attCount === 0) return;
      var color = TYPE_COLORS[getLandmarkType(landmark.userData.city.name)] || 0x7eb8da;
      for (var i = 0; i < Math.min(attCount, 4); i++) {
        var ringGeo = new THREE.RingGeometry(0.5, 0.8, 24);
        var ringMat = new THREE.MeshBasicMaterial({
          color: color, transparent: true, opacity: 0.5, side: THREE.DoubleSide
        });
        var ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(landmark.position);
        ring.position.y = 0.15;
        ring.userData = {
          phase: Math.random() * Math.PI * 2,
          speed: 1.2 + Math.random() * 2.5,
          baseScale: 0.3 + Math.random() * 0.4,
          offset: i * 2.1
        };
        scene.add(ring);
        attractionRings.push(ring);
      }
    });
    log('创建了 ' + attractionRings.length + ' 个景点脉冲环');
  }

  /**
   * 根据城市名确定地标类型
   */
  function getLandmarkType(cityName) {
    for (var type in LANDMARK_TYPES) {
      if (LANDMARK_TYPES.hasOwnProperty(type)) {
        if (LANDMARK_TYPES[type].indexOf(cityName) !== -1) {
          return type;
        }
      }
    }
    // 默认用电视塔
    return '电视塔';
  }

  /**
   * 创建城市底部光环
   */
  function createCityRing(x, z, type) {
    var colors = {
      '电视塔': 0x7eb8da, '宝塔': 0xf4b8c5, '楼阁': 0xa8d4a2,
      '圆顶': 0xf5e6a3, '宫殿': 0xe8d4a8, '场馆': 0x9bc7da,
      '吊脚楼': 0xd4a87a, '灯塔': 0x87ceeb, '石窟': 0xc4a882,
      '摩天轮': 0xe0b8d4, '教堂': 0xd4d4d4, '现代大厦': 0xb8d4e8
    };
    var color = colors[type] || 0x7eb8da;

    var ringGeo = new THREE.RingGeometry(0.8, 1.3, 32);
    var ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, z);
    return ring;
  }

  /**
   * 按地标类型创建 Three.js 几何体
   */
  function createLandmarkByType(type, x, z) {
    var group = new THREE.Group();
    group.position.set(x, 0, z);

    var colors = {
      '电视塔': 0x7eb8da, '宝塔': 0xf4b8c5, '楼阁': 0xa8d4a2,
      '圆顶': 0xf5e6a3, '宫殿': 0xe8d4a8, '场馆': 0x9bc7da,
      '吊脚楼': 0xd4a87a, '灯塔': 0x87ceeb, '石窟': 0xc4a882,
      '摩天轮': 0xe0b8d4, '教堂': 0xd4d4d4, '现代大厦': 0xb8d4e8
    };
    var color = colors[type] || 0x7eb8da;
    var mat = new THREE.MeshPhongMaterial({ color: color, transparent: true, opacity: 0.9 });

    switch (type) {
      case '电视塔': {
        // 圆柱塔身 + 顶部天线
        var tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 4, 8), mat);
        tower.position.y = 2;
        var antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), mat);
        antenna.position.y = 5;
        group.add(tower); group.add(antenna);
        break;
      }
      case '宝塔': {
        // 多层宝塔
        for (var i = 0; i < 5; i++) {
          var level = new THREE.Mesh(new THREE.CylinderGeometry(0.8 - i * 0.1, 0.9 - i * 0.1, 0.6, 8), mat);
          level.position.y = 0.3 + i * 0.7;
          group.add(level);
        }
        var top = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 8), mat);
        top.position.y = 4.1;
        group.add(top);
        break;
      }
      case '楼阁': {
        // 两层亭台楼阁
        var base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 1.6), mat);
        base.position.y = 0.5;
        var roof1 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), mat);
        roof1.position.y = 1.4; roof1.rotation.y = Math.PI / 4;
        var top = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.6, 4), mat);
        top.position.y = 2.2; top.rotation.y = Math.PI / 4;
        group.add(base); group.add(roof1); group.add(top);
        break;
      }
      case '圆顶': {
        // 圆形穹顶
        var dome = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        dome.position.y = 1;
        var base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 1, 16), mat);
        base.position.y = 0.5;
        group.add(dome); group.add(base);
        break;
      }
      case '宫殿': {
        // 阶梯宫殿
        for (var i = 0; i < 3; i++) {
          var step = new THREE.Mesh(new THREE.BoxGeometry(2 - i * 0.3, 0.5, 1.5 - i * 0.2), mat);
          step.position.y = 0.25 + i * 0.5;
          group.add(step);
        }
        var roof = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 1.5), mat);
        roof.position.y = 1.9;
        group.add(roof);
        break;
      }
      case '场馆': {
        // 环形场馆
        var ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.3, 8, 24), mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 1;
        var base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1, 16), mat);
        base.position.y = 0.5;
        group.add(ring); group.add(base);
        break;
      }
      case '吊脚楼': {
        // 吊脚楼风格
        for (var i = 0; i < 3; i++) {
          var floor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1), mat);
          floor.position.y = 0.15 + i * 0.8;
          group.add(floor);
        }
        break;
      }
      case '灯塔': {
        // 塔身 + 顶部灯
        var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.5, 8), mat);
        shaft.position.y = 1.75;
        var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        lamp.position.y = 4;
        group.add(shaft); group.add(lamp);
        break;
      }
      case '石窟': {
        // 洞窟造型
        var cave = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 2, 12), mat);
        cave.position.y = 1;
        var top = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.6, 12), mat);
        top.position.y = 2.5;
        group.add(cave); group.add(top);
        break;
      }
      case '摩天轮': {
        // 圆形摩天轮支架
        var wheel = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 24), mat);
        wheel.position.y = 2;
        var stand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2, 6), mat);
        stand.position.y = 1;
        group.add(wheel); group.add(stand);
        break;
      }
      case '教堂': {
        // 尖顶教堂
        var body = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1.5), mat);
        body.position.y = 1;
        var spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 8), mat);
        spire.position.y = 2.75;
        group.add(body); group.add(spire);
        break;
      }
      case '现代大厦': {
        // 现代摩天大楼
        var tower2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 0.8), mat);
        tower2.position.y = 2.5;
        var crown = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), mat);
        crown.position.y = 5.5;
        group.add(tower2); group.add(crown);
        break;
      }
      default: {
        var def = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 8), mat);
        def.position.y = 1;
        group.add(def);
      }
    }

    return group;
  }

  // ============================================
  // 地铁线路
  // ============================================

  /**
   * 从API加载地铁线路并渲染
   */
  function loadAndCreateMetroLines() {
    return fetch(API_BASE + '/metro-lines')
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.success) {
          metroLinesData = json.data;
          createMetroLines();
        } else {
          showError('地铁线路加载失败');
        }
      })
      .catch(function (e) {
        showError('地铁线路请求失败: ' + e.message);
      });
  }

  /**
   * 创建地铁线路（313条，按城市分组）
   */
  function createMetroLines() {
    metroGroup = new THREE.Group();
    scene.add(metroGroup);

    // 按 city_id 分组
    var linesByCity = {};
    metroLinesData.forEach(function (line) {
      if (!linesByCity[line.city_id]) linesByCity[line.city_id] = [];
      linesByCity[line.city_id].push(line);
    });

    var cityCount = Object.keys(linesByCity).length;
    log('有地铁城市: ' + cityCount + ' 个');

    // 为每个城市创建线路
    for (var cityId in linesByCity) {
      if (!linesByCity.hasOwnProperty(cityId)) continue;

      var city = cityData.find(function (c) { return c.id === parseInt(cityId); });
      if (!city || !city.latitude || !city.longitude) continue;

      var cityPos = geoTo3D(city.latitude, city.longitude);
      var lines = linesByCity[cityId];

      lines.forEach(function (line, lineIndex) {
        var color = parseColor(line.color);
        var angles = generateRadialAngles(lines.length, lineIndex);
        var endX = cityPos.x + Math.cos(angles) * (4 + lineIndex * 0.3);
        var endZ = cityPos.z + Math.sin(angles) * (4 + lineIndex * 0.3);

        // 创建曲线
        var curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(cityPos.x, 0.3, cityPos.z),
          new THREE.Vector3((cityPos.x + endX) / 2, 1.5, (cityPos.z + endZ) / 2),
          new THREE.Vector3(endX, 0.3, endZ)
        );

        var points = curve.getPoints(50);
        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.7
        });
        var lineMesh = new THREE.Line(geometry, material);
        metroGroup.add(lineMesh);

        // 创建列车小球
        var trainGeo = new THREE.SphereGeometry(0.25, 12, 12);
        var trainMat = new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });
        var train = new THREE.Mesh(trainGeo, trainMat);
        train.visible = (currentFilter === '全部' || currentFilter === '地铁');
        scene.add(train);
        metroTrains.push({
          mesh: train,
          curve: curve,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.002
        });
      });
    }

    log('地铁线路创建完成，共 ' + metroLinesData.length + ' 条');
  }

  /**
   * 生成辐射状角度（均匀分布）
   */
  function generateRadialAngles(total, index) {
    if (total <= 1) return 0;
    return (index / total) * Math.PI * 2 + Math.PI / 4;
  }

  // ============================================
  // 公交线路
  // ============================================

  /**
   * 从API加载公交线路并渲染
   */
  function loadAndCreateBusLines() {
    return fetch(API_BASE + '/bus-lines')
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.success) {
          busLinesData = json.data;
          createBusLines();
        } else {
          showError('公交线路加载失败');
        }
      })
      .catch(function (e) {
        showError('公交线路请求失败: ' + e.message);
      });
  }

  /**
   * 创建公交线路（20条，从西安放射）
   */
  function createBusLines() {
    busGroup = new THREE.Group();
    scene.add(busGroup);

    // 西安坐标
    var xiAnPos = geoTo3D(34.2658, 108.9541);

    busLinesData.forEach(function (busLine, index) {
      var endCity = cityData.find(function (c) { return c.name === busLine.end_station; });
      if (!endCity || !endCity.latitude || !endCity.longitude) return;

      var endPos = geoTo3D(endCity.latitude, endCity.longitude);

      // 黄色虚线
      var curve = new THREE.LineCurve3(
        new THREE.Vector3(xiAnPos.x, 0.25, xiAnPos.z),
        new THREE.Vector3(endPos.x, 0.25, endPos.z)
      );

      var points = curve.getPoints(30);
      var dashSize = 0.5;
      var gapSize = 0.3;
      var dashedPoints = [];

      for (var i = 0; i < points.length - 1; i++) {
        var p1 = points[i];
        var p2 = points[i + 1];
        var segLen = p1.distanceTo(p2);
        var numDashes = Math.floor(segLen / (dashSize + gapSize));

        for (var j = 0; j < numDashes; j++) {
          var t1 = j / numDashes;
          var t2 = (j + dashSize / (dashSize + gapSize)) / numDashes;
          if (t2 > 1) t2 = 1;
          dashedPoints.push(
            new THREE.Vector3(
              p1.x + (p2.x - p1.x) * t1,
              p1.y + (p2.y - p1.y) * t1,
              p1.z + (p2.z - p1.z) * t1
            ),
            new THREE.Vector3(
              p1.x + (p2.x - p1.x) * t2,
              p1.y + (p2.y - p1.y) * t2,
              p1.z + (p2.z - p1.z) * t2
            )
          );
        }
      }

      if (dashedPoints.length > 1) {
        var geo = new THREE.BufferGeometry().setFromPoints(dashedPoints);
        var mat = new THREE.LineBasicMaterial({ color: 0xEAB308, transparent: true, opacity: 0.6 });
        var line = new THREE.LineSegments(geo, mat);
        busGroup.add(line);
      }
    });

    log('公交线路创建完成，共 ' + busLinesData.length + ' 条');
  }

  // ============================================
  // 航班航线
  // ============================================

  /**
   * 创建航班航线（60条大弧线，使用多颜色）
   */
  function createFlightRoutes() {
    flightGroup = new THREE.Group();
    scene.add(flightGroup);
    flightPlanes = [];

    FLIGHT_ROUTES.forEach(function (route, index) {
      var fromCity = cityMap[route.from];
      var toCity = cityMap[route.to];

      if (!fromCity || !toCity || !fromCity.latitude || !toCity.latitude) {
        console.warn('航班城市未找到:', route.from, route.to);
        return;
      }

      var start = geoTo3D(fromCity.latitude, fromCity.longitude);
      var end = geoTo3D(toCity.latitude, toCity.longitude);

      var p1 = new THREE.Vector3(start.x, 0.5, start.z);
      var p2 = new THREE.Vector3(end.x, 0.5, end.z);
      var dist = p1.distanceTo(p2);
      var arcHeight = dist * 0.2;

      var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y = arcHeight + 2;

      var curve = new THREE.CatmullRomCurve3([p1, mid, p2]);

      // 使用颜色数组中的颜色
      var color = FLIGHT_COLORS[index % FLIGHT_COLORS.length];

      // 弧线
      var pts = curve.getPoints(60);
      var arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      var arcMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
      var arcLine = new THREE.Line(arcGeo, arcMat);
      flightGroup.add(arcLine);

      // 飞机模型（简化为锥体）
      var planeGeo = new THREE.ConeGeometry(0.4, 1.2, 6);
      var planeMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 0.3 });
      var planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.rotation.x = Math.PI / 2;
      planeMesh.visible = (currentFilter === '全部' || currentFilter === '航线');
      scene.add(planeMesh);

      flightPlanes.push({
        mesh: planeMesh,
        curve: curve,
        progress: Math.random(),
        speed: 0.001 + Math.random() * 0.001
      });
    });

    log('航班航线创建完成，共 ' + FLIGHT_ROUTES.length + ' 条');
  }

  // ============================================
  // 高铁线路
  // ============================================

  /**
   * 创建高铁线路（40条，使用多颜色）
   */
  function createHighSpeedRoutes() {
    hsrGroup = new THREE.Group();
    scene.add(hsrGroup);
    hsrTrains = [];

    HIGH_SPEED_ROUTES.forEach(function (route, index) {
      var routePoints = [];
      var allFound = true;

      route.cities.forEach(function (cityName) {
        var city = cityMap[cityName];
        if (!city || !city.latitude) {
          console.warn('高铁城市未找到:', cityName);
          allFound = false;
          return;
        }
        var pos = geoTo3D(city.latitude, city.longitude);
        routePoints.push(new THREE.Vector3(pos.x, 0.35, pos.z));
      });

      if (!allFound || routePoints.length < 2) return;

      // 使用颜色数组中的颜色
      var color = HSR_COLORS[index % HSR_COLORS.length];

      // 创建曲线
      var curve = new THREE.CatmullRomCurve3(routePoints);

      var pts = curve.getPoints(routePoints.length * 10);
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.6 });
      var line = new THREE.Line(geo, mat);
      hsrGroup.add(line);

      // 高铁列车小球
      var trainGeo = new THREE.SphereGeometry(0.3, 12, 12);
      var trainMat = new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });
      var trainMesh = new THREE.Mesh(trainGeo, trainMat);
      trainMesh.visible = (currentFilter === '全部' || currentFilter === '高铁');
      scene.add(trainMesh);

      hsrTrains.push({
        mesh: trainMesh,
        curve: curve,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.001
      });
    });

    log('高铁线路创建完成，共 ' + HIGH_SPEED_ROUTES.length + ' 条');
  }

  // ============================================
  // UI 元素
  // ============================================

  /**
   * 创建顶部标题
   */
  function createTitle() {
    var titleDiv = document.createElement('div');
    titleDiv.id = 'map-title';
    titleDiv.innerHTML = '<h1>🗺️ 晴途</h1><p>点击城市，开启你的旅程</p>';
    titleDiv.style.cssText = [
      'position:fixed', 'top:20px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:100', 'text-align:center', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(titleDiv);
  }

  /**
   * 创建左侧筛选按钮
   */
  function createFilterButtons() {
    var filterDiv = document.createElement('div');
    filterDiv.id = 'filter-buttons';
    filterDiv.style.cssText = [
      'position:fixed', 'top:50%', 'left:20px', 'transform:translateY(-50%)',
      'z-index:100', 'display:flex', 'flex-direction:column', 'gap:10px'
    ].join(';');

    FILTER_MODES.forEach(function (mode) {
      var btn = document.createElement('button');
      btn.textContent = getFilterIcon(mode) + ' ' + mode;
      btn.style.cssText = [
        'background:rgba(255,255,255,0.95)', 'border:none', 'padding:12px 18px',
        'border-radius:25px', 'font-size:0.95em', 'cursor:pointer',
        'box-shadow:0 4px 15px rgba(0,0,0,0.2)', 'transition:all 0.3s',
        'white-space:nowrap'
      ].join(';');
      btn.onclick = (function (m) { return function () { setFilter(m); }; })(mode);
      btn.onmouseenter = function () {
        this.style.background = '#7eb8da';
        this.style.color = '#fff';
        this.style.transform = 'translateX(4px)';
      };
      btn.onmouseleave = function () {
        this.style.background = 'rgba(255,255,255,0.95)';
        this.style.color = '#333';
        this.style.transform = 'translateX(0)';
      };
      filterBtns.push({ btn: btn, mode: mode });
      filterDiv.appendChild(btn);
    });

    document.body.appendChild(filterDiv);
    setFilter('全部');
  }

  function getFilterIcon(mode) {
    var icons = { '全部': '🌐', '公交': '🚌', '地铁': '🚇', '航线': '✈️', '高铁': '🚄' };
    return icons[mode] || '•';
  }

  /**
   * 设置筛选模式
   */
  function setFilter(mode) {
    currentFilter = mode;

    filterBtns.forEach(function (item) {
      var isActive = item.mode === mode;
      item.btn.style.background = isActive ? 'linear-gradient(135deg, #7eb8da, #5a9bc7)' : 'rgba(255,255,255,0.95)';
      item.btn.style.color = isActive ? '#fff' : '#333';
      item.btn.style.fontWeight = isActive ? 'bold' : 'normal';
    });

    // 显示/隐藏各类元素
    var showBus = (mode === '全部' || mode === '公交');
    var showMetro = (mode === '全部' || mode === '地铁');
    var showFlight = (mode === '全部' || mode === '航线');
    var showHsr = (mode === '全部' || mode === '高铁');

    if (busGroup) busGroup.visible = showBus;
    if (metroGroup) metroGroup.visible = showMetro;
    if (flightGroup) flightGroup.visible = showFlight;
    if (hsrGroup) hsrGroup.visible = showHsr;

    metroTrains.forEach(function (t) { t.mesh.visible = showMetro; });
    flightPlanes.forEach(function (p) { p.mesh.visible = showFlight; });
    hsrTrains.forEach(function (t) { t.mesh.visible = showHsr; });
  }

  /**
   * 创建加载进度条
   */
  function createProgressBar() {
    var barContainer = document.createElement('div');
    barContainer.id = 'progress-container';
    barContainer.style.cssText = [
      'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
      'width:300px', 'height:6px', 'background:rgba(255,255,255,0.2)',
      'border-radius:3px', 'overflow:hidden', 'z-index:100'
    ].join(';');

    var bar = document.createElement('div');
    bar.id = 'progress-bar';
    bar.style.cssText = [
      'height:100%', 'width:0%', 'background:linear-gradient(90deg, #7eb8da, #5a9bc7)',
      'border-radius:3px', 'transition:width 0.3s'
    ].join(';');

    barContainer.appendChild(bar);
    document.body.appendChild(barContainer);
    progressBar = bar;
  }

  /**
   * 创建信息面板
   */
  function createInfoPanel() {
    infoPanel = document.getElementById('info-panel');
    if (!infoPanel) {
      infoPanel = document.createElement('div');
      infoPanel.id = 'info-panel';
      infoPanel.style.cssText = [
        'position:fixed', 'top:50%', 'left:50%', 'transform:translate(-50%,-50%)',
        'z-index:200', 'background:rgba(255,255,255,0.98)', 'border-radius:24px',
        'padding:32px', 'min-width:360px', 'max-width:90vw', 'display:none',
        'box-shadow:0 20px 60px rgba(0,0,0,0.3)'
      ].join(';');
      document.body.appendChild(infoPanel);
    }
  }

  // ============================================
  // 沐晴角色
  // ============================================

  /**
   * 初始化沐晴角色
   */
  function initMascot() {
    // 等待 DOM 完全加载
    if (typeof MuqingMascot !== 'undefined') {
      try {
        window.muqing = new MuqingMascot();
        startMascotBubble();
        log('沐晴角色初始化完成');
      } catch (e) {
        console.warn('沐晴初始化失败:', e);
      }
    } else {
      // mascot.js 未加载，动态加载
      var script = document.createElement('script');
      script.src = 'js/mascot.js';
      script.onload = function () {
        try {
          window.muqing = new MuqingMascot();
          startMascotBubble();
        } catch (e) {
          console.warn('沐晴初始化失败:', e);
        }
      };
      script.onerror = function () {
        console.warn('mascot.js 加载失败，跳过沐晴');
      };
      document.head.appendChild(script);
    }
  }

  /**
   * 沐晴气泡定时切换
   */
  function startMascotBubble() {
    if (typeof window.muqing !== 'undefined' && window.muqing._showMessage) {
      mascotBubbleTimer = setInterval(function () {
        var msg = BUBBLE_MESSAGES[mascotBubbleIndex % BUBBLE_MESSAGES.length];
        window.muqing._showMessage(msg, 3500);
        mascotBubbleIndex++;
      }, 10000);
    }
  }

  // ============================================
  // 事件绑定
  // ============================================

  /**
   * 绑定窗口事件
   */
  function bindEvents() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.addEventListener('touchend', onCanvasTouch);
  }

  /**
   * 画布点击（射线检测城市）
   */
  function onCanvasClick(e) {
    var rect = renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);
    for (var i = 0; i < intersects.length; i++) {
      var obj = intersects[i].object;
      while (obj.parent && !obj.userData.city) {
        obj = obj.parent;
      }
      if (obj.userData.city) {
        showCityInfo(obj.userData.city);
        return;
      }
    }

    // 点击空白处关闭面板
    closeCityInfo();
  }

  /**
   * 触摸端点击
   */
  function onCanvasTouch(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      var touch = e.changedTouches[0];
      onCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  /**
   * 显示城市信息面板
   */
  function showCityInfo(city) {
    var panel = document.getElementById('info-panel');
    if (!panel) return;

    document.getElementById('city-name').textContent = city.name;
    document.getElementById('city-province').textContent = city.province || '中国';

    var desc = city.description || '欢迎来到' + city.name + '！';
    var cityDesc = document.getElementById('city-desc');
    if (cityDesc) cityDesc.textContent = desc;

    // 统计该城市线路数
    var metroCount = metroLinesData.filter(function (l) { return l.city_id === city.id; }).length;
    var busCount = busLinesData.filter(function (l) { return l.city_id === city.id; }).length;

    var metroEl = document.getElementById('metro-count');
    var busEl = document.getElementById('bus-count');
    if (metroEl) metroEl.textContent = metroCount;
    if (busEl) busEl.textContent = busCount;

    panel.style.display = 'block';

    // 沐晴提示
    if (window.muqing && window.muqing.onCityLoad) {
      window.muqing.onCityLoad();
    }
  }

  /**
   * 关闭城市信息面板
   */
  function closeCityInfo() {
    var panel = document.getElementById('info-panel');
    if (panel) panel.style.display = 'none';
  }

  /**
   * 进入城市详情
   */
  window.enterCity = function () {
    var panel = document.getElementById('info-panel');
    var nameEl = document.getElementById('city-name');
    if (panel && nameEl) {
      var cityName = nameEl.textContent;
      window.open('city.html?name=' + encodeURIComponent(cityName), '_blank');
    }
  };

  /**
   * 关闭面板
   */
  window.closePanel = function () {
    closeCityInfo();
  };

  /**
   * 窗口大小变化
   */
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ============================================
  // 动画循环
  // ============================================

  /**
   * 动画主循环
   */
  function animate() {
    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    var elapsed = clock.getElapsedTime();

    // 更新控制器
    controls.update();

    // 地标呼吸动画
    cityLandmarks.forEach(function (landmark, index) {
      var scale = 1 + Math.sin(elapsed * 1.5 + index * 0.5) * 0.08;
      landmark.scale.setScalar(scale);
      landmark.position.y = Math.sin(elapsed + index) * 0.08;
    });

    // 景点脉冲环动画
    attractionRings.forEach(function (ring, index) {
      var st = elapsed * ring.userData.speed + ring.userData.phase + 0.5 * (ring.userData.offset || 0);
      ring.scale.setScalar(Math.max(0.01, ring.userData.baseScale + Math.sin(st) * 0.7));
      ring.material.opacity = 0.12 + Math.abs(Math.cos(st)) * 0.5;
    });

    // 地铁列车动画
    metroTrains.forEach(function (t) {
      t.progress += t.speed * delta * 60;
      if (t.progress > 1) t.progress = 0;
      var pos = t.curve.getPoint(t.progress);
      t.mesh.position.copy(pos);
      // 朝向运动方向
      var ahead = t.curve.getPoint(Math.min(t.progress + 0.02, 1));
      t.mesh.lookAt(ahead);
    });

    // 高铁列车动画
    hsrTrains.forEach(function (t) {
      t.progress += t.speed * delta * 60;
      if (t.progress > 1) t.progress = 0;
      var pos = t.curve.getPoint(t.progress);
      t.mesh.position.copy(pos);
      var ahead = t.curve.getPoint(Math.min(t.progress + 0.02, 1));
      t.mesh.lookAt(ahead);
    });

    // 飞机动画
    flightPlanes.forEach(function (p) {
      p.progress += p.speed * delta * 60;
      if (p.progress > 1) p.progress = 0;
      var pos = p.curve.getPoint(p.progress);
      p.mesh.position.copy(pos);
      var ahead = p.curve.getPoint(Math.min(p.progress + 0.02, 1));
      p.mesh.lookAt(ahead);
    });

    updateClouds();
    var stars = scene.getObjectByName('stars');
    if (stars && stars.material) {
      stars.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
    }

    renderer.render(scene, camera);
  }

  // ============================================
  // 主初始化流程
  // ============================================

  /**
   * 主初始化入口
   */
  function init() {
    try {
      // 初始化场景
      initScene();

      // 创建UI
      createTitle();
      createFilterButtons();
      createProgressBar();
      createInfoPanel();

      // 绑定事件
      bindEvents();

      // 加载城市数据
      updateProgress(1, 5, '加载城市数据...');
      fetch(API_BASE + '/cities')
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success) {
            cityData = json.data;
            // 建立城市名→城市对象的映射
            cityData.forEach(function (c) { cityMap[c.name] = c; });
            updateProgress(2, 5, '城市数据加载完成 (' + cityData.length + '个)');

            // 创建城市地标
            createCityLandmarks();
            updateProgress(3, 5, '城市地标创建完成');

            // 加载并创建地铁线路
            return loadAndCreateMetroLines();
          } else {
            throw new Error('城市API返回失败');
          }
        })
        .then(function () {
          updateProgress(4, 5, '地铁线路创建完成');

          // 加载并创建公交线路
          return loadAndCreateBusLines();
        })
        .then(function () {
          updateProgress(5, 5, '公交线路创建完成');

          // 创建航班航线（同步，不依赖API）
          createFlightRoutes();

          // 创建高铁线路（同步，不依赖API）
          createHighSpeedRoutes();

          // 初始化沐晴
          initMascot();

          // 创建云朵和星星装饰
          createClouds();
          createStars();

          // 隐藏加载状态
          var loadingEl = document.getElementById('loading');
          if (loadingEl) loadingEl.style.display = 'none';

          // 隐藏进度条
          var progressContainer = document.getElementById('progress-container');
          if (progressContainer) progressContainer.style.display = 'none';

          log('地图初始化全部完成！');
          console.log('已更新' + FLIGHT_ROUTES.length + '条航线和' + HIGH_SPEED_ROUTES.length + '条高铁');
          animate();
        })
        .catch(function (err) {
          showError('初始化失败: ' + err.message);
          console.error(err);

          // 即使API失败也启动场景（显示地标）
          var loadingEl = document.getElementById('loading');
          if (loadingEl) loadingEl.style.display = 'none';
          animate();
        });

    } catch (e) {
      showError('初始化异常: ' + e.message);
      console.error(e);
    }
  }

  // ============================================
  // 装饰元素：云朵
  // ============================================
  function createClouds() {
    var cloudGroup = new THREE.Group();
    cloudGroup.name = 'clouds';
    var cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.4,
      flatShading: true
    });
    var positions = [
      [-80, 25, -40], [60, 30, -60], [-40, 28, 50],
      [90, 22, 30], [-100, 26, -20], [20, 35, 80],
      [-60, 24, -80], [110, 28, -10], [-30, 32, -50], [70, 25, 70]
    ];
    positions.forEach(function(pos) {
      var cloud = new THREE.Group();
      var sphere1 = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), cloudMaterial);
      var sphere2 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 6), cloudMaterial);
      var sphere3 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), cloudMaterial);
      sphere1.position.set(0, 0, 0);
      sphere2.position.set(2.5, 0.5, 0);
      sphere3.position.set(-2, 0.3, 0);
      cloud.add(sphere1); cloud.add(sphere2); cloud.add(sphere3);
      cloud.position.set(pos[0], pos[1], pos[2]);
      cloud.scale.set(0.5 + Math.random() * 0.5, 0.3 + Math.random() * 0.3, 0.5 + Math.random() * 0.5);
      cloud.userData.speed = 0.005 + Math.random() * 0.01;
      cloud.userData.range = 5 + Math.random() * 10;
      cloud.userData.startX = pos[0];
      cloudGroup.add(cloud);
    });
    scene.add(cloudGroup);
    console.log('创建了 ' + cloudGroup.children.length + ' 朵云朵');
    return cloudGroup;
  }

  // ============================================
  // 装饰元素：星星粒子
  // ============================================
  function createStars() {
    var starsGeometry = new THREE.BufferGeometry();
    var starCount = 2000;
    var positions = new Float32Array(starCount * 3);
    var colors = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
      var i3 = i * 3;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.random() * Math.PI * 0.5;
      var r = 300 + Math.random() * 200;
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi) + 50;
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      var brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = Math.min(1, brightness + Math.random() * 0.3);
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var starsMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    var stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.name = 'stars';
    scene.add(stars);
    console.log('创建了 ' + starCount + ' 颗星星');
    return stars;
  }

  // ============================================
  // 云朵动画更新
  // ============================================
  var cloudTime = 0;
  function updateClouds() {
    cloudTime += 0.005;
    var clouds = scene.getObjectByName('clouds');
    if (clouds) {
      clouds.children.forEach(function(cloud) {
        cloud.position.x = cloud.userData.startX + Math.sin(cloudTime * cloud.userData.speed * 10) * cloud.userData.range;
        cloud.position.y += Math.sin(cloudTime + cloud.userData.speed * 100) * 0.002;
      });
    }
  }

  // ============================================
  // 导出接口（供HTML调用）
  // ============================================
  window.initMap = init;
  window.setFilter = setFilter;
  window.animateMap = animate;
  window.onWindowResize = onWindowResize;

  // 页面加载后自动启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
