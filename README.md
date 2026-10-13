# Gym Management Web Platform

Ứng dụng web full-stack hỗ trợ quản lý hoạt động phòng gym, hội viên, gói tập, lịch lớp và đặt chỗ.



## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions
- **Authentication & Authorization:** NextAuth.js, Role-Based Access Control (RBAC)
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Database Hosting:** Neon

## Chức năng chính

- Quản lý tài khoản và phân quyền theo vai trò.
- Quản lý hồ sơ hội viên và gói tập.
- Quản lý lịch lớp và quy trình đặt chỗ.
- Hỗ trợ các nghiệp vụ quản trị qua giao diện web.

## Cấu trúc source code

```text
├── prisma/              # Schema, migrations và seed data
└── src/
    ├── app/             # Routes, pages và layouts (Next.js App Router)
    ├── components/      # UI components tái sử dụng
    ├── actions/         # Next.js Server Actions
    ├── services/        # Xử lý nghiệp vụ
    ├── repositories/    # Truy cập dữ liệu qua Prisma
    ├── lib/             # Utilities và cấu hình dùng chung
    └── types/           # TypeScript types và interfaces
```

## Kiến trúc

Mã nguồn được tổ chức theo trách nhiệm, tách biệt giao diện, xử lý nghiệp vụ và truy cập dữ liệu:

**UI → Server Actions → Services → Repositories → PostgreSQL**

**Demo:** [Truy cập ứng dụng](https://gym-management-git-main-tutututu123gggs-projects.vercel.app/)

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@gym.test` | `123456` |
| User | `user@gym.test` | `123456` |

> Đây là tài khoản demo để trải nghiệm ứng dụng. Chỉ giữ thông tin đăng nhập này công khai nếu tài khoản và dữ liệu trên deployment là dữ liệu thử nghiệm, không chứa thông tin thật hoặc bí mật.
