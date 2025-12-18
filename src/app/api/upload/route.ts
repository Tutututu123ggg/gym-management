// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file unique để tránh trùng lặp (dùng timestamp)
    const filename = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
    
    // Lưu vào thư mục public/uploads
    // Đảm bảo bạn đã tạo thư mục 'public/uploads' ở gốc dự án
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);
    
    // Trả về đường dẫn ảnh để lưu vào DB
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" });
  }
}