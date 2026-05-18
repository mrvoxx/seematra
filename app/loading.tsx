// app/loading.tsx – Global loading UI (Next.js 13+ App Router)
import { Mountain } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-surface-dark gap-6">
      {/* Animated Logo Pulse */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-20 h-20 rounded-full bg-primary/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mountain size={32} className="text-primary animate-bounce" />
        </div>
      </div>

      {/* Shimmer Bar */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-base font-outfit font-semibold text-brand-text/60 dark:text-brand-text-dark/60 tracking-wide">
          Loading your journey…
        </p>
        <div className="w-48 h-1.5 bg-brand-border dark:bg-brand-border-dark rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
