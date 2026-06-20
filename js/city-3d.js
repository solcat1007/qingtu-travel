// city-3d.js - 城市交通3D动画
// 全局变量
let busScene, busCamera, busRenderer, busControls;
let metroScene, metroCamera, metroRenderer, metroControls;
let busAnimFrame, metroAnimFrame;

// 初始化城市3D场景
function initCity3D() {
    if (busLines.length > 0) initBus3D();
    if (metroLines.length > 0) initMetro3D();
}

// ==================== 公交3D场景 ====================
function initBus3D() {
    const container = document.getElementById('bus-canvas');
    if (!container) return;
    
    // 场景
    busScene = new THREE.Scene();
    busScene.background = new THREE.Color(0x0a0e27);
    
    // 相机
    busCamera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 1000);
    busCamera.position.set(0, 50, 80);
    
    // 渲染器
    busRenderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
    busRenderer.setSize(container.clientWidth, container.clientHeight);
    
    // 控制器
    busControls = new THREE.OrbitControls(busCamera, busRenderer.domElement);
    busControls.enableDamping = true;
    busControls.dampingFactor = 0.05;
    
    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    busScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    busScene.add(directionalLight);
    
    // 创建地面网格
    const gridHelper = new THREE.GridHelper(100, 20, 0x3B82F6, 0x1a1a2e);
    busScene.add(gridHelper);
    
    // 绘制公交线路
    drawBusLines();
    
    // 动画循环
    function animate() {
        busAnimFrame = requestAnimationFrame(animate);
        busControls.update();
        busRenderer.render(busScene, busCamera);
    }
    animate();
    
    // Resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        busCamera.aspect = width / height;
        busCamera.updateProjectionMatrix();
        busRenderer.setSize(width, height);
    });
}

function drawBusLines() {
    const colors = [0x3B82F6, 0x10b981, 0xef4444, 0xf59e0b, 0x8b5cf6];
    
    busLines.forEach((line, index) => {
        if (!line.stations || line.stations.length < 2) return;
        
        const color = colors[index % colors.length];
        const points = [];
        
        // 生成站点坐标（简化：在网格上随机分布）
        line.stationPositions = [];
        line.stations.forEach((station, i) => {
            const x = (i - line.stations.length/2) * 8 + (Math.random() - 0.5) * 4;
            const z = (index - busLines.length/2) * 15 + (Math.random() - 0.5) * 4;
            const y = 0;
            line.stationPositions.push(new THREE.Vector3(x, y, z));
            points.push(new THREE.Vector3(x, y + 0.5, z));
            
            // 创建站点标记
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({ color: color });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(x, 0.5, z);
            cube.castShadow = true;
            busScene.add(cube);
            
            // 站点发光效果
            const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: color, 
                transparent: true, 
                opacity: 0.3 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 0.5, z);
            busScene.add(glow);
        });
        
        // 绘制线路连线
        if (points.length >= 2) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: color, opacity: 0.8 });
            const lineMesh = new THREE.Line(geometry, material);
            busScene.add(lineMesh);
        }
        
        // 创建公交车（移动的立方体）
        const busGeometry = new THREE.BoxGeometry(1.5, 1, 0.8);
        const busMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const bus = new THREE.Mesh(busGeometry, busMaterial);
        bus.position.copy(line.stationPositions[0]);
        bus.castShadow = true;
        busScene.add(bus);
        
        line.bus = bus;
        line.currentStation = 0;
        line.direction = 1;
    });
    
    // 动画：公交车移动
    function moveBuses() {
        busLines.forEach(line => {
            if (!line.bus || !line.stationPositions) return;
            
            const targetStation = line.stationPositions[line.currentStation];
            const bus = line.bus;
            
            const dx = targetStation.x - bus.position.x;
            const dz = targetStation.z - bus.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist < 0.5) {
                // 到达站点，前往下一站
                line.currentStation += line.direction;
                
                if (line.currentStation >= line.stationPositions.length) {
                    line.direction = -1;
                    line.currentStation = line.stationPositions.length - 2;
                } else if (line.currentStation < 0) {
                    line.direction = 1;
                    line.currentStation = 1;
                }
            } else {
                // 移动公交车
                bus.position.x += dx * 0.02;
                bus.position.z += dz * 0.02;
            }
        });
        
        requestAnimationFrame(moveBuses);
    }
    moveBuses();
}

// ==================== 地铁3D场景 ====================
function initMetro3D() {
    const container = document.getElementById('metro-canvas');
    if (!container) return;
    
    // 场景
    metroScene = new THREE.Scene();
    metroScene.background = new THREE.Color(0x0a0e27);
    
    // 相机
    metroCamera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 1000);
    metroCamera.position.set(0, 60, 100);
    
    // 渲染器
    metroRenderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
    metroRenderer.setSize(container.clientWidth, container.clientHeight);
    
    // 控制器
    metroControls = new THREE.OrbitControls(metroCamera, metroRenderer.domElement);
    metroControls.enableDamping = true;
    metroControls.dampingFactor = 0.05;
    
    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    metroScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    metroScene.add(directionalLight);
    
    // 创建地面
    const groundGeometry = new THREE.PlaneGeometry(120, 80);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    metroScene.add(ground);
    
    // 绘制地铁线路
    drawMetroLines();
    
    // 动画循环
    function animate() {
        metroAnimFrame = requestAnimationFrame(animate);
        metroControls.update();
        metroRenderer.render(metroScene, metroCamera);
    }
    animate();
    
    // Resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        metroCamera.aspect = width / height;
        metroCamera.updateProjectionMatrix();
        metroRenderer.setSize(width, height);
    });
}

function drawMetroLines() {
    const colors = [0x3B82F6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
    
    metroLines.forEach((line, index) => {
        if (!line.stations || line.stations.length < 2) return;
        
        const color = colors[index % colors.length];
        const points = [];
        
        // 生成站点坐标（地铁线路更规整）
        line.stationPositions = [];
        const radius = 30 + index * 5;
        const angleStep = (Math.PI * 2) / line.stations.length;
        
        line.stations.forEach((station, i) => {
            const angle = i * angleStep;
            const x = Math.cos(angle) * radius * 0.5 + (Math.random() - 0.5) * 3;
            const z = Math.sin(angle) * radius * 0.3 + (index - metroLines.length/2) * 10;
            const y = 0;
            line.stationPositions.push(new THREE.Vector3(x, y, z));
            points.push(new THREE.Vector3(x, y + 0.5, z));
            
            // 创建地铁站标记（圆柱体）
            const geometry = new THREE.CylinderGeometry(1.2, 1.2, 2, 16);
            const material = new THREE.MeshPhongMaterial({ color: color });
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.position.set(x, 1, z);
            cylinder.castShadow = true;
            metroScene.add(cylinder);
            
            // 站点光环
            const ringGeometry = new THREE.RingGeometry(1.5, 2, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: color, 
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.4 
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(x, 0.1, z);
            metroScene.add(ring);
        });
        
        // 绘制地铁线路（曲线）
        if (points.length >= 2) {
            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, points.length * 3, 0.3, 8, false);
            const material = new THREE.MeshPhongMaterial({ color: color, opacity: 0.9 });
            const tube = new THREE.Mesh(geometry, material);
            metroScene.add(tube);
        }
        
        // 创建地铁列车（移动的球体）
        const trainGeometry = new THREE.SphereGeometry(1, 16, 16);
        const trainMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 0.3 });
        const train = new THREE.Mesh(trainGeometry, trainMaterial);
        train.position.copy(line.stationPositions[0]);
        train.castShadow = true;
        metroScene.add(train);
        
        // 添加光晕效果
        const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.2 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(line.stationPositions[0]);
        metroScene.add(glow);
        
        line.train = train;
        line.trainGlow = glow;
        line.currentStation = 0;
        line.direction = 1;
    });
    
    // 动画：地铁列车移动
    function moveTrains() {
        metroLines.forEach(line => {
            if (!line.train || !line.stationPositions) return;
            
            const currentIdx = line.currentStation;
            const targetIdx = (currentIdx + line.direction + line.stationPositions.length) % line.stationPositions.length;
            
            const currentPos = line.stationPositions[currentIdx];
            const targetPos = line.stationPositions[targetIdx];
            
            const dx = targetPos.x - line.train.position.x;
            const dz = targetPos.z - line.train.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist < 0.3) {
                // 到达站点，继续下一站
                line.currentStation = targetIdx;
            } else {
                // 移动列车
                line.train.position.x += dx * 0.03;
                line.train.position.z += dz * 0.03;
                line.trainGlow.position.copy(line.train.position);
            }
        });
        
        requestAnimationFrame(moveTrains);
    }
    moveTrains();
}

// 清理函数
function cleanup3D() {
    if (busAnimFrame) cancelAnimationFrame(busAnimFrame);
    if (metroAnimFrame) cancelAnimationFrame(metroAnimFrame);
    
    if (busRenderer) busRenderer.dispose();
    if (metroRenderer) metroRenderer.dispose();
}

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup3D);
