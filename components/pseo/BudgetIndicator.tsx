// components/pseo/BudgetIndicator.tsx — Visual budget range indicator
interface BudgetRange {
  budget: { min: number; max: number };
  mid_range: { min: number; max: number };
  luxury: { min: number; max: number };
  currency: string;
  note: string;
}

interface BudgetIndicatorProps {
  budget: BudgetRange;
}

export default function BudgetIndicator({ budget }: BudgetIndicatorProps) {
  const tiers = [
    { label: 'Budget', range: budget.budget, color: 'bg-green-500', icon: '🎒' },
    { label: 'Mid-Range', range: budget.mid_range, color: 'bg-teal-500', icon: '🏨' },
    { label: 'Luxury', range: budget.luxury, color: 'bg-amber-500', icon: '✨' },
  ];

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Trip Budget (per person/day)</h3>
      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.label} className="flex items-center gap-4">
            <span className="text-2xl w-8">{tier.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{tier.label}</span>
                <span className="text-sm font-medium text-gray-600">
                  ₹{tier.range.min.toLocaleString('en-IN')} – ₹{tier.range.max.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${tier.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((tier.range.max / budget.luxury.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {budget.note && (
        <p className="mt-4 text-xs text-gray-500 italic">{budget.note}</p>
      )}
    </div>
  );
}
