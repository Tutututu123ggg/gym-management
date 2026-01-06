"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Plan } from '@prisma/client';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/context/AuthContext'; 
import { subscribeToPlan } from '@/actions/customer/billing'; 
// Import icon Sale
import { Percent } from 'lucide-react';

const headerBg = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";

// --- INTERFACES (Cập nhật để nhận Promotion) ---

interface Promotion {
  id: string;
  name: string;
  salePrice: number;
  startDate: Date | string;
  endDate: Date | string;
}

// Mở rộng Plan gốc
type PlanWithPromo = Plan & {
  promotions?: Promotion[];
};

interface PlansClientProps {
  allPlans: PlanWithPromo[];
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  title: string;
  desc: string;
}

interface PricingCardProps {
  data: PlanWithPromo;
  isClass: boolean;
  activeTab: string;
  onRegister: (planId: string) => void;
  isLoading: boolean;
}

// --- MAIN COMPONENT ---

export default function PlansClient({ allPlans = [] }: PlansClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('GYM');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const currentPlans = allPlans.filter(p => p.category === activeTab);

  const handleRegister = async (planId: string) => {
    if (!user) {
        setShowLoginModal(true);
        return;
    }

    setLoadingId(planId); 
    try {
        const res = await subscribeToPlan(user.id, planId);
        
        if (res.success) {
            router.push('/billing'); 
        } else {
            alert(res.message);
        }
    } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
        setLoadingId(null);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
      
      {/* HEADER */}
      <section className="relative h-[400px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image src={headerBg} alt="Service Header" fill className="object-cover absolute inset-0 z-0" priority />
        <div className="relative z-20 text-white animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 uppercase">Dịch Vụ & <span className="text-blue-500">Bảng Giá</span></h1>
          <p className="text-lg text-gray-200 font-light max-w-2xl mx-auto">
            Hệ sinh thái sức khỏe toàn diện. Đăng ký trực tuyến - Kích hoạt tức thì.
          </p>
        </div>
      </section>

      {/* TAB NAVIGATION */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-30">
        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between gap-2 border border-gray-100 dark:border-gray-700">
          
          <TabButton 
            isActive={activeTab === 'GYM'} 
            onClick={() => setActiveTab('GYM')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>}
            title="Thẻ Hội Viên Gym" 
            desc="Sử dụng máy móc & thiết bị" 
          />
          
          <TabButton 
            isActive={activeTab === 'CLASS'} 
            onClick={() => setActiveTab('CLASS')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M9 13l-1.5-3a2 2 0 0 1 1-3.5h7a2 2 0 0 1 1 3.5L15 13"/></svg>}
            title="Lớp Học & Coaching" 
            desc="Yoga, Zumba, Aerobic, PT..." 
          />

          <TabButton 
            isActive={activeTab === 'POOL'} 
            onClick={() => setActiveTab('POOL')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>}
            title="Bể Bơi Bốn Mùa" 
            desc="Bơi lội & Thư giãn" 
          />
        </div>
      </div>

      {/* CONTENT AREA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="animate-in fade-in zoom-in-95 duration-300">
           
           <div className="text-center mb-10">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
               {activeTab === 'GYM' && 'Gói Tập Gym (Cơ Bản)'}
               {activeTab === 'CLASS' && 'Các Lớp Học & Khóa Huấn Luyện'}
               {activeTab === 'POOL' && 'Dịch Vụ Bể Bơi'}
             </h2>
             <p className="text-gray-500 dark:text-gray-400 mt-2">
                Đang hiển thị {currentPlans.length} gói dịch vụ (Category: {activeTab})
             </p>
           </div>

           {currentPlans.length > 0 ? (
             <div className={`grid grid-cols-1 ${activeTab === 'CLASS' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-8`}>
               {currentPlans.map((plan) => (
                 <PricingCard 
                   key={plan.id} 
                   data={plan} 
                   isClass={activeTab === 'CLASS'} 
                   activeTab={activeTab} 
                   onRegister={() => handleRegister(plan.id)}
                   isLoading={loadingId === plan.id}
                 />
               ))}
             </div>
           ) : (
             <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
               <p className="text-gray-500 font-bold text-lg">Không tìm thấy gói tập nào.</p>
               <p className="text-sm text-gray-400 mt-1">
                 (Database trả về {allPlans.length} bản ghi, nhưng không có cái nào khớp)
               </p>
             </div>
           )}

        </div>
      </section>

      {/* --- LOGIN MODAL (POPUP) --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 border border-gray-200 dark:border-gray-700">
             
             <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>

             <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng Nhập</h3>
                <p className="text-gray-500 text-sm mt-1">Vui lòng đăng nhập để tiếp tục đăng ký gói tập.</p>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                   <input type="email" placeholder="email@example.com" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Mật khẩu</label>
                   <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <button 
                   onClick={() => router.push('/login')} 
                   className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                >
                   Đăng Nhập Ngay
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                   Chưa có tài khoản? <span className="text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => router.push('/register')}>Đăng ký</span>
                </p>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

const TabButton = ({ isActive, onClick, icon, title, desc }: TabButtonProps) => (
  <button 
    onClick={onClick}
    className={`
      flex-1 flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left group
      ${isActive 
        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 dark:ring-blue-900' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'}
    `}
  >
    <span className={`p-3 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:scale-110 transition-transform'}`}>
      {React.cloneElement(icon, { className: "w-8 h-8" } as React.HTMLAttributes<SVGElement>)}
    </span>
    <div>
      <div className="font-bold text-lg">{title}</div>
      <div className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{desc}</div>
    </div>
  </button>
);

const PricingCard = ({ data, isClass, activeTab, onRegister, isLoading }: PricingCardProps) => {
  // === LOGIC TÍNH TOÁN PROMOTION ===
  const activePromo = data.promotions?.find(promo => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    return now >= startDate && now <= endDate;
  });

  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  const originalPriceFormatted = currencyFormatter.format(data.price);
  
  // Giá hiển thị: Nếu có promo thì lấy giá sale, ko thì lấy giá gốc
  const finalPriceFormatted = activePromo 
    ? currencyFormatter.format(activePromo.salePrice) 
    : originalPriceFormatted;

  const buttonClass = `
    w-full py-3 rounded-xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2
    ${data.highlight 
        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' 
        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'}
    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
  `;

  // CARD CHO CLASS (CÓ ẢNH)
  if (isClass) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        <div className="relative h-48 w-full bg-gray-200">
          {data.image ? (
             <Image src={data.image} alt={data.name} fill className="object-cover" />
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
          )}
          {data.tag && <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">{data.tag}</div>}
          
          {/* Badge Sale trên ảnh */}
          {activePromo && (
             <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1 animate-pulse">
                <Percent size={12} /> SALE
             </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{data.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{data.desc}</p>
          
          <div className="mt-auto">
            {/* --- PHẦN HIỂN THỊ GIÁ --- */}
            <div className="flex items-baseline gap-1 mb-4">
               {activePromo ? (
                   <div className="flex flex-col items-start w-full">
                       <div className="flex items-center gap-2">
                           <span className="text-3xl font-extrabold text-red-600 dark:text-red-500">{finalPriceFormatted}</span>
                           <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                               <Percent size={10} /> -{Math.round(((data.price - activePromo.salePrice)/data.price)*100)}%
                           </span>
                       </div>
                       <div className="flex items-center gap-2">
                           <span className="text-sm text-gray-400 line-through decoration-gray-400">{originalPriceFormatted}</span>
                           <span className="text-sm text-gray-500 dark:text-gray-400">{data.unit}</span>
                       </div>
                       <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">CT: {activePromo.name}</div>
                   </div>
               ) : (
                   <>
                       <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{finalPriceFormatted}</span>
                       <span className="text-sm text-gray-500 dark:text-gray-400">{data.unit}</span>
                   </>
               )}
            </div>

            <ul className="space-y-2 mb-6">
              {data.features && data.features.slice(0, 2).map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feat}
                </li>
              ))}
            </ul>
            
            <button onClick={() => onRegister(data.id)} disabled={isLoading} className={buttonClass}>
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang xử lý...</span>
                    </>
                ) : (
                    <span>
                        {activeTab === 'GYM' ? 'Đăng Ký Thẻ' : (activeTab === 'POOL' ? 'Mua Vé Bơi' : 'Đăng Ký Học')}
                    </span>
                )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CARD CHO GYM/POOL (KHÔNG ẢNH)
  return (
    <div className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 bg-white dark:bg-gray-800 dark:border-gray-700 ${data.highlight ? 'border-blue-500 shadow-xl scale-105 z-10' : 'border-gray-200 hover:shadow-lg hover:-translate-y-1'}`}>
      {data.highlight && <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl uppercase">Best Seller</div>}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wide">{data.name}</h3>
      
      {/* --- PHẦN HIỂN THỊ GIÁ --- */}
      <div className="mt-4 mb-6 min-h-[80px] flex flex-col justify-center">
        {activePromo ? (
            <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2">
                    <span className="text-4xl font-extrabold text-red-600 dark:text-red-500">{finalPriceFormatted}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <Percent size={12} /> SALE
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 line-through decoration-gray-400">{originalPriceFormatted}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">{data.unit}</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                     CT: {activePromo.name}
                </div>
            </div>
        ) : (
            <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{finalPriceFormatted}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">{data.unit}</span>
            </div>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">{data.desc}</p>
      
      <ul className="space-y-4 mb-8 flex-1">
        {data.features && data.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-gray-700 dark:text-gray-300 text-sm">{feat}</span>
          </li>
        ))}
      </ul>

      <button onClick={() => onRegister(data.id)} disabled={isLoading} className={buttonClass}>
          {isLoading ? (
              <>
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang xử lý...</span>
              </>
          ) : (
              <span>
                  {activeTab === 'GYM' ? 'Đăng Ký Thẻ' : (activeTab === 'POOL' ? 'Mua Vé Bơi' : 'Đăng Ký Học')}
              </span>
          )}
      </button>
    </div>
  );
};