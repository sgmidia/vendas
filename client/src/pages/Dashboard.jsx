import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function formatBRL(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function StatusBadge({ status }) {
  const map = {
    PAID: { label: 'Pago', cls: 'bg-tertiary-container text-on-tertiary-container' },
    REFUNDED: { label: 'Reembolso', cls: 'bg-secondary-container text-on-secondary' },
    CHARGEDBACK: { label: 'Chargeback', cls: 'bg-error-container text-on-error' },
    REFUSED: { label: 'Recusado', cls: 'bg-surface-container-high text-on-surface-variant' },
    PROCESSING: { label: 'Processando', cls: 'bg-surface-container text-on-surface-variant' },
  };
  const s = map[status] || { label: status, cls: 'bg-surface-container text-on-surface-variant' };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

function SparklineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-on-surface-variant text-xs">
        Sem dados ainda
      </div>
    );
  }

  const values = data.map(d => d.revenue || 0);
  const max = Math.max(...values, 1);
  const w = 300, h = 80;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * w;
    const y = h - (v / max) * (h - 10) - 5;
    return `${x},${y}`;
  });
  const pathD = pts.length === 1
    ? `M ${pts[0]} L ${w},${h - (values[0] / max) * (h - 10) - 5}`
    : `M ${pts.join(' L ')}`;
  const areaD = `${pathD} L ${w},${h} L 0,${h} Z`;

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: '80px' }}>
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4647d3" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4647d3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#g)" />
        <path d={pathD} fill="none" stroke="#4647d3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => {
          const x = (i / (values.length - 1 || 1)) * w;
          const y = h - (v / max) * (h - 10) - 5;
          return <circle key={i} cx={x} cy={y} r="4" fill="#4647d3" />;
        })}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {data.map((d, i) => {
          const date = new Date(d.day + 'T12:00:00');
          return (
            <span key={i} className="text-[9px] font-bold text-on-surface-variant uppercase">
              {days[date.getDay()]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/stats`).then(r => r.json()),
      fetch(`${API}/api/sales?limit=5`).then(r => r.json())
    ]).then(([s, sl]) => {
      setStats(s);
      setRecentSales(sl.sales || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Hero metric */}
      <div className="mb-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Receita Total
        </span>
      </div>
      <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter leading-none mb-3">
        {formatBRL(stats?.totalRevenue || 0)}
      </h2>
      <div className="flex items-center gap-3 mb-6">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-card-sm">
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Vendas</span>
            <span className="font-headline font-bold text-xl text-on-surface">{stats?.totalSales || 0}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-card-sm">
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Reembolsos</span>
            <span className="font-headline font-bold text-xl text-on-surface">{stats?.refundRate || '0.0'}%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface-container-low rounded-3xl p-5 mb-5 relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface">Sales Velocity</h3>
            <p className="text-on-surface-variant text-xs">Últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-tertiary"></div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-tertiary">Live</span>
          </div>
        </div>
        <SparklineChart data={stats?.chartData || []} />
        {/* Atmospheric blur */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary-container opacity-10 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* Recent sales */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-headline font-bold text-base text-on-surface">Vendas Recentes</h3>
        <span className="text-xs text-on-surface-variant">{recentSales.length} registros</span>
      </div>

      <div className="flex flex-col gap-3">
        {recentSales.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">inbox</span>
            <p className="text-on-surface-variant text-sm">Nenhuma venda ainda.</p>
            <p className="text-on-surface-variant text-xs mt-1">Configure o webhook para começar.</p>
          </div>
        )}
        {recentSales.map(sale => (
          <div key={sale.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-card-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary-container text-lg">
                {sale.status === 'PAID' ? 'shopping_bag' : sale.status === 'REFUNDED' ? 'undo' : 'warning'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-on-surface text-sm font-semibold truncate">
                  {sale.product_title || 'Produto'}
                </p>
                <StatusBadge status={sale.status} />
              </div>
              <p className="text-on-surface-variant text-xs truncate">
                {sale.customer_name || '—'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-headline font-bold text-base text-on-surface">{formatBRL(sale.amount)}</p>
              <p className="text-on-surface-variant text-[10px]">{timeAgo(sale.paid_at || sale.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
