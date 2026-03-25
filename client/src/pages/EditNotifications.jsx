import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const SOUNDS = ['Celestial Ping', 'Digital Coin', 'Soft Pulsar', 'Minimal Pop'];

const VARIABLES = [
  { tag: '{buyer_name}', label: 'Nome do comprador' },
  { tag: '{product_name}', label: 'Produto' },
  { tag: '{product_price}', label: 'Valor' },
  { tag: '{location}', label: 'Localização' },
];

export default function EditNotifications() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/config`).then(r => r.json()).then(setConfig);
  }, []);

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const toggleTag = (tag) => {
    const tpl = config.notification_template || '';
    if (tpl.includes(tag)) {
      update('notification_template', tpl.replace(tag, '').replace(/\s{2,}/g, ' ').trim());
    } else {
      update('notification_template', `${tpl} ${tag}`.trim());
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`${API}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    update('notification_template', '{buyer_name} just purchased "{product_name}" for {product_price}');
    update('sound_profile', 'Celestial Ping');
    update('show_product_image', '1');
    update('show_buyer_location', '1');
    update('show_sale_value', '1');
    update('show_purchase_time', '0');
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const buyerName = 'Alex Rivers';
  const productName = 'The Creator Kit';
  const price = 'R$ 189,00';
  const previewMsg = (config.notification_template || '')
    .replace('{buyer_name}', buyerName)
    .replace('{product_name}', productName)
    .replace('{product_price}', price)
    .replace('{location}', 'São Paulo, Brasil');

  return (
    <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-on-surface-variant mb-4 active:opacity-70">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        <span className="text-xs font-semibold">Voltar</span>
      </button>
      <div className="mb-1">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Feedback em tempo real</span>
        <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
          Notification <span className="italic">Preview</span>
        </h2>
      </div>
      <p className="text-xs text-tertiary font-semibold mb-5 flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">fiber_manual_record</span>
        Live Preview Ativo
      </p>

      {/* Preview card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">image</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container">
                Nova Venda +{price}
              </span>
            </div>
            <p className="text-on-surface font-bold text-sm leading-snug">
              {buyerName} just purchased
            </p>
            <p className="text-primary font-bold text-sm">"{productName}"</p>
            <p className="text-on-surface-variant text-xs mt-0.5">São Paulo, Brasil • 2 segundos atrás</p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3">
          <p className="text-on-surface text-sm leading-relaxed">{previewMsg || '—'}</p>
        </div>
      </div>

      {/* Message Template */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-bold text-sm text-on-surface">Template da Mensagem</h3>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">edit_note</span>
        </div>
        <textarea
          rows={3}
          value={config.notification_template || ''}
          onChange={e => update('notification_template', e.target.value)}
          className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none font-body"
          placeholder="Ex: {buyer_name} comprou {product_name} por {product_price}"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {VARIABLES.map(v => (
            <button
              key={v.tag}
              onClick={() => toggleTag(v.tag)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all active:scale-95 ${
                config.notification_template?.includes(v.tag)
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {v.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sound Profile */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-bold text-sm text-on-surface">Perfil de Som</h3>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">music_note</span>
        </div>
        <div className="flex flex-col gap-2">
          {SOUNDS.map(sound => (
            <button
              key={sound}
              onClick={() => update('sound_profile', sound)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                config.sound_profile === sound
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {sound}
              {config.sound_profile === sound && (
                <span className="material-symbols-outlined text-base">check</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Rules */}
      <div className="mb-6">
        <h3 className="font-headline font-bold text-sm text-on-surface mb-3">Regras Visuais</h3>
        <div className="flex flex-col gap-0">
          {[
            { key: 'show_product_image', label: 'Imagem do Produto', sub: 'Mostrar thumbnail' },
            { key: 'show_buyer_location', label: 'Localização do Comprador', sub: 'Cidade e País' },
            { key: 'show_sale_value', label: 'Valor da Venda', sub: 'Mostrar preço' },
            { key: 'show_purchase_time', label: 'Horário da Compra', sub: 'Tempo relativo' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-surface-container last:border-0">
              <div>
                <p className="text-on-surface text-sm font-medium">{label}</p>
                <p className="text-on-surface-variant text-xs">{sub}</p>
              </div>
              <button
                onClick={() => update(key, config[key] === '1' ? '0' : '1')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  config[key] === '1' ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                  config[key] === '1' ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notify on */}
      <div className="mb-6">
        <h3 className="font-headline font-bold text-sm text-on-surface mb-3">Notificar quando</h3>
        <div className="flex flex-col gap-0">
          {[
            { key: 'notify_on_paid', label: 'Venda aprovada', icon: 'check_circle' },
            { key: 'notify_on_refunded', label: 'Reembolso', icon: 'undo' },
            { key: 'notify_on_chargeback', label: 'Chargeback', icon: 'warning' },
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-surface-container last:border-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-on-surface-variant">{icon}</span>
                <p className="text-on-surface text-sm font-medium">{label}</p>
              </div>
              <button
                onClick={() => update(key, config[key] === '1' ? '0' : '1')}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  config[key] === '1' ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                  config[key] === '1' ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface-variant text-sm font-bold active:scale-95 transition-transform"
        >
          Resetar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${
            saved ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-primary text-on-primary'
          }`}
        >
          {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Config'}
        </button>
      </div>
    </div>
  );
}
