"use client";
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Invoice } from '@/types/customer/billing';
import { Icons, PaginationControls, GhostRows } from './Shared';

export default function BillingHistory({ invoices }: { invoices: Invoice[] }) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const HEIGHT = "h-[65px]";

  const historyList = invoices.filter(inv => inv.status !== 'PENDING' && inv.status !== 'OVERDUE');
  const totalPages = Math.ceil(historyList.length / ITEMS_PER_PAGE);
  const visibleItems = historyList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col min-h-[500px]">
        <h2 className="font-bold text-lg mb-4">Lịch sử giao dịch</h2>
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500">
                    <tr><th className="p-3 rounded-l-lg">Ngày</th><th className="p-3">Dịch vụ</th><th className="p-3">Số tiền</th><th className="p-3 rounded-r-lg">Trạng thái</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {visibleItems.length > 0 ? (
                        <>
                            {visibleItems.map((inv) => (
                                <tr key={inv.id} className={`${HEIGHT} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                                    <td className="p-3">{format(new Date(inv.createdAt), 'dd/MM/yyyy')}</td>
                                    <td className="p-3 font-medium">{inv.subscription.plan.name}</td>
                                    <td className="p-3">{inv.amount.toLocaleString()} đ</td>
                                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{inv.status}</span></td>
                                </tr>
                            ))}
                            {/* Ghost Rows */}
                            {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - visibleItems.length) }).map((_, i) => (
                                <tr key={`ghost-${i}`} className={HEIGHT}><td colSpan={4}></td></tr>
                            ))}
                        </>
                    ) : (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500 italic h-[400px] align-middle">Chưa có giao dịch hoàn tất</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        <PaginationControls current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}