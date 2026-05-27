// ============================================================
//  AutoAI.tsx — مساعد أوتو الذكي
//  يترجم أسماء الأدوية ويجيب على أسئلة المخزون
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { getAll } from '@/lib/db';

interface Message {
  role:    'user' | 'auto';
  text:    string;
  image?:  string;
}

interface AutoAIProps {
  geminiKey?: string;
}

// ── بناء السياق للـ AI ─────────────────────────────────────
async function buildSystemPrompt(): Promise<string> {
  const products = await getAll<Product>('products');
  const list = products.map(p =>
    `- ${p.name} | باركود:${p.barcode} | رف:${p.shelf || 'غير محدد'} | مخزون:${p.stock} | سعر:${p.price} ج.م${p.aliases?.length ? ` | أسماء بديلة: ${p.aliases.join(', ')}` : ''}`
  ).join('\n');

  return `أنت مساعد ذكي اسمك "أوتو" لنظام نقاط بيع طبية مصري.
مهامك:
1. ترجمة وتوضيح أسماء الأدوية والمستلزمات الطبية (العلمي والتجاري)
2. تحديد مكان المنتج (رقم الرف)
3. وصف شكل المنتج وعبوته
4. الإجابة على أسئلة المخزون
5. اقتراح بدائل للمنتجات غير المتوفرة

قائمة المنتجات الحالية:
${list}

قواعد مهمة:
- اكتب بالعربية دائماً
- كن مختصراً ومفيداً
- لو المنتج مش في القائمة، قول ذلك وحاول تساعد
- لو حد سأل عن سعر، أعطيه السعر من القائمة
- رد بصيغة مباشرة وودية`;
}

export default function AutoAI({ geminiKey }: AutoAIProps) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'auto', text: 'مرحباً! أنا أوتو 🤖 — سألني عن أي منتج، رقم رف، أو اسم دواء.' }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // لو مفيش API key — رد محلي
      if (!geminiKey) {
        const products = await getAll<Product>('products');
        const found = products.find(p =>
          p.name.includes(userMsg) ||
          p.barcode.includes(userMsg) ||
          p.aliases?.some(a => a.includes(userMsg))
        );

        if (found) {
          setMessages(prev => [...prev, {
            role: 'auto',
            text: `✅ وجدت المنتج!\n\n📦 **${found.name}**\n📍 الرف: ${found.shelf || 'غير محدد'}\n📊 المخزون: ${found.stock} قطعة\n💰 السعر: ${found.price} ج.م${found.aliases?.length ? `\n🔤 أسماء بديلة: ${found.aliases.join(' — ')}` : ''}`,
            image: found.imageUrl,
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'auto',
            text: `لم أجد "${userMsg}" في قائمة المنتجات.\n\nأضف Gemini API key من الإعدادات لتفعيل البحث الذكي الكامل.`,
          }]);
        }
        setLoading(false);
        return;
      }

      // Gemini API
      const systemPrompt = await buildSystemPrompt();
      const history = messages.slice(-6).map(m => ({
        role:  m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...history,
              { role: 'user', parts: [{ text: userMsg }] },
            ],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
          }),
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'لم أفهم السؤال، حاول مرة أخرى.';

      // ابحث عن صورة المنتج لو موجودة
      const products = await getAll<Product>('products');
      const mentioned = products.find(p => reply.includes(p.name) && p.imageUrl);

      setMessages(prev => [...prev, {
        role:  'auto',
        text:  reply,
        image: mentioned?.imageUrl,
      }]);

    } catch {
      setMessages(prev => [...prev, {
        role: 'auto',
        text: 'حدث خطأ في الاتصال. تحقق من الإنترنت أو الـ API key.',
      }]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* ── زر فتح أوتو ── */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 w-14 h-14 rounded-full shadow-modal flex items-center justify-center transition-all duration-300
          ${open
            ? 'bg-void border border-silver/30 text-silver/60'
            : 'bg-gradient-to-br from-teal to-surface border border-silver/20 text-silver hover:scale-110'
          }`}
      >
        {open
          ? <ChevronDown size={22} />
          : <><Bot size={22} /><Sparkles size={10} className="absolute top-2 right-2 text-silver/60" /></>
        }
      </button>

      {/* ── نافذة أوتو ── */}
      {open && (
        <div className="fixed bottom-[88px] md:bottom-24 left-4 md:left-6 z-40 w-[90vw] max-w-sm bg-surface border border-[rgba(192,192,192,0.15)] rounded-2xl shadow-modal animate-slide-up overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[rgba(192,192,192,0.1)] bg-void/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-surface border border-silver/20 flex items-center justify-center">
              <Bot size={18} className="text-silver" />
            </div>
            <div>
              <p className="text-sm font-semibold text-silver font-body">أوتو</p>
              <p className="text-xs text-silver/40 font-body">مساعدك الذكي</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mr-auto text-silver/30 hover:text-silver transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs font-body leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-void border border-[rgba(192,192,192,0.1)] text-silver/80'
                    : 'bg-teal/50 border border-teal text-silver'
                  }`}
                >
                  {msg.text}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="المنتج"
                      className="mt-2 rounded-lg w-full max-h-24 object-cover border border-[rgba(192,192,192,0.1)]"
                    />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-teal/30 border border-teal/50 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-silver/60" />
                  <span className="text-xs text-silver/50 font-body">أوتو بيفكر...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[rgba(192,192,192,0.1)] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="اسأل أوتو..."
              className="flex-1 h-9 bg-void border border-[rgba(192,192,192,0.2)] rounded-xl px-3 text-xs text-silver placeholder:text-silver/25 focus:outline-none focus:border-[rgba(192,192,192,0.4)] font-body"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-silver text-void rounded-xl flex items-center justify-center hover:bg-silver/90 transition-all disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
