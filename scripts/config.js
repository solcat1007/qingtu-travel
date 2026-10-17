/**
 * 晴途 · 统一配置入口
 * ------------------------------------------------------------------
 * 为什么要单独抽一个 config.js？
 *   原来每个脚本里都硬编码了 G:\\旅游网站项目\\... 这种绝对路径，
 *   一旦换机器、换系统、换盘符，全部脚本都得改一遍。
 *   现在所有路径集中在这里，并且优先读环境变量，
 *   既方便本地覆盖，也方便部署到服务器时通过环境变量注入。
 *
 * 可用环境变量：
 *   TRAVEL_DB    —— 数据库文件完整路径
 *   TRAVEL_LOG   —— 日志目录
 */

const path = require('path');

// 项目根目录下建 data/ 与 logs/ 两个目录，作为默认落盘位置
const PROJECT_ROOT = path.join(__dirname, '..');

const DB_PATH = process.env.TRAVEL_DB ||
                path.join(PROJECT_ROOT, 'data', 'travel.db');

const LOG_DIR = process.env.TRAVEL_LOG ||
                path.join(PROJECT_ROOT, 'logs');

module.exports = {
  PROJECT_ROOT,
  DB_PATH,
  LOG_DIR
};
