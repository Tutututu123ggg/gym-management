"use client";
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Invoice } from '@/types/customer/billing';
import { Icons, PaginationControls } from './Shared';

interface Props {
  invoices: Invoice[];
  onPay: (invoice: Invoice) => void;
  onCancel: (subId: string) => void;
}

export default function BillingInvoices({ invoices, onPay, onCancel }: Props) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const pendingList = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE');
  if (pendingList.length === 0) return null;

  const totalPages = Math.ceil(pendingList.length / ITEMS_PER_PAGE);
  const visibleItems = pendingList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-card border border-rose-200 dark:border-rose-900 rounded-xl p-5 shadow-sm animate-in slide-in-from-top-2">
        <h2 className="font-bold text-rose-600 flex items-center gap-2 mb-4">
            <Icons.Alert /> Cần thanh toán ({pendingList.length})
        </h2>
        
        <div className="space-y-3">
            {visibleItems.map((inv) => (
                <div key={inv.id} className="flex flex-col md:flex-row justify-between items-center bg-rose-50 dark:bg-rose-900/10 p-4 rounded-lg border border-rose-100 dark:border-rose-800">
                    <div>
                        <div className="font-semibold">{inv.subscription.plan.name}</div>
                        <div className="text-sm text-gray-500">Hạn chót: {format(new Date(inv.dueDate), 'dd/MM/yyyy')}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 md:mt-0">
                        <span className="font-bold text-lg mr-2">{inv.amount.toLocaleString()} đ</span>
                        <button onClick={() => onPay(inv)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer">Thanh toán</button>
                        <button onClick={() => onCancel(inv.subscriptionId)} className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer" title="Hủy đơn này"><Icons.Trash /></button>
                    </div>
                </div>
            ))}
        </div>

        <PaginationControls current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}