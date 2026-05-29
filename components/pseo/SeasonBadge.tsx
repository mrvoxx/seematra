// components/pseo/SeasonBadge.tsx — Color-coded season indicator
const SEASON_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  summer: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  monsoon: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  autumn: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  winter: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  snowfall: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400' },
};

interface SeasonBadgeProps {
  season: string;
  recommended?: boolean;
  className?: string;
}

export default function SeasonBadge({ season, recommended, className = '' }: SeasonBadgeProps) {
  const colors = SEASON_COLORS[season] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {season.charAt(0).toUpperCase() + season.slice(1)}
      {recommended && (
        <svg className="w-3.5 h-3.5 text-current" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </span>
  );
}
