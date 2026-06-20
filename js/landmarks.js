/**
 * 地标建筑生成器 + 装饰元素
 * 导出12种地标建筑函数及装饰函数，供其他JS调用
 */

/**
 * 创建电视塔
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createTower(position) {
  const group = new THREE.Group();

  // 灰色金属材质
  const metalMat = new THREE.MeshPhongMaterial({
    color: 0x888888,
    specular: 0x333333,
    shininess: 30
  });
  const darkMetalMat = new THREE.MeshPhongMaterial({
    color: 0x555555,
    specular: 0x222222,
    shininess: 50
  });

  // 塔身 - 细长圆柱
  const shaftGeo = new THREE.CylinderGeometry(0.8, 1.2, 15, 12);
  const shaft = new THREE.Mesh(shaftGeo, metalMat);
  shaft.position.y = 7.5;
  group.add(shaft);

  // 中间球形观景台
  const sphereGeo = new THREE.SphereGeometry(2, 16, 16);
  const sphere = new THREE.Mesh(sphereGeo, metalMat);
  sphere.position.y = 10;
  group.add(sphere);

  // 观景台装饰圈
  const ringGeo = new THREE.TorusGeometry(2.2, 0.1, 8, 32);
  const ring = new THREE.Mesh(ringGeo, darkMetalMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 10;
  group.add(ring);

  // 塔顶天线
  const antennaGeo = new THREE.CylinderGeometry(0.15, 0.3, 3, 8);
  const antenna = new THREE.Mesh(antennaGeo, darkMetalMat);
  antenna.position.y = 18;
  group.add(antenna);

  // 天线尖
  const tipGeo = new THREE.ConeGeometry(0.15, 1, 8);
  const tip = new THREE.Mesh(tipGeo, darkMetalMat);
  tip.position.y = 19.5;
  group.add(tip);

  group.position.copy(position);
  return group;
}

/**
 * 创建宝塔
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createPagoda(position) {
  const group = new THREE.Group();

  // 深棕色材质
  const brownMat = new THREE.MeshPhongMaterial({
    color: 0x4a2c2a,
    specular: 0x111111,
    shininess: 10
  });
  // 金色材质
  const goldMat = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    specular: 0xaaaaaa,
    shininess: 80
  });

  // 5层建筑
  const layers = 5;
  const baseSize = 3;
  const layerHeight = 2;

  for (let i = 0; i < layers; i++) {
    const ratio = 1 - i * 0.18;
    const size = baseSize * ratio;
    const y = i * layerHeight;

    // 每层方底座
    const baseGeo = new THREE.BoxGeometry(size, layerHeight * 0.6, size);
    const base = new THREE.Mesh(baseGeo, brownMat);
    base.position.y = y + layerHeight * 0.3;
    group.add(base);

    // 每层飞檐 - 使用BoxGeometry模拟
    const eavesGeo = new THREE.BoxGeometry(size + 0.8, 0.2, size + 0.8);
    const eaves = new THREE.Mesh(eavesGeo, brownMat);
    eaves.position.y = y + layerHeight * 0.8;
    group.add(eaves);

    // 飞檐四个角装饰
    const cornerGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const corners = [
      [size / 2 + 0.2, 0, size / 2 + 0.2],
      [-size / 2 - 0.2, 0, size / 2 + 0.2],
      [size / 2 + 0.2, 0, -size / 2 - 0.2],
      [-size / 2 - 0.2, 0, -size / 2 - 0.2]
    ];
    corners.forEach(pos => {
      const corner = new THREE.Mesh(cornerGeo, goldMat);
      corner.position.set(pos[0], y + layerHeight * 0.9, pos[2]);
      group.add(corner);
    });
  }

  // 金色尖顶
  const spireGeo = new THREE.ConeGeometry(0.5, 2, 8);
  const spire = new THREE.Mesh(spireGeo, goldMat);
  spire.position.y = layers * layerHeight + 1;
  group.add(spire);

  group.position.copy(position);
  return group;
}

/**
 * 创建楼阁
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createPavilion(position) {
  const group = new THREE.Group();

  // 深红色材质
  const redMat = new THREE.MeshPhongMaterial({
    color: 0x8b0000,
    specular: 0x222222,
    shininess: 20
  });
  // 白色材质
  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    specular: 0x111111,
    shininess: 10
  });

  // 方形底座
  const baseGeo = new THREE.BoxGeometry(6, 0.5, 6);
  const base = new THREE.Mesh(baseGeo, redMat);
  group.add(base);

  // 4根圆柱立柱
  const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 4, 12);
  const pillarPositions = [
    [2, 0, 2], [-2, 0, 2], [2, 0, -2], [-2, 0, -2]
  ];
  pillarPositions.forEach(pos => {
    const pillar = new THREE.Mesh(pillarGeo, whiteMat);
    pillar.position.set(pos[0], pos[1] + 2.25, pos[2]);
    group.add(pillar);
  });

  // 3层飞檐屋顶
  const roofLayers = 3;
  for (let i = 0; i < roofLayers; i++) {
    const size = 6 - i * 0.8;
    const y = 4 + i * 1.2;

    // 屋顶主体 - 梯形简化
    const roofGeo = new THREE.BoxGeometry(size, 0.4, size);
    const roof = new THREE.Mesh(roofGeo, redMat);
    roof.position.y = y;
    group.add(roof);

    // 飞檐翘角
    const eavesGeo = new THREE.BoxGeometry(size + 0.6, 0.15, size + 0.6);
    const eaves = new THREE.Mesh(eavesGeo, redMat);
    eaves.position.y = y + 0.25;
    group.add(eaves);
  }

  group.position.copy(position);
  return group;
}

/**
 * 创建圆顶建筑
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createDome(position) {
  const group = new THREE.Group();

  // 米白色材质
  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xf5f5dc,
    specular: 0x333333,
    shininess: 40
  });
  // 金色材质
  const goldMat = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    specular: 0xaaaaaa,
    shininess: 80
  });

  // 方形基座
  const baseGeo = new THREE.BoxGeometry(8, 1, 8);
  const base = new THREE.Mesh(baseGeo, whiteMat);
  base.position.y = 0.5;
  group.add(base);

  // 大圆顶
  const domeGeo = new THREE.SphereGeometry(4, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, whiteMat);
  dome.position.y = 1;
  group.add(dome);

  // 洋葱顶装饰
  const onionGeo = new THREE.SphereGeometry(0.8, 12, 12);
  const onion = new THREE.Mesh(onionGeo, goldMat);
  onion.position.y = 5.5;
  onion.scale.y = 1.5;
  group.add(onion);

  // 顶部小尖塔
  const spireGeo = new THREE.ConeGeometry(0.3, 1.5, 8);
  const spire = new THREE.Mesh(spireGeo, goldMat);
  spire.position.y = 6.5;
  group.add(spire);

  // 圆顶底部装饰圈
  const ringGeo = new THREE.TorusGeometry(4, 0.15, 8, 32);
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.1;
  group.add(ring);

  group.position.copy(position);
  return group;
}

/**
 * 创建宫殿
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createPalace(position) {
  const group = new THREE.Group();

  // 红色材质
  const redMat = new THREE.MeshPhongMaterial({
    color: 0xcc0000,
    specular: 0x333333,
    shininess: 30
  });
  // 金色材质
  const goldMat = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    specular: 0xcccccc,
    shininess: 80
  });

  // 主体建筑
  const mainGeo = new THREE.BoxGeometry(10, 5, 6);
  const main = new THREE.Mesh(mainGeo, redMat);
  main.position.y = 2.5;
  group.add(main);

  // 宽大门廊 - 3个拱门
  const porchGeo = new THREE.BoxGeometry(10, 3, 2);
  const porch = new THREE.Mesh(porchGeo, redMat);
  porch.position.set(0, 1.5, 2);
  group.add(porch);

  // 拱门
  for (let i = 0; i < 3; i++) {
    const x = -3 + i * 3;
    // 拱门框架
    const archGeo = new THREE.BoxGeometry(1.5, 2.5, 0.3);
    const arch = new THREE.Mesh(archGeo, goldMat);
    arch.position.set(x, 0.75, 3.1);
    group.add(arch);
    // 拱形顶部
    const archTopGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.3, 12, 1, false, 0, Math.PI);
    const archTop = new THREE.Mesh(archTopGeo, goldMat);
    archTop.rotation.x = Math.PI / 2;
    archTop.rotation.z = Math.PI / 2;
    archTop.position.set(x, 2.5, 3.1);
    group.add(archTop);
  }

  // 红色立柱
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 4, 12);
  for (let i = 0; i < 4; i++) {
    const pillar = new THREE.Mesh(pillarGeo, redMat);
    const x = i < 2 ? -4.5 : 4.5;
    const z = i % 2 === 0 ? 3 : -3;
    pillar.position.set(x, 2, z);
    group.add(pillar);
  }

  // 梯形屋顶
  const roofGeo = new THREE.BoxGeometry(11, 1, 7);
  const roof = new THREE.Mesh(roofGeo, redMat);
  roof.position.y = 5.5;
  group.add(roof);

  // 金色屋顶尖
  const roofTopGeo = new THREE.ConeGeometry(1.5, 3, 4);
  const roofTop = new THREE.Mesh(roofTopGeo, goldMat);
  roofTop.position.y = 7.5;
  group.add(roofTop);

  group.position.copy(position);
  return group;
}

/**
 * 创建场馆
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createStadium(position) {
  const group = new THREE.Group();

  // 银白色材质
  const silverMat = new THREE.MeshPhongMaterial({
    color: 0xc0c0c0,
    specular: 0x666666,
    shininess: 60
  });
  // 蓝色材质
  const blueMat = new THREE.MeshPhongMaterial({
    color: 0x4169e1,
    specular: 0x333333,
    shininess: 40,
    transparent: true,
    opacity: 0.7
  });

  // 椭圆形底座
  const baseGeo = new THREE.CylinderGeometry(6, 6.5, 1, 32);
  const base = new THREE.Mesh(baseGeo, silverMat);
  base.position.y = 0.5;
  group.add(base);

  // 穹顶屋面 - 半椭球
  const domeGeo = new THREE.SphereGeometry(6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, blueMat);
  dome.position.y = 1;
  group.add(dome);

  // 周围装饰环 - 多层
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(6.2 + i * 0.3, 0.1, 8, 48);
    const ring = new THREE.Mesh(ringGeo, silverMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5 + i * 0.3;
    group.add(ring);
  }

  // 顶部结构环
  const topRingGeo = new THREE.TorusGeometry(4, 0.15, 8, 32);
  const topRing = new THREE.Mesh(topRingGeo, silverMat);
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = 5;
  group.add(topRing);

  group.position.copy(position);
  return group;
}

/**
 * 创建吊脚楼
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createStilted(position) {
  const group = new THREE.Group();

  // 棕色木纹材质
  const woodMat = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    specular: 0x111111,
    shininess: 10
  });
  // 深棕色
  const darkWoodMat = new THREE.MeshPhongMaterial({
    color: 0x654321,
    specular: 0x111111,
    shininess: 10
  });

  // 斜坡地形底座
  const slopeGeo = new THREE.BoxGeometry(8, 1, 6);
  const slope = new THREE.Mesh(slopeGeo, woodMat);
  slope.position.y = -0.5;
  slope.rotation.z = 0.1;
  group.add(slope);

  // 底部高脚支撑
  const legGeo = new THREE.BoxGeometry(0.3, 2, 0.3);
  const legPositions = [
    [-2.5, -1, -2], [-2.5, -1, 2],
    [2.5, -0.8, -2], [2.5, -0.8, 2],
    [-2.5, -0.6, 0], [2.5, -0.4, 0]
  ];
  legPositions.forEach((pos, i) => {
    const leg = new THREE.Mesh(legGeo, darkWoodMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.scale.y = 0.5 + Math.abs(pos[1]) * 0.5;
    group.add(leg);
  });

  // 2层木质结构
  for (let floor = 0; floor < 2; floor++) {
    const y = floor * 2.5 + 1;
    const floorGeo = new THREE.BoxGeometry(7, 0.3, 5);
    const floorMesh = new THREE.Mesh(floorGeo, woodMat);
    floorMesh.position.y = y;
    group.add(floorMesh);

    // 墙面
    const wallGeo = new THREE.BoxGeometry(0.2, 2, 4.5);
    // 前后墙
    [-3.4, 3.4].forEach(x => {
      const wall = new THREE.Mesh(wallGeo, darkWoodMat);
      wall.position.set(x, y + 1, 0);
      group.add(wall);
    });
    // 左右墙（带窗）
    const sideWallGeo = new THREE.BoxGeometry(4.5, 1.5, 0.2);
    [-2.5, 2.5].forEach(z => {
      const wall = new THREE.Mesh(sideWallGeo, darkWoodMat);
      wall.position.set(0, y + 0.75, z);
      group.add(wall);
    });
  }

  // 坡屋顶
  const roofGeo = new THREE.BoxGeometry(8, 0.4, 6);
  const roof = new THREE.Mesh(roofGeo, darkWoodMat);
  roof.position.y = 5.2;
  roof.rotation.z = 0.05;
  group.add(roof);

  // 屋顶山形顶尖
  const peakGeo = new THREE.BoxGeometry(0.3, 1.5, 6);
  const peak = new THREE.Mesh(peakGeo, darkWoodMat);
  peak.position.y = 5.5;
  group.add(peak);

  group.position.copy(position);
  return group;
}

/**
 * 创建灯塔
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createLighthouse(position) {
  const group = new THREE.Group();

  // 红色材质
  const redMat = new THREE.MeshPhongMaterial({
    color: 0xcc0000,
    specular: 0x333333,
    shininess: 30
  });
  // 白色材质
  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x222222,
    shininess: 20
  });
  // 玻璃材质
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0xffffcc,
    specular: 0xffffff,
    shininess: 100,
    transparent: true,
    opacity: 0.6
  });

  // 基座
  const baseGeo = new THREE.CylinderGeometry(2, 2.5, 2, 12);
  const base = new THREE.Mesh(baseGeo, whiteMat);
  base.position.y = 1;
  group.add(base);

  // 圆锥形塔身 - 分段实现红白条纹
  const segments = 6;
  const towerHeight = 12;
  const segmentHeight = towerHeight / segments;

  for (let i = 0; i < segments; i++) {
    const mat = i % 2 === 0 ? redMat : whiteMat;
    const topRadius = 1.2 - (i + 1) * 0.1;
    const bottomRadius = 1.2 - i * 0.1;
    const segGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, segmentHeight, 12);
    const seg = new THREE.Mesh(segGeo, mat);
    seg.position.y = 2 + i * segmentHeight + segmentHeight / 2;
    group.add(seg);
  }

  // 顶部灯罩(玻璃球)
  const lampBaseGeo = new THREE.CylinderGeometry(1.3, 1.2, 1, 12);
  const lampBase = new THREE.Mesh(lampBaseGeo, whiteMat);
  lampBase.position.y = 14;
  group.add(lampBase);

  const lampGeo = new THREE.SphereGeometry(1, 16, 16);
  const lamp = new THREE.Mesh(lampGeo, glassMat);
  lamp.position.y = 15.3;
  group.add(lamp);

  // 灯罩顶棚
  const capGeo = new THREE.ConeGeometry(1.2, 1, 12);
  const cap = new THREE.Mesh(capGeo, redMat);
  cap.position.y = 16.3;
  group.add(cap);

  // 栏杆装饰
  const railGeo = new THREE.TorusGeometry(1.4, 0.08, 8, 24);
  const rail = new THREE.Mesh(railGeo, whiteMat);
  rail.rotation.x = Math.PI / 2;
  rail.position.y = 14.5;
  group.add(rail);

  group.position.copy(position);
  return group;
}

/**
 * 创建石窟
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createGrottos(position) {
  const group = new THREE.Group();

  // 灰褐色岩石材质
  const rockMat = new THREE.MeshPhongMaterial({
    color: 0x8b7355,
    specular: 0x111111,
    shininess: 5
  });
  const darkRockMat = new THREE.MeshPhongMaterial({
    color: 0x696969,
    specular: 0x111111,
    shininess: 5
  });

  // 山崖形状底座 - 使用不规则几何体模拟
  const cliffGeo = new THREE.BoxGeometry(15, 8, 6);
  const cliff = new THREE.Mesh(cliffGeo, rockMat);
  cliff.position.y = 4;
  group.add(cliff);

  // 顶部崖壁 - 崎岖效果
  const topGeo = new THREE.BoxGeometry(14, 3, 5);
  const top = new THREE.Mesh(topGeo, rockMat);
  top.position.y = 9.5;
  group.add(top);

  // 额外岩石装饰
  const rock1Geo = new THREE.BoxGeometry(3, 2, 3);
  const rock1 = new THREE.Mesh(rock1Geo, darkRockMat);
  rock1.position.set(-5, 10, -1);
  group.add(rock1);

  const rock2Geo = new THREE.BoxGeometry(2, 3, 2);
  const rock2 = new THREE.Mesh(rock2Geo, rockMat);
  rock2.position.set(4, 10.5, 0);
  group.add(rock2);

  // 3个洞窟门 - 半圆拱
  const cavePositions = [-4, 0, 4];
  cavePositions.forEach(x => {
    // 门框
    const doorFrameGeo = new THREE.BoxGeometry(2, 3, 1);
    const doorFrame = new THREE.Mesh(doorFrameGeo, darkRockMat);
    doorFrame.position.set(x, 1.5, 2.5);
    group.add(doorFrame);

    // 半圆拱顶
    const archGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, 0, Math.PI);
    const arch = new THREE.Mesh(archGeo, darkRockMat);
    arch.rotation.x = Math.PI / 2;
    arch.rotation.z = -Math.PI / 2;
    arch.position.set(x, 3, 2.5);
    group.add(arch);

    // 门洞深色
    const holeGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 12, 1, false, 0, Math.PI);
    const holeMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.rotation.x = Math.PI / 2;
    hole.rotation.z = -Math.PI / 2;
    hole.position.set(x, 2, 3);
    group.add(hole);
  });

  // 底部台阶
  for (let i = 0; i < 4; i++) {
    const stepGeo = new THREE.BoxGeometry(12 - i * 1, 0.4, 1);
    const step = new THREE.Mesh(stepGeo, rockMat);
    step.position.set(0, i * 0.4, 3.5 + i * 0.8);
    group.add(step);
  }

  group.position.copy(position);
  return group;
}

/**
 * 创建摩天轮
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createFerriswheel(position) {
  const group = new THREE.Group();

  // 彩色材质数组
  const colorMat = [
    new THREE.MeshPhongMaterial({ color: 0xff6b6b, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0x4ecdc4, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0xffe66d, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0x95e1d3, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0xf38181, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0xaa96da, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0xfcbad3, shininess: 40 }),
    new THREE.MeshPhongMaterial({ color: 0xa8d8ea, shininess: 40 })
  ];
  // 白色材质
  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x333333,
    shininess: 50
  });
  const metalMat = new THREE.MeshPhongMaterial({
    color: 0x888888,
    specular: 0x444444,
    shininess: 60
  });

  // A字形支架 - 两个
  const legGeo = new THREE.BoxGeometry(0.3, 8, 0.3);
  [-3, 3].forEach(x => {
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(x, 4, 0);
    leg.rotation.z = x > 0 ? -0.15 : 0.15;
    group.add(leg);
  });

  // 横梁连接
  const crossGeo = new THREE.BoxGeometry(6.5, 0.3, 0.3);
  const cross = new THREE.Mesh(crossGeo, metalMat);
  cross.position.y = 1;
  group.add(cross);

  // 底部基座
  const baseGeo = new THREE.BoxGeometry(8, 0.5, 2);
  const base = new THREE.Mesh(baseGeo, metalMat);
  base.position.y = 0.25;
  group.add(base);

  // 大圆形轮架
  const wheelGeo = new THREE.TorusGeometry(5, 0.15, 8, 48);
  const wheel = new THREE.Mesh(wheelGeo, whiteMat);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.y = 8;
  group.add(wheel);

  // 内部轮辐
  const spokeGeo = new THREE.TorusGeometry(4, 0.08, 6, 32);
  const innerWheel = new THREE.Mesh(spokeGeo, whiteMat);
  innerWheel.rotation.x = Math.PI / 2;
  innerWheel.position.y = 8;
  group.add(innerWheel);

  // 8根轮辐
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spokeLineGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 8);
    const spokeLine = new THREE.Mesh(spokeLineGeo, whiteMat);
    spokeLine.position.set(
      Math.sin(angle) * 2.5,
      8,
      Math.cos(angle) * 2.5
    );
    spokeLine.rotation.x = Math.PI / 2;
    spokeLine.rotation.z = angle - Math.PI / 2;
    group.add(spokeLine);
  }

  // 中心轴
  const axleGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12);
  const axle = new THREE.Mesh(axleGeo, metalMat);
  axle.rotation.x = Math.PI / 2;
  axle.position.y = 8;
  group.add(axle);

  // 8个轿厢
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const cabinGeo = new THREE.BoxGeometry(1, 1.2, 1);
    const cabin = new THREE.Mesh(cabinGeo, colorMat[i]);
    const radius = 5;
    cabin.position.set(
      Math.sin(angle) * radius,
      8 - Math.cos(angle) * radius - 0.5,
      Math.cos(angle) * radius
    );
    group.add(cabin);

    // 轿厢连接杆
    const connectorGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const connector = new THREE.Mesh(connectorGeo, metalMat);
    connector.position.set(
      Math.sin(angle) * (radius - 0.5),
      8 - Math.cos(angle) * (radius - 0.5),
      Math.cos(angle) * (radius - 0.5)
    );
    group.add(connector);
  }

  group.position.copy(position);
  return group;
}

/**
 * 创建教堂
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createChurch(position) {
  const group = new THREE.Group();

  // 米白色材质
  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xfaf0e6,
    specular: 0x222222,
    shininess: 30
  });
  // 彩色玻璃材质
  const glassColors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xffa500];

  // 主体建筑
  const mainGeo = new THREE.BoxGeometry(6, 6, 10);
  const main = new THREE.Mesh(mainGeo, whiteMat);
  main.position.y = 3;
  group.add(main);

  // 尖顶屋顶
  const roofGeo = new THREE.ConeGeometry(4.5, 4, 4);
  const roof = new THREE.Mesh(roofGeo, whiteMat);
  roof.position.y = 8;
  group.add(roof);

  // 钟楼(高塔)
  const towerGeo = new THREE.BoxGeometry(2, 8, 2);
  const tower = new THREE.Mesh(towerGeo, whiteMat);
  tower.position.set(0, 4, -4.5);
  group.add(tower);

  // 钟楼尖顶
  const towerRoofGeo = new THREE.ConeGeometry(1.5, 3, 8);
  const towerRoof = new THREE.Mesh(towerRoofGeo, whiteMat);
  towerRoof.position.y = 9.5;
  towerRoof.position.z = -4.5;
  group.add(towerRoof);

  // 钟楼钟面装饰
  const clockGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16);
  const clockMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const clock = new THREE.Mesh(clockGeo, clockMat);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(1.1, 7, -4.5);
  group.add(clock);

  // 彩色玻璃窗
  glassColors.forEach((color, i) => {
    const glassMat = new THREE.MeshPhongMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      shininess: 80
    });
    const windowGeo = new THREE.PlaneGeometry(1.5, 3);
    const windowMesh = new THREE.Mesh(windowGeo, glassMat);
    windowMesh.position.set(-2.1 + i * 1.2, 3, 5.01);
    windowMesh.rotation.y = Math.PI / 2;
    group.add(windowMesh);
  });

  // 正面大门
  const doorGeo = new THREE.BoxGeometry(2, 4, 0.3);
  const doorMat = new THREE.MeshPhongMaterial({ color: 0x4a3728 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 2, 5.1);
  group.add(door);

  // 门拱
  const doorArchGeo = new THREE.CylinderGeometry(1, 1, 0.3, 12, 1, false, 0, Math.PI);
  const doorArch = new THREE.Mesh(doorArchGeo, doorMat);
  doorArch.rotation.x = Math.PI / 2;
  doorArch.rotation.z = Math.PI / 2;
  doorArch.position.set(0, 4, 5.1);
  group.add(doorArch);

  // 十字架
  const crossGeo = new THREE.BoxGeometry(0.2, 2, 0.1);
  const crossVGeo = new THREE.BoxGeometry(0.8, 0.2, 0.1);
  const crossMat = new THREE.MeshPhongMaterial({ color: 0xffd700 });
  const crossV = new THREE.Mesh(crossGeo, crossMat);
  crossV.position.y = 1;
  group.add(crossV);
  const crossH = new THREE.Mesh(crossVGeo, crossMat);
  crossH.position.y = 1.5;
  group.add(crossH);
  crossV.position.set(0, 11.5, -4.5);
  crossH.position.set(0, 12, -4.5);

  group.position.copy(position);
  return group;
}

/**
 * 创建现代大厦
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createSkyscraper(position) {
  const group = new THREE.Group();

  // 蓝灰色玻璃材质
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x4a90a4,
    specular: 0x666666,
    shininess: 90,
    transparent: true,
    opacity: 0.8
  });
  // 金属材质
  const metalMat = new THREE.MeshPhongMaterial({
    color: 0x666666,
    specular: 0x888888,
    shininess: 60
  });

  // 主体立方楼体
  const mainGeo = new THREE.BoxGeometry(5, 15, 5);
  const main = new THREE.Mesh(mainGeo, glassMat);
  main.position.y = 7.5;
  group.add(main);

  // 阶梯式顶部 - 3层
  for (let i = 0; i < 3; i++) {
    const size = 4 - i * 1;
    const y = 15 + i * 2;
    const stepGeo = new THREE.BoxGeometry(size, 2, size);
    const step = new THREE.Mesh(stepGeo, glassMat);
    step.position.y = y;
    group.add(step);
  }

  // 顶部天线
  const antennaGeo = new THREE.CylinderGeometry(0.1, 0.2, 4, 8);
  const antenna = new THREE.Mesh(antennaGeo, metalMat);
  antenna.position.y = 23;
  group.add(antenna);

  // 天线尖
  const tipGeo = new THREE.ConeGeometry(0.1, 0.5, 8);
  const tip = new THREE.Mesh(tipGeo, metalMat);
  tip.position.y = 25;
  group.add(tip);

  // 玻璃幕墙分割线
  for (let i = 0; i < 5; i++) {
    const y = i * 3;
    const lineGeo = new THREE.BoxGeometry(5.1, 0.1, 0.1);
    const line = new THREE.Mesh(lineGeo, metalMat);
    line.position.set(0, y, 2.6);
    group.add(line);

    const lineZ = new THREE.Mesh(lineGeo, metalMat);
    lineZ.rotation.x = Math.PI / 2;
    lineZ.position.set(2.6, y, 0);
    group.add(lineZ);
  }

  // 底部大厅入口
  const entranceGeo = new THREE.BoxGeometry(2, 3, 0.5);
  const entranceMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const entrance = new THREE.Mesh(entranceGeo, entranceMat);
  entrance.position.set(0, 1.5, 2.6);
  group.add(entrance);

  group.position.copy(position);
  return group;
}

/**
 * 主函数: 根据类型创建地标
 * @param {Object} position - 位置 {x, y, z}
 * @param {string} type - 地标类型
 * @returns {THREE.Group}
 */
function createLandmark(position, type) {
  switch (type) {
    case "tower": return createTower(position);
    case "pagoda": return createPagoda(position);
    case "pavilion": return createPavilion(position);
    case "dome": return createDome(position);
    case "palace": return createPalace(position);
    case "stadium": return createStadium(position);
    case "stilted": return createStilted(position);
    case "lighthouse": return createLighthouse(position);
    case "grottos": return createGrottos(position);
    case "ferriswheel": return createFerriswheel(position);
    case "church": return createChurch(position);
    case "skyscraper": return createSkyscraper(position);
    default: return createTower(position);
  }
}

// 城市类型映射表
const CITY_LANDMARK_TYPES = {
  // 电视塔
  "北京": "tower", "上海": "tower", "广州": "tower", "深圳": "tower",
  "重庆": "tower", "武汉": "tower", "天津": "tower", "郑州": "tower",
  // 宝塔
  "西安": "pagoda", "南京": "pagoda", "杭州": "pagoda", "苏州": "pagoda",
  "扬州": "pagoda", "南昌": "pagoda", "长沙": "pagoda",
  // 楼阁
  "济南": "pavilion", "昆明": "pavilion", "贵阳": "pavilion",
  // 圆顶
  "拉萨": "dome", "呼和浩特": "dome", "乌鲁木齐": "dome", "兰州": "dome",
  // 宫殿
  "沈阳": "palace", "北京": "palace",
  // 场馆
  "广州": "stadium", "武汉": "stadium", "上海": "stadium",
  // 吊脚楼
  "桂林": "stilted", "丽江": "stilted", "大理": "stilted", "阳朔": "stilted", "张家界": "stilted",
  // 灯塔
  "青岛": "lighthouse", "大连": "lighthouse", "宁波": "lighthouse", "厦门": "lighthouse", "三亚": "lighthouse",
  // 石窟
  "洛阳": "grottos", "大同": "grottos", "重庆": "grottos", "天水": "grottos",
  // 摩天轮
  "天津": "ferriswheel", "香港": "ferriswheel",
  // 教堂
  "哈尔滨": "church", "青岛": "church", "沈阳": "church",
  // 现代大厦
  "深圳": "skyscraper", "成都": "skyscraper", "杭州": "skyscraper"
};

/**
 * 根据城市名创建地标
 * @param {string} cityName - 城市名称
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createCityLandmark(cityName, position) {
  const type = CITY_LANDMARK_TYPES[cityName] || "tower";
  return createLandmark(position, type);
}

/**
 * 创建装饰云朵
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createCloud(position) {
  const group = new THREE.Group();

  // 白色材质
  const whiteMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x222222,
    shininess: 10,
    transparent: true,
    opacity: 0.9
  });

  // 3个重叠球体组成云朵
  const sphereGeo = new THREE.SphereGeometry(1, 12, 12);
  const positions = [
    [0, 0, 0],
    [0.8, 0.3, 0],
    [-0.8, 0.2, 0],
    [0.3, 0.6, 0]
  ];
  const scales = [1.2, 1, 0.9, 0.7];

  positions.forEach((pos, i) => {
    const sphere = new THREE.Mesh(sphereGeo, whiteMat);
    sphere.position.set(pos[0], pos[1], pos[2]);
    sphere.scale.setScalar(scales[i]);
    group.add(sphere);
  });

  group.position.copy(position);
  return group;
}

/**
 * 创建热气球
 * @param {Object} position - 位置 {x, y, z}
 * @returns {THREE.Group}
 */
function createBalloon(position) {
  const group = new THREE.Group();

  // 彩色条纹材质
  const colors = [0xff4444, 0x4444ff, 0xffff44, 0x44ff44, 0xff44ff];
  const stripeMats = colors.map(c => new THREE.MeshPhongMaterial({
    color: c,
    specular: 0x333333,
    shininess: 30
  }));

  // 球形气球
  const balloonGeo = new THREE.SphereGeometry(2, 24, 24);
  const balloon = new THREE.Mesh(balloonGeo, stripeMats[0]);
  balloon.position.y = 4;
  group.add(balloon);

  // 气球顶部装饰
  const topGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
  const top = new THREE.Mesh(topGeo, stripeMats[2]);
  top.position.y = 6.2;
  group.add(top);

  // 吊篮
  const basketGeo = new THREE.BoxGeometry(1, 0.6, 1);
  const basketMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
  const basket = new THREE.Mesh(basketGeo, basketMat);
  basket.position.y = 1;
  group.add(basket);

  // 连接绳
  const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
  const ropeMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const ropePositions = [
    [0.4, 2.5, 0.4], [-0.4, 2.5, 0.4],
    [0.4, 2.5, -0.4], [-0.4, 2.5, -0.4]
  ];
  ropePositions.forEach(pos => {
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.set(pos[0], pos[1], pos[2]);
    group.add(rope);
  });

  group.position.copy(position);
  return group;
}

/**
 * 创建星星粒子
 * @param {number} count - 星星数量
 * @returns {THREE.Group}
 */
function createStars(count) {
  const group = new THREE.Group();

  // 星星材质 - 随机颜色
  const starColors = [0xffffff, 0xffffcc, 0xccccff, 0xffccff, 0xccffff];

  for (let i = 0; i < count; i++) {
    const matIndex = Math.floor(Math.random() * starColors.length);
    const starMat = new THREE.MeshPhongMaterial({
      color: starColors[matIndex],
      emissive: starColors[matIndex],
      emissiveIntensity: 0.5,
      shininess: 80
    });

    const size = 0.05 + Math.random() * 0.1;
    const starGeo = new THREE.SphereGeometry(size, 8, 8);
    const star = new THREE.Mesh(starGeo, starMat);

    // 随机位置分布
    star.position.set(
      (Math.random() - 0.5) * 200,
      20 + Math.random() * 80,
      (Math.random() - 0.5) * 200
    );

    group.add(star);
  }

  return group;
}

// 导出所有函数供外部调用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createLandmark,
    createCityLandmark,
    createTower,
    createPagoda,
    createPavilion,
    createDome,
    createPalace,
    createStadium,
    createStilted,
    createLighthouse,
    createGrottos,
    createFerriswheel,
    createChurch,
    createSkyscraper,
    createCloud,
    createBalloon,
    createStars,
    CITY_LANDMARK_TYPES
  };
}


// 浏览器兼容
if(typeof window!=="undefined") window.Landmarks=module.exports;
