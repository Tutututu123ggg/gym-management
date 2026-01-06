import React from 'react';

// Interface định nghĩa 1 item shortcut
export interface QuickActionItem {
  icon: React.ElementType; // Lucide Icon component
  label: string;
  href: string;
  color: string;       // Class màu text (vd: text-green-600)
  bgColor: string;     // Class màu nền icon (vd: bg-green-100)
  borderColor: string; // Class border khi hover (vd: border-green-200)
}

interface Props {
  actions: QuickActionItem[];
}

export default function QuickActions({ actions }: Props) {
  if (!actions || actions.length === 0) return null;

  // Tính toán số cột responsive dựa trên số lượng item (tối đa 4 cột)
  const gridCols = `grid-cols-2 md:grid-cols-${Math.min(actions.length, 4)}`;

  return (
    <div className={`grid ${gridCols} gap-4`}>
       {actions.map((action, idx) => {
         const Icon = action.icon;
         return (
           <a 
             key={idx} 
             href={action.href} 
             className={`
               flex flex-col items-center justify-center p-4 
               bg-white dark:bg-slate-900 rounded-xl 
               border border-slate-200 dark:border-slate-800 
               hover:shadow-md transition-all group
               hover:${action.borderColor} 
               /* Lưu ý: Tailwind cần cấu hình safelist hoặc viết class đầy đủ ở component cha nếu dùng dynamic class string */
             `}
           >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2 
                transition-transform group-hover:scale-110 duration-300
                ${action.bgColor} ${action.color}
              `}>
                 <Icon size={20}/>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center">
                {action.label}
              </span>
           </a>
         );
       })}
    </div>
  );
}