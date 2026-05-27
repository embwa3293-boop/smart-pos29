import { useState } from 'react';
import { Search, Bell, MessageSquare, User, ChevronDown, Store } from 'lucide-react';

export default function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[rgba(192,192,192,0.1)] bg-void/80 backdrop-blur-md sticky top-0 z-40">
      {/* Store Selector */}
      <button className="flex items-center gap-2 bg-[rgba(19,62,71,0.8)] border border-[rgba(192,192,192,0.3)] rounded-full px-4 py-2 text-silver text-sm hover:border-[rgba(192,192,192,0.5)] transition-all duration-300">
        <Store size={16} />
        <span>المتجر الرئيسي</span>
        <ChevronDown size={14} />
      </button>

      {/* Search Bar */}
      <div className="relative w-[400px]">
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-silver/40" />
        <input
          type="text"
          placeholder="بحث في المنتجات أو الفواتير..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 bg-void border border-[rgba(192,192,192,0.2)] rounded-full pr-11 pl-4 text-sm text-silver placeholder:text-silver/30 focus:outline-none focus:border-[rgba(192,192,192,0.4)] transition-all duration-300"
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/60 hover:text-silver hover:border-[rgba(192,192,192,0.4)] transition-all duration-300 relative">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500/80 rounded-full text-[10px] flex items-center justify-center text-white">3</span>
        </button>
        <button className="w-9 h-9 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/60 hover:text-silver hover:border-[rgba(192,192,192,0.4)] transition-all duration-300">
          <MessageSquare size={16} />
        </button>
        <button className="w-9 h-9 rounded-full border border-[rgba(192,192,192,0.2)] flex items-center justify-center text-silver/60 hover:text-silver hover:border-[rgba(192,192,192,0.4)] transition-all duration-300">
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
