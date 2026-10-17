/**
 * 晴途 · 每日增量更新任务
 * ------------------------------------------------------------------
 * 做什么：
 *   1. 拉取增量数据（新线路 / 票价 / 时刻变动）
 *   2. 校验数据库完整性
 *
 * 怎么定时：
 *   Linux / macOS —— crontab 里加一行：
 *     0 3 * * * cd /path/to/qingtu-travel && node scripts/cron-daily.js >> logs/cron.log 2>&1
 *   Windows —— 任务计划程序里新建基本任务，程序填 node.exe，参数填本文件路径
 *
 * 幂等性说明：
 *   本脚本可重复执行。fetch-data 内部按「最后更新时间」做增量，
 *   重复跑不会产生重复数据，因此定时任务失败后可以直接重跑。
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { LOG_DIR } = require('./config');

/** 统一的日志输出：同时打印到控制台和日志文件，方便定时任务排查 */
function log(msg){
  const t = new Date().toISOString();
  const line = '[' + t + '] ' + msg;
  console.log(line);
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(path.join(LOG_DIR, 'cron.log'), line + '\n');
  } catch(e){ /* 日志写失败不影响主流程 */ }
}

/** 用 Promise 包一层 execFile，方便顺序执行多个子脚本 */
function run(script){
  return new Promise(function(resolve){
    const full = path.join(__dirname, script);
    log('开始执行: ' + script);
    execFile(process.execPath, [full], function(err, stdout, stderr){
      if (err){
        log('失败: ' + script + ' -> ' + err.message);
        if (stderr) log('stderr: ' + String(stderr).slice(0,500));
        resolve(false);
      } else {
        if (stdout) log('输出: ' + String(stdout).trim().slice(0,500));
        log('完成: ' + script);
        resolve(true);
      }
    });
  });
}

(async function main(){
  log('===== 每日任务开始 =====');

  // 先抓增量数据
  const okFetch = await run('fetch-data.js');

  // 再体检，确认数据结构没被写坏
  const okCheck = await run('check-db.js');

  log('===== 每日任务结束 =====');
  process.exit(okFetch && okCheck ? 0 : 1);
})();
