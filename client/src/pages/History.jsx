import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

function formatBRL(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

const STATUS_CONFIG = {
  PAID: {
    label: 'VENDA',
    badgeCls: 'bg-tertiary-container text-on-tertiary-container',
    iconCls: 'bg-tertiary-container text-on-tertiary-container',
    icon: 'shopping_bag'
  },
  REFUNDED: {
    label: 'REEMBOLSO',
    badgeCls: 'bg-secondary-container text-on-secondary',
    iconCls: 'bg-secondary-container text-on-secondary',
    icon: 'undo'
  },
  CHARGEDBACK: {
    label: 'CHARGEBACK',
    badgeCls: 'bg-error-container text-on-error',
    iconCls: 'bg-error-container text-on-error',
    icon: 'report'
  },
  REFUSED: {
    label: 'RECUSADO',
    badgeCls: 'bg-surface-container-high text-on-surface-variant',
    iconCls: 'bg-surface-container text-on-surface-variant',
    icon: 'cancel'
  },
  PROCESSING: {
    label: 'PROCESSANDO',
    badgeCls: 'bg-surface-container text-on-surface-variant',
    iconCls: 'bg-surface-container text-on-surface-variant',
    icon: 'autorenew'
  },
};

function SaleCard({ sale }) {
  const cfg = STATUS_CONFIG[sale.status] || STATUS_CONFIG.PROCESSING;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-card-sm">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconCls}`}>
          <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badgeCls}`}>
              {cfg.label}
            </span>
            {sale.payment_method === 'recurring' && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-container/30 text-primary">
                Recorrente
              </span>
            )}
          </div>
          <p className="text-on-surface text-sm font-semibold leading-snug">
            {sale.product_title || 'Produto sem título'}
          </p>
          <p className="text-on-surface-variant text-xs mt-0.5">
            {sale.customer_name ? `Comprado por ${sale.customer_name}` : '—'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-headline font-bold text-lg text-on-surface">{formatBRL(sale.amount)}</p>
          <p className="text-on-surface-variant text-[10px]">{timeAgo(sale.paid_at || sale.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  const fetchSales = (offset = 0, append = false) => {
    const setter = append ? setLoadingMore : setLoading;
    setter(true);
    fetch(`${API}/api/sales?limit=20&offset=${offset}`)
      .then(r => r.json())
      .then(data => {
        setSales(prev => append ? [...prev, ...(data.sales || [])] : (data.sales || []));
        setTotal(data.total || 0);
      })
      .finally(() => setter(false));
  };

  useEffect(() => { fetchSales(); }, []);

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Sistema</span>
          <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
            Notification <span className="italic">History</span>
          </h2>
        </div>
        <button
          onClick={() => navigate('/edit-notifications')}
          className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
        </button>
      </div>

      {/* Webhook status */}
      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-tertiary-container/30 rounded-full w-fit">
        <div className="relative w-2 h-2">
          <div className="w-2 h-2 rounded-full bg-tertiary"></div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Live Webhook Ativo</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {sales.length === 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">notifications_off</span>
                <p className="text-on-surface font-semibold text-sm">Nenhuma notificação ainda</p>
                <p className="text-on-surface-variant text-xs mt-1">Quando uma venda ocorrer, ela aparece aqui.</p>
              </div>
            )}
            {sales.map(sale => <SaleCard key={sale.id} sale={sale} />)}
          </div>

          {sales.length < total && (
            <button
              onClick={() => fetchSales(sales.length, true)}
              disabled={loadingMore}
              className="w-full mt-4 py-3 rounded-2xl bg-surface-container text-on-surface-variant text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais registros'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
