const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    amount INTEGER NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    product_title TEXT,
    payment_method TEXT,
    card_brand TEXT,
    card_last_digits TEXT,
    paid_at TEXT,
    raw_data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Default config
const defaults = {
  ntfy_topic: '',
  notification_template: '{buyer_name} just purchased "{product_name}" for {product_price}',
  sound_profile: 'Celestial Ping',
  show_product_image: '1',
  show_buyer_location: '1',
  show_sale_value: '1',
  show_purchase_time: '0',
  notify_on_paid: '1',
  notify_on_refunded: '1',
  notify_on_chargeback: '1'
};

const insertDefault = db.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`);
for (const [key, value] of Object.entries(defaults)) {
  insertDefault.run(key, value);
}

module.exports = db;
