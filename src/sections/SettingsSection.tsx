// ============================================================
//  SettingsSection.tsx — إعدادات المتجر تحفظ في IndexedDB
// ============================================================
import { useState, useEffect } from 'react';
import { Store, CreditCard, Bell, Shield, Printer, Users, Save, Loader2, Key } from 'lucide-react';
import { getById, putItem } from '@/lib/db';
import { useConfirm } from '@/context/ConfirmContext';
import type { StoreSettings } from '@/types';

const TABS = [
  { id: 'store',         label: 'المتجر',       icon: Store    },
  { id: 'invoice',       label: 'الفاتورة',     icon: Printer  },
  { id: 'payment',       label: 'الدفع',        icon: CreditCard },
  { id: 'notifications', label: 'الإشعارات',    icon: Bell     },
  { id: 'security',      label: 'الأمان',       icon: Shield   },
  { id: 'users',         label: 'المستخدمين',   icon: Users    },
  { id: 'ai',            label: 'أوتو AI',      icon: Key      },
];

const DEFAULT_SETTINGS: StoreSettings = {
  id:         'storeInfo',
  name:       '',
  phone:      '',
  address:    '',
  taxNumber:  '',
  welcomeMsg: 'أهلاً وسهلاً بكم في متجرنا — نسعد بخدمتكم دائماً',
  footer:     'شكراً لثقتكم — نتطلع لخدمتكم مجدداً 🙏',
  logo:       '',
  thankMsg:   '',
  geminiKey:  '',
};

function Field({
  label, value, onChange, placeholder = '', type = 'text', hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-silver/50 font-body mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 bg-void border border-[rgba(192,192,192,0.2)] rounded-lg px-3 text-sm text-silver placeholder:text-silver/25 focus:outline-none focus:border-[rgba(192,192,192,0.4)] transition-all"
      />
      {hint && <p className="text-xs text-silver/30 mt-1 font-body">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label, value, onChange, placeholder = '', rows = 2,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-silver/50 font-body mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-void border border-[rgba(192,192,192,0.2)] rounded-lg px-3 py-2 text-sm text-silver placeholder:text-silver/25 focus:outline-none focus:border-[rgba(192,192,192,0.4)] transition-all resize-none"
      />
    </div>
  );
}

function Toggle({ label, desc, enabled, onToggle }: {
  label: string; desc: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(192,192,192,0.06)] last:border-0">
      <div>
        <p className="text-sm text-silver font-body">{label}</p>
        <p className="text-xs text-silver/40 font-body">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${enabled ? 'bg-silver' : 'bg-silver/20'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-void transition-all duration-200 ${enabled ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export default function SettingsSection() {
  const { showToast } = useConfirm();
  const [activeTab, setActiveTab] = useState('store');
  const [settings,  setSettings]  = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  const [toggles, setToggles] = useState({
    cash:        true,
    visa:        true,
    instapay:    true,
    wallet:      true,
    lowStock:    true,
    dailyReport: false,
    twoFactor:   false,
    activityLog: true,
    autoLock:    true,
    encryption:  true,
  });

  // ── تحميل الإعدادات ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const saved = await getById<StoreSettings>('settings', 'storeInfo');
      if (saved) setSettings(saved);
      setLoading(false);
    };
    load();
  }, []);

  const set = (key: keyof StoreSettings) => (value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  // ── حفظ الإعدادات ─────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    await putItem('settings', settings);
    setSaving(false);
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const toggleItem = (key: keyof typeof toggles) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-silver/30 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-silver font-body">الإعدادات</h1>
        <p className="text-sm text-silver/40 mt-1 font-body">تخصيص النظام والتفضيلات</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">

        {/* Tabs — أفقية على موبايل */}
        <div className="md:w-48 flex-shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 whitespace-nowrap shrink-0
                  ${activeTab === tab.id
                    ? 'bg-silver text-void font-medium'
                    : 'text-silver/50 hover:text-silver hover:bg-surface'
                  }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* المحتوى */}
        <div className="flex-1 bg-surface rounded-xl p-5 md:p-7 shadow-elevated">

          {/* ── المتجر ──────────────────────────────────────── */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-silver font-body mb-4">بيانات المتجر</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="اسم المتجر *"    value={settings.name}      onChange={set('name')}      placeholder="حضّالي للمستلزمات الطبية" />
                <Field label="رقم الهاتف"       value={settings.phone}     onChange={set('phone')}     placeholder="01001234567" />
                <Field label="العنوان"           value={settings.address}   onChange={set('address')}   placeholder="القاهرة، مصر" />
                <Field label="الرقم الضريبي"    value={settings.taxNumber} onChange={set('taxNumber')} placeholder="اختياري — لو فاضي ما بيظهرش في الفاتورة" hint="اتركه فارغاً لو مفيش ضرائب" />
              </div>
            </div>
          )}

          {/* ── الفاتورة ────────────────────────────────────── */}
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-silver font-body mb-4">إعدادات الفاتورة</h2>
              <TextareaField
                label="رسالة الترحيب (فوق الفاتورة)"
                value={settings.welcomeMsg}
                onChange={set('welcomeMsg')}
                placeholder="أهلاً وسهلاً بكم..."
                rows={2}
              />
              <TextareaField
                label="رسالة الشكر (تحت الفاتورة)"
                value={settings.footer}
                onChange={set('footer')}
                placeholder="شكراً لثقتكم..."
                rows={2}
              />
              <div className="p-4 bg-void rounded-xl border border-[rgba(192,192,192,0.1)]">
                <p className="text-xs text-silver/40 font-body mb-2">معاينة سريعة:</p>
                <p className="text-xs text-silver/60 font-body italic">{settings.welcomeMsg || '...'}</p>
                <p className="text-xs text-silver/30 font-body text-center my-1">— بنود الفاتورة —</p>
                <p className="text-xs text-silver/60 font-body italic text-center">{settings.footer || '...'}</p>
              </div>
            </div>
          )}

          {/* ── الدفع ───────────────────────────────────────── */}
          {activeTab === 'payment' && (
            <div>
              <h2 className="text-base font-semibold text-silver font-body mb-4">طرق الدفع</h2>
              <Toggle label="الدفع النقدي (كاش)"        desc="تمكين استقبال الكاش"             enabled={toggles.cash}     onToggle={() => toggleItem('cash')} />
              <Toggle label="بطاقات فيزا / ماستر"       desc="تمكين الدفع بالبطاقات"           enabled={toggles.visa}     onToggle={() => toggleItem('visa')} />
              <Toggle label="إنستا باي"                  desc="تمكين الدفع عبر إنستا باي"       enabled={toggles.instapay} onToggle={() => toggleItem('instapay')} />
              <Toggle label="المحافظ الإلكترونية"        desc="فودافون كاش، أورانج كاش..."      enabled={toggles.wallet}   onToggle={() => toggleItem('wallet')} />
            </div>
          )}

          {/* ── الإشعارات ────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-base font-semibold text-silver font-body mb-4">الإشعارات</h2>
              <Toggle label="تنبيه نفاد المخزون"   desc="إشعار لما منتج يوصل للحد الأدنى"   enabled={toggles.lowStock}    onToggle={() => toggleItem('lowStock')} />
              <Toggle label="التقرير اليومي"        desc="ملخص يومي للمبيعات عند الإغلاق"     enabled={toggles.dailyReport} onToggle={() => toggleItem('dailyReport')} />
            </div>
          )}

          {/* ── الأمان ───────────────────────────────────────── */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-base font-semibold text-silver font-body mb-4">الأمان السيبراني</h2>
              <Toggle label="المصادقة الثنائية"     desc="تأكيد الدخول بخطوتين"             enabled={toggles.twoFactor}   onToggle={() => toggleItem('twoFactor')} />
              <Toggle label="تسجيل النشاط"          desc="تسجيل جميع العمليات في السجل"      enabled={toggles.activityLog} onToggle={() => toggleItem('activityLog')} />
              <Toggle label="قفل الجلسة تلقائياً"   desc="قفل الشاشة بعد 15 دقيقة خمول"     enabled={toggles.autoLock}    onToggle={() => toggleItem('autoLock')} />
              <Toggle label="تشفير البيانات"         desc="تشفير البيانات الحساسة محلياً"     enabled={toggles.encryption}  onToggle={() => toggleItem('encryption')} />
            </div>
          )}

          {/* ── المستخدمين ───────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="text-center py-12 text-silver/30">
              <Users size={40} strokeWidth={1} className="mx-auto mb-3" />
              <p className="font-body text-sm">إدارة المستخدمين</p>
              <p className="font-body text-xs mt-1">قريباً — إضافة موظفين وأكواد العملاء</p>
            </div>
          )}

          {/* ── أوتو AI ──────────────────────────────────────── */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-silver font-body mb-4">إعدادات أوتو AI</h2>
              <div className="p-4 bg-void rounded-xl border border-[rgba(192,192,192,0.1)] mb-4">
                <p className="text-xs text-silver/60 font-body leading-relaxed">
                  أوتو بيستخدم Gemini AI من جوجل. احصل على API key مجاني من{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-silver underline"
                  >
                    AI Studio
                  </a>
                  {' '}وضعه هنا.
                </p>
              </div>
              <Field
                label="Gemini API Key"
                value={settings.geminiKey ?? ''}
                onChange={set('geminiKey')}
                placeholder="AIzaSy..."
                type="password"
                hint="محفوظ محلياً — مش بيتبعت لأي سيرفر"
              />
            </div>
          )}

          {/* ── زر الحفظ ─────────────────────────────────────── */}
          {activeTab !== 'users' && (
            <div className="mt-6 pt-5 border-t border-[rgba(192,192,192,0.1)]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-6 bg-silver text-void rounded-lg text-sm font-body font-medium hover:bg-silver/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
