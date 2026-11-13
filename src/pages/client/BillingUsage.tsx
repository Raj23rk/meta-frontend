import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CreditCard, Receipt, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

export const BillingUsage: React.FC = () => {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      const res = await api.get('/billing/summary');
      setBilling(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Billing & Usage Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your WhatsApp conversation volume, category distribution, and Meta Cloud API cost estimates.
        </p>
      </div>

      {/* Quota Progress Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subscription Plan: <strong className="text-slate-800">{billing?.plan?.toUpperCase()}</strong>
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {billing?.usedQuota?.toLocaleString()} / {billing?.monthlyQuota?.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">messages this period</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 font-semibold uppercase">Estimated Meta Cost</div>
            <div className="text-2xl font-extrabold text-emerald-600">
              ${billing?.estimatedMetaCost?.toFixed(2)} <span className="text-xs font-normal text-slate-500">USD</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${billing?.usagePercent || 5}%` }}
          ></div>
        </div>
        <div className="flex flex-wrap justify-between text-[11px] text-slate-400 mt-2 font-medium gap-1">
          <span>Billing Period: {billing?.period}</span>
          <span>{billing?.usagePercent}% Quota Consumed</span>
        </div>
      </div>

      {/* Category Breakdown (Responsive Grid: 1 on mobile, 2 on tablet, 4 on desktop) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Meta WhatsApp Rate Card Breakdown</h3>
        <p className="text-xs text-slate-500 mb-5">
          Meta charges per 24-hour conversation window based on conversation category.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {billing?.categoryBreakdown?.map((cat: any) => (
            <div key={cat.category} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {cat.category}
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-800">{cat.count} msgs</div>
              <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-mono">${cat.rate}/msg</span>
                <span className="font-bold text-slate-700">${cat.cost.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices List (Responsive with horizontal scroll) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <Receipt className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Invoice History</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billing?.invoices?.map((inv: any) => (
                  <tr key={inv._id}>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${inv.amount?.toFixed(2)} USD</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!billing?.invoices || billing.invoices.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No invoices generated yet for this workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
