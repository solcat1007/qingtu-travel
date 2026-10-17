/**
 * 沐晴看板娘 · 纯净主题包 v2
 * 左下角固定 · 站/坐双姿态切换
 * standing.png = 站立  sitting.png = 坐姿
 */
class MuqingMascot {
  constructor(options = {}) {
    this.container = null;
    this.wrap     = null;
    this.img      = null;
    this.isVisible   = true;
    this.isCollapsed = false;
    this.currentPosture = 'standing';

    this.postures = {
      standing: '/images/mascot/standing.png',
      sitting:  '/images/mascot/sitting.png',
    };

    this.imgPath = options.imgPath || this.postures.standing;

    this._init();
  }

  _init() {
    this.container = document.getElementById('mascot-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'mascot-container';
      this.container.innerHTML = this._html();
      document.body.appendChild(this.container);
    } else {
      // 更新 HTML
      this.container.innerHTML = this._html();
    }

    this.wrap = document.getElementById('mascot-wrap');
    this.img  = document.getElementById('mascot-img');

    this._bindEvents();
    this.setPosture('standing');
    this._showMessage('☀️ 沐晴为你导航！点击可以折叠哦~', 3500);
  }

  _html() {
    return `
<div id="mascot-wrap">
  <div id="mascot-bubble">
    <div id="mascot-message"></div>
    <div id="mascot-arrow"></div>
  </div>
  <div id="mascot-img-wrap">
    <img id="mascot-img"
         src="${this.postures.standing}"
         alt="沐晴"
         draggable="false">
    <button id="mascot-toggle" title="收起沐晴">−</button>
  </div>
</div>`;
  }

  _bindEvents() {
    const toggleBtn = document.getElementById('mascot-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // 悬停时提示卡片/线路/景点名
    document.querySelectorAll('.attraction-card, .line-card, .city-card, .station-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const name = el.querySelector('h3')?.textContent
                  || el.querySelector('.line-title')?.textContent
                  || el.querySelector('.station-name')?.textContent
                  || '';
        if (name) this._showMessage('📍 ' + name + '，去看看吧！', 2200);
      });
    });
  }

  /** 切换姿态（坐姿/站立） */
  setPosture(posture) {
    if (!this.postures[posture]) return;
    this.currentPosture = posture;
    if (this.img) {
      this.img.src = this.postures[posture];
      this.img.classList.toggle('posture-sitting', posture === 'sitting');
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
  }

  show()   { if (this.container) this.container.style.display = 'block'; this.isVisible = true; }
  hide()   { if (this.container) this.container.style.display = 'none';  this.isVisible = false; }

  _showMessage(text, duration) {
    const bubble = document.getElementById('mascot-bubble');
    const msg   = document.getElementById('mascot-message');
    if (!bubble || !msg) return;
    msg.textContent = text;
    bubble.style.display = 'block';
    if (duration > 0) setTimeout(() => { bubble.style.display = 'none'; }, duration);
  }

  // ── 场景钩子 ──
  onSearch()    { this.setPosture('sitting');  this._showMessage('🔍 查找中...翻翻我的旅行手册', 2500); }
  onCityLoad()  { this.setPosture('standing'); this._showMessage('🏙️ 欢迎来到这座城市！一起探索吧', 3000); }
  onAttraction(){ this.setPosture('standing'); this._showMessage('⭐ 这个景点超棒，快去看看！', 2500); }
  onNotFound()  { this.setPosture('standing'); this._showMessage('😔 这里还没有数据，沐晴会努力采集的', 0); }
  onError()     { this.setPosture('standing'); this._showMessage('😅 好像出了点问题...再试一次吧', 0); }
  onFav()       { this.setPosture('standing'); this._showMessage('🌟 收藏成功！以后来就方便啦', 2000); }
  onExport()    { this.setPosture('standing'); this._showMessage('📦 数据正在导出，请稍候...', 2000); }
  onScrollBottom() { this._showMessage('👇 还有更多内容，向下滑动看看', 2000); }
}

window.addEventListener('DOMContentLoaded', () => {
  try { window.muqing = new MuqingMascot(); } catch(e) { console.warn('Mascot init failed', e); }
});

// ═══════════════════════════════════════════════════════════════════════════
// 沐晴气泡对话扩展 — 独立气泡系统（随机轮播 + 点击交互）
// ═══════════════════════════════════════════════════════════════════════════

/** 沐晴预设对话内容 */
const MUQING_TALKS = [
  "欢迎来到晴途！点击城市开始探索吧~",
  "华东地区有很多美丽城市哦！",
  "要不要看看这条航线？点击飞机！",
  "高铁网络真的超方便的呢！",
  "西藏的风景超级美，有机会一定要去！",
  "青岛的海滩夏天超棒的！",
  "重庆的火锅一定不能错过！",
  "每个城市都有独特的美~",
  "点击地图上的建筑可以查看详情哦",
  "沐晴在这里陪你一起探索！"
];

/** 气泡定时参数（毫秒） */
const BUBBLE_TIMING = {
  fadeIn:    300,   // 淡入时长
  stay:      8000,  // 停留时长
  fadeOut:   300,   // 淡出时长
  nextDelay: 20000  // 下一条间隔
};

/** 气泡DOM元素引用 */
let muqingBubbleEl = null;

/** 当前轮播定时器 */
let bubbleTimer = null;

/** 当前显示的消息索引（避免连续重复） */
let lastTalkIndex = -1;

/**
 * 获取随机对话（不与上一次重复）
 * @returns {string}
 */
function getRandomTalk() {
  let idx;
  do {
    idx = Math.floor(Math.random() * MUQING_TALKS.length);
  } while (idx === lastTalkIndex && MUQING_TALKS.length > 1);
  lastTalkIndex = idx;
  return MUQING_TALKS[idx];
}

/**
 * 创建沐晴气泡DOM并绑定交互
 * 气泡挂载到 body 右下角，通过 fixed 定位跟随窗口
 */
function createMuqinBubble() {
  // 防止重复创建
  if (muqingBubbleEl) return;

  // ── 创建气泡容器 ──
  muqingBubbleEl = document.createElement('div');
  muqingBubbleEl.id = 'muqing-bubble';

  // 内联样式（fixed 定位，不依赖 CSS 文件）
  Object.assign(muqingBubbleEl.style, {
    position: 'fixed',
    bottom: '120px',
    right: '40px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px 20px 20px 4px',
    padding: '14px 20px',
    boxShadow: '0 4px 24px rgba(126, 184, 218, 0.2)',
    border: '2px solid #7eb8da',
    fontSize: '14px',
    color: '#4a5568',
    maxWidth: '250px',
    zIndex: 9998,
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    display: 'none',
    opacity: '0',
    transition: `opacity ${BUBBLE_TIMING.fadeIn}ms ease, transform ${BUBBLE_TIMING.fadeIn}ms ease`,
    transform: 'translateY(10px)',
    lineHeight: '1.6',
    pointerEvents: 'none',
    backdropFilter: 'blur(12px)'
  });

  // ── 小三角箭头（CSS伪元素无法内联，用额外div模拟） ──
  const arrow = document.createElement('div');
  Object.assign(arrow.style, {
    position: 'absolute',
    bottom: '-8px',
    right: '50px',
    width: '0',
    height: '0',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '10px solid #7eb8da',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
  });
  muqingBubbleEl.appendChild(arrow);

  // ── 文字内容区 ──
  const textEl = document.createElement('span');
  textEl.id = 'muqing-bubble-text';
  muqingBubbleEl.appendChild(textEl);

  document.body.appendChild(muqingBubbleEl);

  // ── 绑定沐晴点击/悬停交互 ──
  bindMuqinInteraction();

  // ── 启动自动轮播 ──
  scheduleNextBubble();
}

/**
 * 绑定沐晴容器的交互事件
 */
function bindMuqinInteraction() {
  const container = document.getElementById('mascot-container');
  const wrap = document.getElementById('mascot-img-wrap');

  if (!container || !wrap) return;

  // 点击：立即显示一条随机对话
  container.addEventListener('click', () => {
    showBubble(getRandomTalk());
    // 重置轮播计时器
    resetBubbleTimer();
  });

  // 鼠标悬停：放大 1.05 倍
  container.addEventListener('mouseenter', () => {
    wrap.style.transform = 'scale(1.05)';
    wrap.style.transition = 'transform 0.2s ease';
    wrap.style.cursor = 'pointer';
  });

  // 鼠标移开：恢复原大小
  container.addEventListener('mouseleave', () => {
    wrap.style.transform = 'scale(1)';
  });
}

/**
 * 显示气泡（带淡入动画）
 * @param {string} text - 要显示的文字
 */
function showBubble(text) {
  if (!muqingBubbleEl) return;

  const textEl = muqingBubbleEl.querySelector('#muqing-bubble-text');
  if (textEl) textEl.textContent = text;

  // 重置状态（确保可重复触发）
  muqingBubbleEl.style.display = 'block';
  muqingBubbleEl.style.opacity = '0';
  muqingBubbleEl.style.transform = 'translateY(10px)';

  // 强制 reflow，让 transition 重新触发
  void muqingBubbleEl.offsetWidth;

  // 淡入
  requestAnimationFrame(() => {
    muqingBubbleEl.style.opacity = '1';
    muqingBubbleEl.style.transform = 'translateY(0)';
  });

  // 停留后淡出
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    hideBubble();
  }, BUBBLE_TIMING.stay);
}

/**
 * 隐藏气泡（带淡出动画）
 */
function hideBubble() {
  if (!muqingBubbleEl) return;

  muqingBubbleEl.style.opacity = '0';
  muqingBubbleEl.style.transform = 'translateY(10px)';

  // 动画结束后隐藏（display:none 避免占用空间）
  setTimeout(() => {
    if (muqingBubbleEl) {
      muqingBubbleEl.style.display = 'none';
    }
  }, BUBBLE_TIMING.fadeOut);
}

/**
 * 安排下一次气泡显示
 */
function scheduleNextBubble() {
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    showBubble(getRandomTalk());
    // 淡出后等待间隔，再显示下一条
    bubbleTimer = setTimeout(() => {
      hideBubble();
      scheduleNextBubble();
    }, BUBBLE_TIMING.stay + BUBBLE_TIMING.fadeOut);
  }, BUBBLE_TIMING.nextDelay);
}

/**
 * 重置轮播计时器（点击后重新计时）
 */
function resetBubbleTimer() {
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    hideBubble();
    scheduleNextBubble();
  }, BUBBLE_TIMING.stay + BUBBLE_TIMING.fadeOut);
}

/**
 * 主动触发一次气泡（供外部调用）
 * @param {string} [text] - 可选，指定文字；不填则随机
 */
function triggerBubble(text) {
  if (!muqingBubbleEl) {
    createMuqinBubble();
  }
  showBubble(text || getRandomTalk());
  resetBubbleTimer();
}

// ── 初始化 ──
window.addEventListener('DOMContentLoaded', () => {
  // 等待主 mascot 初始化完成后创建气泡
  setTimeout(() => {
    createMuqinBubble();
    initSparkles();
  }, 100);
});

// ═══════════════════════════════════════════════════════════════════════════
// ✨ 二次元闪烁粒子特效
// ═══════════════════════════════════════════════════════════════════════════

function initSparkles() {
  const container = document.getElementById('mascot-container');
  if (!container) return;

  const sparkleContainer = document.createElement('div');
  sparkleContainer.id = 'mascot-sparkles';
  Object.assign(sparkleContainer.style, {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '250px',
    height: '420px',
    pointerEvents: 'none',
    zIndex: '0'
  });
  container.appendChild(sparkleContainer);

  const colors = ['#7eb8da', '#f4b8c5', '#f5e6a3', '#a8d4ea', '#ffffff', '#e89aad'];

  function createSparkle() {
    const spark = document.createElement('div');
    const size = Math.random() * 6 + 3;
    const x = Math.random() * 230 + 10;
    const y = Math.random() * 380 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 2 + 2;
    const delay = Math.random() * 2;

    Object.assign(spark.style, {
      position: 'absolute',
      left: x + 'px',
      top: y + 'px',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      background: color,
      boxShadow: '0 0 ' + (size * 2) + 'px ' + color,
      animation: 'sparkleFloat ' + duration + 's ease-in-out ' + delay + 's infinite',
      opacity: '0'
    });

    sparkleContainer.appendChild(spark);

    // 限制最多 30 个粒子
    const sparks = sparkleContainer.children;
    if (sparks.length > 30) {
      sparkleContainer.removeChild(sparks[0]);
    }
  }

  // 创建初始粒子
  for (let i = 0; i < 15; i++) {
    setTimeout(() => createSparkle(), i * 150);
  }

  // 持续生成新粒子
  setInterval(() => {
    if (document.getElementById('mascot-container')?.classList.contains('collapsed')) return;
    createSparkle();
  }, 800);
}

// ── 注入闪烁动画 CSS ──
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
@keyframes sparkleFloat {
  0%   { opacity: 0; transform: translateY(0) scale(0); }
  20%  { opacity: 0.8; transform: translateY(-15px) scale(1); }
  60%  { opacity: 0.3; transform: translateY(-40px) scale(0.6); }
  100% { opacity: 0; transform: translateY(-80px) scale(0); }
}`;
document.head.appendChild(sparkleStyle);

// ── 对外导出 ──
window.MuQingBubble = {
  create: createMuqinBubble,
  show:   showBubble,
  hide:   hideBubble,
  trigger: triggerBubble
};
