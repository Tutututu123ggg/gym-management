// components/home/LandingPage.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Ảnh Demo
const heroImg = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";
const featureImg1 = "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1600&auto=format&fit=crop";
const featureImg2 = "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1469&auto=format&fit=crop";

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[600px] md:h-[750px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10" />
        <Image src={heroImg} alt="Gym Hero" fill className="object-cover absolute inset-0 z-0" priority />
        
        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center animate-fade-in-up">
          <span className="text-blue-500 font-bold tracking-widest uppercase mb-4 text-sm md:text-base bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 backdrop-blur-sm">
            #1 Fitness Center in Hanoi
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            NÂNG TẦM <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">VÓC DÁNG VIỆT</span>
          </h1>
          <p className="text-lg md:text-2xl text-white mb-10 font-light max-w-2xl leading-relaxed">
            Trải nghiệm không gian tập luyện đẳng cấp 5 sao với trang thiết bị hiện đại nhất. 
            Đăng ký ngay hôm nay để nhận ưu đãi giảm 50%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Gọi hàm onLoginClick được truyền từ cha */}
            <button 
              onClick={onLoginClick}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2"
            >
              <span>Đăng Ký Ngay</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <Link href="/about" className="px-8 py-4 bg-transparent backdrop-blur-md border border-white text-white hover:bg-white hover:text-black rounded-full font-bold text-lg transition-all flex items-center justify-center">
              Tìm Hiểu Thêm
            </Link>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-10 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-3xl md:text-4xl font-bold text-foreground mb-1">2000m²</p><p className="text-muted-foreground text-sm uppercase">Diện tích sàn</p></div>
          <div><p className="text-3xl md:text-4xl font-bold text-foreground mb-1">50+</p><p className="text-muted-foreground text-sm uppercase">HLV Chuyên nghiệp</p></div>
          <div><p className="text-3xl md:text-4xl font-bold text-foreground mb-1">24/7</p><p className="text-muted-foreground text-sm uppercase">Mở cửa</p></div>
          <div><p className="text-3xl md:text-4xl font-bold text-foreground mb-1">15k+</p><p className="text-muted-foreground text-sm uppercase">Hội viên tin tưởng</p></div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-20 md:py-28 px-4 md:px-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Tại Sao Chọn Gym Master?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Không chỉ là phòng tập — đây là hệ sinh thái sức khỏe hoàn chỉnh.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600 dark:text-blue-300 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Máy Tập Nhập Khẩu</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Trang thiết bị Technogym & LifeFitness đời mới, độ bền cao và an toàn tuyệt đối.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600 dark:text-green-300 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">PT Có Tâm & Có Tầm</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">HLV chứng chỉ quốc tế, kèm cặp tận tâm theo lộ trình chuyên sâu.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600 dark:text-purple-300 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lịch Tập Linh Hoạt</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Mở từ 5h đến 23h, check-in FaceID nhanh chóng.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- IMAGE SHOWCASE --- */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-[400px] md:h-[600px] group overflow-hidden">
          <Image src={featureImg1} alt="Cardio Area" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-10">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Khu Vực Cardio</h3>
              <p className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">View thành phố cực chill, hệ thống máy chạy tích hợp màn hình giải trí Netflix/Youtube.</p>
            </div>
          </div>
        </div>
        <div className="relative h-[400px] md:h-[600px] group overflow-hidden">
          <Image src={featureImg2} alt="Free Weights" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-10">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Khu Vực Free Weights</h3>
              <p className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Đầy đủ các mức tạ từ 2kg đến 50kg, sàn tập chuẩn Olympic chống chấn thương.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Đừng Chờ Đợi Phiên Bản Hoàn Hảo <br /><span>Hãy Bắt Đầu Để Trở Nên Hoàn Hảo</span></h2>
          <p className="text-xl text-primary-foreground/80 mb-10">Đăng ký ngay hôm nay để nhận gói tập thử miễn phí 7 ngày cùng Huấn luyện viên cá nhân.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/plans" className="px-10 py-5 bg-primary-foreground text-primary hover:bg-white rounded-full font-bold text-xl shadow-xl transition-transform hover:-translate-y-1">Xem Bảng Giá Gói Tập</Link>
             <button onClick={onLoginClick} className="px-10 py-5 bg-transparent border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full font-bold text-xl transition-all">Liên Hệ Tư Vấn</button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-card text-muted-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div><h3 className="text-foreground font-bold text-xl mb-4">Gym Master</h3><p>Hệ thống phòng tập 5 sao hàng đầu Việt Nam.</p></div>
          <div><h4 className="text-foreground font-bold mb-4">Liên kết</h4><ul className="space-y-2"><li><Link href="/" className="hover:text-primary">Trang chủ</Link></li><li><Link href="/about" className="hover:text-primary">Về chúng tôi</Link></li><li><Link href="/plans" className="hover:text-primary">Gói tập</Link></li></ul></div>
          <div><h4 className="text-foreground font-bold mb-4">Hỗ trợ</h4><ul className="space-y-2"><li><a href="#" className="hover:text-primary">Câu hỏi thường gặp</a></li><li><a href="#" className="hover:text-primary">Điều khoản sử dụng</a></li><li><a href="#" className="hover:text-primary">Chính sách bảo mật</a></li></ul></div>
          <div><h4 className="text-foreground font-bold mb-4">Liên hệ</h4><p>Hotline: 1900 1234</p><p>Email: support@gymmaster.vn</p><p>Địa chỉ: 123 Đường ABC, Quận Cầu Giấy, Hà Nội</p></div>
        </div>
        <div className="text-center pt-8 border-t border-border"><p>© {new Date().getFullYear()} Gym Master. All rights reserved.</p></div>
      </footer>
    </div>
  );
}