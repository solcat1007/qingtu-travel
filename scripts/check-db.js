const Database = require('better-sqlite3');
const db = new Database('G:/旅游网站项目/数据库/travel.db');

var tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('=== TABLES ===');
tables.forEach(function(t) { console.log(t.name); });

console.log('\n=== COUNTS ===');
['cities','bus_lines','bus_stations','metro_lines','metro_stations','attractions'].forEach(function(t) {
  try { var c = db.prepare('SELECT count(*) as c FROM ' + t).get().c; console.log(t + ': ' + c); }
  catch(e) { console.log(t + ': NOT FOUND'); }
});

try {
  console.log('\n=== bus_stations columns ===');
  db.pragma('table_info(bus_stations)').forEach(function(c) { console.log(c.name + ' ' + c.type); });
} catch(e) { console.log('no bus_stations table'); }

try {
  console.log('\n=== metro_stations columns ===');
  db.pragma('table_info(metro_stations)').forEach(function(c) { console.log(c.name + ' ' + c.type); });
} catch(e) { console.log('no metro_stations table'); }

console.log('\n=== sample attractions ===');
db.prepare("SELECT name, nearby_stations, address FROM attractions LIMIT 5").all().forEach(function(a) {
  console.log(a.name + ' | nearby: ' + (a.nearby_stations || '(empty)') + ' | addr: ' + (a.address || '(empty)'));
});

db.close();
