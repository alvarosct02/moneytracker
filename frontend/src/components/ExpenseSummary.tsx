import { ExpenseSummary as Summary } from '../types';

interface ExpenseSummaryProps {
  summary: Summary;
  expensesCount: number;
}

const formatCurrency = (amount: number, currency: 'PEN' | 'USD'): string => {
  if (currency === 'PEN') {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

export default function ExpenseSummary({ summary, expensesCount }: ExpenseSummaryProps) {
  return (
    <div className="mb-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-emerald-600 mb-1">
            {formatCurrency(summary.totalPEN, 'PEN')}
          </div>
          <div className="text-xs text-gray-500">Total PEN</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-emerald-600 mb-1">
            {formatCurrency(summary.totalUSD, 'USD')}
          </div>
          <div className="text-xs text-gray-500">Total USD</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-emerald-600 mb-1">
            {expensesCount}
          </div>
          <div className="text-xs text-gray-500">Gastos</div>
        </div>
      </div>

      {/* Quick Stats by Owner */}
      {Object.keys(summary.byOwner).length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
            Por Persona
          </div>
          <div className="space-y-2">
            {Object.entries(summary.byOwner)
              .sort(([, a], [, b]) => (b.PEN + b.USD) - (a.PEN + a.USD))
              .map(([owner, amounts]) => (
                <div key={owner} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{owner}</span>
                  <div className="flex gap-2">
                    {amounts.PEN > 0 && (
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(amounts.PEN, 'PEN')}
                      </span>
                    )}
                    {amounts.USD > 0 && (
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(amounts.USD, 'USD')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

