# Gym Management Web Platform

Ứng dụng web full-stack hỗ trợ quản lý hoạt động phòng gym, bao gồm hội viên, gói tập, lịch lớp, đặt chỗ và các nghiệp vụ quản trị.

## Công nghệ sử dụng

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions
- **Authentication:** NextAuth.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Database Hosting:** Neon
- **Validation:** Zod

## Chức năng chính

- Quản lý người dùng và phân quyền theo vai trò (RBAC).
- Quản lý hồ sơ hội viên và gói tập.
- Quản lý lịch lớp và đặt chỗ.
- Hỗ trợ các nghiệp vụ quản trị thông qua giao diện web.

## Cấu trúc dự án

```text
├── prisma/              # Database schema, migrations và seed data
├── public/              # Tài nguyên tĩnh
└── src/
    ├── app/             # Routes, pages và layouts (Next.js App Router)
    ├── components/      # Các UI component có thể tái sử dụng
    ├── actions/         # Server Actions, tiếp nhận và xử lý thao tác
    ├── services/        # Business logic và nghiệp vụ ứng dụng
    ├── repositories/    # Truy cập dữ liệu thông qua Prisma
    ├── lib/             # Tiện ích và cấu hình dùng chung
    └── types/           # TypeScript types và interfaces
```

## Tổ chức kiến trúc

Mã nguồn được chia thành các lớp theo trách nhiệm:

**UI → Server Actions → Services → Repositories → Database**

Cách tổ chức này giúp tách biệt giao diện, xử lý nghiệp vụ và truy cập dữ liệu, thuận tiện hơn cho việc phát triển và bảo trì.
