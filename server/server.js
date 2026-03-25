require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function getConfig() {
  const rows = db.prepare('SELECT key, value FROM config').all();
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

function formatAmount(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function sendNtfy(title, message, tags = [], priority = 3) {
  const config = getConfig();
  const topic = config.ntfy_topic;
  if (!topic) return;

  try {
    const { default: fetch } = await import('node-fetch');
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Tags': tags.join(','),
        'Priority': String(priority),
        'Content-Type': 'text/plain'
      },
      body: message
    });
  } catch (err) {
    console.error('ntfy error:', err.message);
  }
}

function buildNotificationMessage(config, data) {
  const buyerName = data.customer?.name || data.payer?.name || 'Alguém';
  const productTitle = data.items?.[0]?.title || 'produto';
  const price = formatAmount(data.amount || 0);

  return config.notification_template
    .replace('{buyer_name}', buyerName)
    .replace('{product_name}', productTitle)
    .replace('{product_price}', price)
    .replace('{location}', data.customer?.address?.city || '');
}

// ─── Webhook ─────────────────────────────────────────────────────────────────

app.post('/webhook', (req, res) => {
  try {
    const payload = req.body;
    const data = payload.data || payload;

    const id = data.id || payload.objectId || `${Date.now()}`;
    const status = (data.status || '').toUpperCase();
    const amount = data.amount || 0;
    const customerName = data.customer?.name || data.payer?.name || null;
    const customerEmail = data.customer?.email || null;
    const productTitle = data.items?.[0]?.title || null;
    const paymentMethod = data.paymentMethod || null;
    const cardBrand = data.card?.brand || null;
    const cardLastDigits = data.card?.lastDigits || null;
    const paidAt = data.paidAt || data.updatedAt || new Date().toISOString();

    // Upsert sale
    db.prepare(`
      INSERT INTO sales (id, status, amount, customer_name, customer_email, product_title, payment_method, card_brand, card_last_digits, paid_at, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status, paid_at=excluded.paid_at
    `).run(id, status, amount, customerName, customerEmail, productTitle, paymentMethod, cardBrand, cardLastDigits, paidAt, JSON.stringify(payload));

    // Send notification based on status
    const config = getConfig();
    const message = buildNotificationMessage(config, data);

    if (status === 'PAID' && config.notify_on_paid === '1') {
      sendNtfy('💰 Nova Venda!', message, ['money_with_wings', 'tada'], 4);
    } else if (status === 'REFUNDED' && config.notify_on_refunded === '1') {
      sendNtfy('↩️ Reembolso', `${customerName || 'Cliente'} — ${formatAmount(amount)}`, ['arrow_left', 'warning'], 3);
    } else if (status === 'CHARGEDBACK' && config.notify_on_chargeback === '1') {
      sendNtfy('⚠️ Chargeback', `${customerName || 'Cliente'} — ${formatAmount(amount)}`, ['warning', 'x'], 5);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Sales ──────────────────────────────────────────────────────────────

app.get('/api/sales', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const sales = db.prepare(`
    SELECT * FROM sales ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM sales').get().count;

  res.json({ sales, total, limit, offset });
});

// ─── API: Stats ──────────────────────────────────────────────────────────────

app.get('/api/stats', (req, res) => {
  const totalRevenue = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE status = 'PAID'
  `).get().total;

  const totalSales = db.prepare(`
    SELECT COUNT(*) as count FROM sales WHERE status = 'PAID'
  `).get().count;

  const totalRefunds = db.prepare(`
    SELECT COUNT(*) as count FROM sales WHERE status = 'REFUNDED'
  `).get().count;

  const refundRate = totalSales > 0 ? ((totalRefunds / totalSales) * 100).toFixed(1) : '0.0';

  // Last 7 days for chart
  const chartData = db.prepare(`
    SELECT date(paid_at) as day, SUM(amount) as revenue, COUNT(*) as count
    FROM sales WHERE status = 'PAID' AND paid_at >= date('now', '-6 days')
    GROUP BY day ORDER BY day ASC
  `).all();

  res.json({
    totalRevenue,
    totalSales,
    totalRefunds,
    refundRate,
    chartData
  });
});

// ─── API: Config ─────────────────────────────────────────────────────────────

app.get('/api/config', (req, res) => {
  res.json(getConfig());
});

app.put('/api/config', (req, res) => {
  const updates = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(updates)) {
    stmt.run(key, String(value));
  }
  res.json({ ok: true, config: getConfig() });
});

// ─── API: Test Notification ──────────────────────────────────────────────────

app.post('/api/test-notification', async (req, res) => {
  const config = getConfig();
  if (!config.ntfy_topic) {
    return res.status(400).json({ error: 'ntfy_topic não configurado' });
  }
  await sendNtfy(
    '🧪 Teste — Command Center',
    'Sua notificação está funcionando perfeitamente!',
    ['white_check_mark'],
    3
  );
  res.json({ ok: true });
});

// ─── Serve React App ─────────────────────────────────────────────────────────

const DIST = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(DIST));
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Command Center rodando na porta ${PORT}`);
});
