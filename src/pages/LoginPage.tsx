// ============================================================
//  LoginPage.tsx — صفحة تسجيل الدخول
//  بنفس شكل وألوان التطبيق
// ============================================================
import { useState } from 'react';
import { LogIn, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle, loginWithCode, pendingApproval } = useAuth();

  const [code,        setCode]        = useState('');
  const [showCode,    setShowCode]    = useState(false);
  const [codeError,   setCodeError]   = useState('');
  const [loadingG,    setLoadingG]    = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [tab,         setTab]         = useState<'google' | 'code'>('google');

  // ── تسجيل بجوجل ───────────────────────────────────────────
  const handleGoogle = async () => {
    setLoadingG(true);
    await loginWithGoogle();
    setLoadingG(false);
  };

  // ── تسجيل بالكود ──────────────────────────────────────────
  const handleCode = async () => {
    if (!code.trim()) { setCodeError('أدخل الكود'); return; }
    setLoadingCode(true);
    setCodeError('');
    const ok = await loginWithCode(code.trim());
    if (!ok) setCodeError('الكود غير صحيح أو غير مفعّل');
    setLoadingCode(false);
  };

  // ── انتظار الموافقة ────────────────────────────────────────
  if (pendingApproval) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 size={28} className="text-amber-400 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-silver font-body mb-2">في انتظار الموافقة</h2>
          <p className="text-sm text-silver/50 font-body">
            تم إرسال طلبك للمراجعة. سيتم تفعيل حسابك قريباً.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">

      {/* خلفية زخرفية */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal/5 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">

        {/* الشعار */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full border border-[rgba(192,192,192,0.3)] bg-surface flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <img src="/logo.png" alt="حضّالي" className="w-12 h-12 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <h1 className="text-3xl font-display text-silver tracking-widest mb-1">حضّالي</h1>
          <p className="text-sm text-silver/40 font-body">نظام نقاط البيع الذكي</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-[rgba(192,192,192,0.1)] rounded-2xl shadow-modal overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[rgba(192,192,192,0.1)]">
            <button
              onClick={() => setTab('google')}
              className={`flex-1 py-4 text-sm font-body transition-all duration-200
                ${tab === 'google'
                  ? 'text-silver border-b-2 border-silver bg-[rgba(192,192,192,0.05)]'
                  : 'text-silver/40 hover:text-silver/70'
                }`}
            >
              تسجيل بجوجل
            </button>
            <button
              onClick={() => setTab('code')}
              className={`flex-1 py-4 text-sm font-body transition-all duration-200
                ${tab === 'code'
                  ? 'text-silver border-b-2 border-silver bg-[rgba(192,192,192,0.05)]'
                  : 'text-silver/40 hover:text-silver/70'
                }`}
            >
              دخول بالكود
            </button>
          </div>

          <div className="p-6">

            {/* تسجيل بجوجل */}
            {tab === 'google' && (
              <div className="space-y-4">
                <p className="text-xs text-silver/40 font-body text-center mb-4">
                  للأدمن وأصحاب المتاجر
                </p>
                <button
                  onClick={handleGoogle}
                  disabled={loadingG}
                  className="w-full h-12 bg-white text-gray-800 rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 shadow-sm"
                >
                  {loadingG ? (
                    <Loader2 size={18} className="animate-spin text-gray-600" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {loadingG ? 'جاري التسجيل...' : 'تسجيل الدخول بجوجل'}
                </button>
              </div>
            )}

            {/* دخول بالكود */}
            {tab === 'code' && (
              <div className="space-y-4">
                <p className="text-xs text-silver/40 font-body text-center mb-4">
                  للموظفين والعملاء
                </p>
                <div className="relative">
                  <KeyRound size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-silver/30" />
                  <input
                    type={showCode ? 'text' : 'password'}
                    placeholder="أدخل كودك هنا"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCode()}
                    className={`w-full h-12 bg-void border rounded-xl pr-11 pl-11 text-sm text-silver placeholder:text-silver/25 focus:outline-none transition-all duration-300 tracking-widest font-mono
                      ${codeError
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-[rgba(192,192,192,0.2)] focus:border-[rgba(192,192,192,0.5)]'
                      }`}
                  />
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/30 hover:text-silver/60 transition-colors"
                  >
                    {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {codeError && (
                  <p className="text-xs text-red-400 font-body text-center animate-fade-in">
                    {codeError}
                  </p>
                )}

                <button
                  onClick={handleCode}
                  disabled={loadingCode || !code.trim()}
                  className="w-full h-12 bg-silver text-void rounded-xl font-body text-sm font-semibold flex items-center justify-center gap-2 hover:bg-silver/90 transition-all duration-200 disabled:opacity-40"
                >
                  {loadingCode ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  {loadingCode ? 'جاري التحقق...' : 'دخول'}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-silver/20 mt-6 font-body">
          حضّالي © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
