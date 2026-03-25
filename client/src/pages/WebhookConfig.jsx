import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

export default function WebhookConfig() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [ntfyTopic, setNtfyTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // The webhook URL is this server's /webhook endpoint
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    fetch(`${API}/api/config`).then(r => r.json()).then(cfg => {
      setConfig(cfg);
      setNtfyTopic(cfg.ntfy_topic || '');
    });
    // Determine public URL
    const base = API || window.location.origin;
    setWebhookUrl(`${base}/webhook`);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`${API}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ntfy_topic: ntfyTopic })
    });
    setSaving(false);
    setTestResult({ ok: true, message: 'Configuração salva!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleTest = async () => {
    if (!ntfyTopic) {
      setTestResult({ ok: false, message: 'Configure o tópico ntfy primeiro.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API}/api/test-notification`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, message: 'Notificação enviada! Verifique seu iPhone.' });
      } else {
        setTestResult({ ok: false, message: data.error || 'Erro ao enviar.' });
      }
    } catch {
      setTestResult({ ok: false, message: 'Servidor offline ou erro de rede.' });
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  return (
    <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-xl">sensors</span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Configuração</span>
        </div>
        <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
          Webhook <span className="italic">Configuration</span>
        </h2>
        <p className="text-on-surface-variant text-xs mt-1">
          Conecte sua loja ao Command Center com uma única URL.
        </p>
      </div>

      {/* Webhook URL card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card mt-5 mb-5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
          Sua URL de Webhook
        </span>
        <div className="bg-surface-container-high rounded-xl px-4 py-3 mb-3 break-all">
          <p className="text-on-surface text-sm font-mono">{webhookUrl || 'Carregando...'}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            copied
              ? 'bg-tertiary-container text-on-tertiary-container'
              : 'bg-primary text-on-primary'
          }`}
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copiado!' : 'Copiar URL'}
        </button>
      </div>

      {/* ntfy Topic */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card mb-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm text-on-surface">Tópico ntfy</h3>
            <p className="text-on-surface-variant text-xs">
              Instale o app <strong>ntfy</strong> no iPhone e crie um tópico único.
            </p>
          </div>
        </div>

        <input
          type="text"
          value={ntfyTopic}
          onChange={e => setNtfyTopic(e.target.value)}
          placeholder="Ex: minhas-vendas-2024"
          className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 font-body mb-3"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !ntfyTopic}
            className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
          >
            {testing ? 'Enviando...' : 'Testar'}
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 px-4 py-3 rounded-xl text-xs font-semibold ${
            testResult.ok
              ? 'bg-tertiary-container text-on-tertiary-container'
              : 'bg-error-container text-on-error'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* How to connect */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-card mb-5">
        <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Como Conectar</h3>

        {[
          {
            n: '01',
            title: 'Instale o app ntfy',
            desc: 'Baixe "ntfy" gratuitamente na App Store. Crie um tópico com nome único (só você sabe).'
          },
          {
            n: '02',
            title: 'Configure o tópico acima',
            desc: 'Digite o nome do seu tópico no campo acima e salve. Clique em "Testar" para confirmar.'
          },
          {
            n: '03',
            title: 'Cole a URL no Fluxxopay',
            desc: 'Nas configurações da Fluxxopay, vá em Webhooks e cole a URL copiada acima. Selecione os eventos que desejar.'
          },
        ].map(step => (
          <div key={step.n} className="flex gap-4 mb-4 last:mb-0">
            <span className="font-headline font-extrabold text-2xl text-primary-container leading-none w-8 flex-shrink-0">
              {step.n}
            </span>
            <div>
              <p className="text-on-surface text-sm font-semibold">{step.title}</p>
              <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit notifications shortcut */}
      <button
        onClick={() => navigate('/edit-notifications')}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-surface-container text-on-surface active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">tune</span>
          <span className="text-sm font-semibold">Editar Notificações</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-base">chevron_right</span>
      </button>
    </div>
  );
}
