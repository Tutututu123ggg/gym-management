/**
 * -----------------------------------------------------------------------------
 * FILE: src/lib/mail.ts (REAL MODE)
 * * MÔ TẢ:
 * File này sử dụng Resend để gửi email thật.
 * -----------------------------------------------------------------------------
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const confirmLink = `${domain}/verify-email?token=${token}`;

  try {
    const data = await resend.emails.send({
      // BẮT BUỘC: Phải dùng mail này nếu chưa mua domain riêng
      from: 'onboarding@resend.dev', 
      
      // QUAN TRỌNG: Ở chế độ test, email này phải trùng với email đăng ký Resend
      to: email, 
      
      subject: '🔥 Kích hoạt tài khoản Gym Master',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Xin chào!</h2>
          <p>Bạn vừa đăng ký tài khoản tại Gym Master. Vui lòng xác thực email:</p>
          
          <a href="${confirmLink}" style="
             display: inline-block; 
             background-color: #2563EB; 
             color: white; 
             padding: 12px 24px; 
             text-decoration: none; 
             border-radius: 5px; 
             font-weight: bold;
             margin-top: 10px;
          ">
            👉 Bấm để kích hoạt
          </a>
          
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            Nếu không phải bạn, vui lòng bỏ qua email này.
          </p>
        </div>
      `
    });

    console.log("✅ Email đã gửi thành công ID:");
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
  }
};