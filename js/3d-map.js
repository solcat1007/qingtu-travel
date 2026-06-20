// 3d-map.js - 晴途3D中国地图主逻辑
// 全局变量
let scene, camera, renderer, controls;
let citiesData = [];
let cityMarkers = [];
let flightPaths = [];
let autoRotate = false;
let flightAnimation = true;

const API_BASE = '/api';

// 初始化
async function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 100, 300);

    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 80, 100);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 30;
    controls.maxDistance = 200;

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 创建中国地图底座
    createChinaMap();
    
    // 加载城市数据
    await loadCities();
    
    // 创建城市标注
    createCityMarkers();
    
    // 创建航线动画
    if (flightAnimation) createFlightPaths();
    
    // 隐藏加载提示
    document.getElementById('loading').style.display = 'none';
    
    // 开始渲染循环
    animate();
    
    // 窗口 resize
    window.addEventListener('resize', onWindowResize);
    
    // 点击检测
    renderer.domElement.addEventListener('click', onCanvasClick);
}

// 创建中国地图底座（简化版：用平面+边界线）
function createChinaMap() {
    // 中国大概的经纬度范围
    // 纬度: 18°N - 54°N
    // 经度: 73°E - 135°E
    
    // 创建底座平面
    const geometry = new THREE.PlaneGeometry(120, 80);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a2e, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);
    
    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(120, 30, 0x3B82F6, 0x1a1a2e);
    gridHelper.position.y = -1.9;
    scene.add(gridHelper);
}

// 经纬度转Three.js坐标
function latLonToVector3(lat, lon, radius = 50) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
}

// 加载城市数据
async function loadCities() {
    try {
        const response = await fetch(`${API_BASE}/cities`);
        const result = await response.json();
        if (result.success) {
            citiesData = result.data;
            console.log(`加载了 ${citiesData.length} 个城市`);
        }
    } catch (error) {
        console.error('加载城市数据失败:', error);
    }
}

// 创建城市标注
function createCityMarkers() {
    citiesData.forEach(city => {
        if (!city.latitude || !city.longitude) return;
        
        // 将经纬度映射到Three.js坐标 (简化映射)
        const x = (city.longitude - 100) * 1.2;  // 经度映射到X轴
        const z = (city.latitude - 36) * -1.2;   // 纬度映射到Z轴（反向）
        const y = 0;
        
        // 创建标注组
        const group = new THREE.Group();
        
        // 底座光圈
        const ringGeometry = new THREE.RingGeometry(0.3, 0.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x3B82F6, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.1;
        group.add(ring);
        
        // 城市点
        const dotGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const dotMaterial = new THREE.MeshPhongMaterial({ 
            color: city.attractionCount > 10 ? 0x10b981 : 0x3B82F6 
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.y = 0.5;
        group.add(dot);
        
        // 发光效果
        const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x3B82F6,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.5;
        group.add(glow);
        
        // 设置位置
        group.position.set(x, y, z);
        group.userData = { city: city };
        
        // 添加脉冲动画
        group.userData.pulse = 0;
        
        scene.add(group);
        cityMarkers.push(group);
    });
}

// 创建航线动画
function createFlightPaths() {
    // 随机选择20条航线
    const numFlights = 20;
    const usedCities = citiesData.filter(c => c.latitude && c.longitude);
    
    for (let i = 0; i < numFlights; i++) {
        const city1 = usedCities[Math.floor(Math.random() * usedCities.length)];
        const city2 = usedCities[Math.floor(Math.random() * usedCities.length)];
        if (city1.id === city2.id) continue;
        
        // 创建弧线
        const points = createArcCurve(city1, city2);
        
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 60, 0.05, 8, false);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x3B82F6,
            transparent: true,
            opacity: 0.4
        });
        const tube = new THREE.Mesh(geometry, material);
        scene.add(tube);
        
        // 创建飞机（小球）
        const planeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        scene.add(plane);
        
        flightPaths.push({
            curve: curve,
            plane: plane,
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003
        });
    }
}

// 创建弧线（两个城市间的曲线）
function createArcCurve(city1, city2) {
    const x1 = (city1.longitude - 100) * 1.2;
    const z1 = (city1.latitude - 36) * -1.2;
    const x2 = (city2.longitude - 100) * 1.2;
    const z2 = (city2.latitude - 36) * -1.2;
    
    const start = new THREE.Vector3(x1, 2, z1);
    const end = new THREE.Vector3(x2, 2, z2);
    
    // 计算中点并抬高形成弧线
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    mid.y = distance * 0.3;  // 弧线高度
    
    return [start, mid, end];
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 自动旋转
    if (autoRotate) {
        camera.position.x = camera.position.x * Math.cos(0.001) - camera.position.z * Math.sin(0.001);
        camera.position.z = camera.position.z * Math.cos(0.001) + camera.position.x * Math.sin(0.001);
        camera.lookAt(0, 0, 0);
    }
    
    // 更新控制器
    controls.update();
    
    // 城市标注脉冲动画
    cityMarkers.forEach(group => {
        group.userData.pulse += 0.05;
        const scale = 1 + Math.sin(group.userData.pulse) * 0.1;
        group.children[2].scale.setScalar(scale);  // glow效果缩放
    });
    
    // 航线动画
    flightPaths.forEach(fp => {
        fp.progress += fp.speed;
        if (fp.progress > 1) fp.progress = 0;
        
        const point = fp.curve.getPoint(fp.progress);
        fp.plane.position.copy(point);
    });
    
    renderer.render(scene, camera);
}

// 窗口resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 点击检测
function onCanvasClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(cityMarkers);
    if (intersects.length > 0) {
        const city = intersects[0].object.userData.city;
        showCityPanel(city);
    }
}

// 显示城市信息面板
function showCityPanel(city) {
    document.getElementById('city-name').textContent = city.name;
    document.getElementById('city-province').textContent = city.province;
    document.getElementById('city-desc').textContent = city.description || '暂无描述';
    document.getElementById('bus-count').textContent = city.busCount || 0;
    document.getElementById('metro-count').textContent = city.metroCount || 0;
    document.getElementById('attraction-count').textContent = city.attractionCount || 0;
    
    document.getElementById('info-panel').style.display = 'block';
    document.getElementById('info-panel').dataset.cityId = city.id;
}

// 关闭面板
function closePanel() {
    document.getElementById('info-panel').style.display = 'none';
}

// 进入城市详情
function enterCity() {
    const cityId = document.getElementById('info-panel').dataset.cityId;
    window.open(`city.html?cityId=${cityId}`, '_blank');
}

// 切换航线动画
function toggleFlights() {
    flightAnimation = !flightAnimation;
    if (!flightAnimation) {
        flightPaths.forEach(fp => scene.remove(fp.plane));
        flightPaths = [];
    } else {
        createFlightPaths();
    }
}

// 重置相机
function resetCamera() {
    camera.position.set(0, 80, 100);
    controls.target.set(0, 0, 0);
}

// 切换自动旋转
function toggleAutoRotate() {
    autoRotate = !autoRotate;
}

// 启动
init();
