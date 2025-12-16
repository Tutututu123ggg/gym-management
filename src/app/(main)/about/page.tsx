// src/app/about/page.tsx
"use client";

import React from "react";
import Image from "next/image";

const heroImg =
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1475&auto=format&fit=crop";
const storyImg =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";

const teamMembers = [
  {
    name: "Alex Nguyễn",
    role: "Người sáng lập / Head Coach",
    bio: "10 năm kinh nghiệm thi đấu thể hình quốc tế. Chuyên gia về Strength & Conditioning.",
    img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1470&auto=format&fit=crop",
  },
  {
    name: "Sarah Trần",
    role: "HLV Yoga & Pilates",
    bio: "Chứng chỉ Yoga Alliance RYT 500. Giúp bạn tìm lại sự cân bằng giữa thân và tâm.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1376&auto=format&fit=crop",
  },
  {
    name: "Mike Phạm",
    role: "Chuyên gia Dinh dưỡng",
    bio: "Đã giúp hơn 500 hội viên thay đổi vóc dáng thành công nhờ chế độ ăn khoa học.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1374&auto=format&fit=crop",
  },
  {
    name: "Emily Lê",
    role: "HLV Group X",
    bio: "Năng lượng bùng nổ trong từng lớp Zumba và BodyCombat. Đốt mỡ chưa bao giờ vui thế!",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1522&auto=format&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen pb-20 transition-colors">

      {/* --- HERO --- */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src={heroImg}
          alt="About Gym Master"
          fill
          className="object-cover absolute inset-0 z-0"
          priority
        />

        <div className="relative z-20 text-center px-4">
          <h1 className="text-white text-5xl md:text-6xl font-extrabold uppercase tracking-wider mb-4">
            Câu Chuyện <span className="text-white">Của Chúng Tôi</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Hơn cả một phòng tập, chúng tôi là nơi bắt đầu của những thay đổi vĩ đại.
          </p>
        </div>
      </section>

      {/* --- STORY --- */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* TEXT */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Từ Đam Mê Đến <span className="text-primary">Sứ Mệnh</span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
              <p>
                Được thành lập vào năm 2018, Gym Master khởi đầu từ một gara nhỏ nhưng mang trong mình
                giấc mơ lớn:
                <strong> Xây dựng cộng đồng nơi mọi người rèn luyện cơ bắp lẫn ý chí.</strong>
              </p>
              <p>
                Chúng tôi hiểu rằng bước chân đầu tiên đến phòng tập luôn khó khăn nhất. Tại Gym Master,
                không có sự phán xét — chỉ có sự hỗ trợ và đồng hành.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 border-t border-border pt-8">
              <div>
                <p className="text-4xl font-bold text-primary">5+</p>
                <p className="text-sm text-muted-foreground uppercase font-semibold">Năm hoạt động</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">12k</p>
                <p className="text-sm text-muted-foreground uppercase font-semibold">Hội viên</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">200+</p>
                <p className="text-sm text-muted-foreground uppercase font-semibold">Thiết bị</p>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
            <Image src={storyImg} alt="Gym Master Story" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* --- TEAM --- */}
      <section className="bg-card py-20 px-4 md:px-12 transition-colors">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Gặp Gỡ Đội Ngũ Chuyên Gia</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Những người dẫn đường tận tâm sẽ đồng hành cùng bạn chinh phục mục tiêu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((m, i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group border border-border"
              >
                {/* Image */}
                <div className="relative h-80 w-full overflow-hidden">
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-60 group-hover:opacity-80"></div>
                </div>

                {/* Info */}
                <div className="p-6 relative">
                  <div className="absolute -top-4 left-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {m.role}
                  </div>
                  <h3 className="text-xl font-bold mt-2 mb-2">{m.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Giá Trị Cốt Lõi</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[ "Chuyên Nghiệp", "Tận Tâm", "Cộng Đồng" ].map((title, i) => (
            <div
              key={i}
              className="p-8 border border-border rounded-2xl hover:border-primary hover:bg-accent transition-colors"
            >
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                {`0${i + 1}`}
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-muted-foreground">
                {i === 0
                  ? "Trang thiết bị chuẩn quốc tế và quy trình huấn luyện bài bản."
                  : i === 1
                  ? "Luôn thấu hiểu mục tiêu và đồng hành cùng bạn."
                  : "Môi trường văn minh, truyền cảm hứng lẫn nhau."}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
