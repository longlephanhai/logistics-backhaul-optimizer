<div align="center">

# 🚛 Logistics Backhaul Optimizer
### Hệ Thống Ghép Chuyến & Tối Ưu Tuyến Đường Giảm Xe Chạy Rỗng (Middle-mile Logistics)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<p align="center">
  <b>Nền tảng tối ưu hóa chặng giữa (Middle-mile / Point-to-Point), giải quyết bài toán xe chạy rỗng lượt về (Empty Miles) trên các hành lang vận tải đường bộ Việt Nam.</b>
</p>

---

</div>

## 📖 1. Giới Thiệu & Bài Toán Thực Tế

Trong ngành logistics đường bộ liên tỉnh tại Việt Nam, **tỷ lệ xe chạy rỗng lượt về (*empty miles*) hiện chiếm từ 30% – 40%**, gây lãng phí hàng ngàn tỷ đồng chi phí nhiên liệu, tăng hao mòn phương tiện và phát thải lượng lớn khí nhà kính ($CO_2$). Nguyên nhân cốt lõi là sự thiếu hụt kết nối thời gian thực giữa chủ xe có xe rảnh/thừa tải trọng và các chủ hàng có nhu cầu gửi hàng dọc tuyến.

**Logistics Backhaul Optimizer** được xây dựng nhằm:
* 🎯 **Tối ưu chi phí ròng (Net Cost Minimization)**: Tự động ghép đơn hàng phát sinh dọc hành lang vận tải (ví dụ QL1A) vào các chuyến xe đang chạy hoặc xe rảnh lượt về.
* 📦 **Đơn giản hóa thể tích & tải trọng động**: Áp dụng hệ số an toàn $\alpha = 0.85$ và quy tắc xếp dỡ LIFO (Last In First Out).
* ⏱️ **Mô hình ETA thực tế**: Kết hợp công cụ định tuyến OSRM, hệ số ùn tắc giờ cao điểm và dữ liệu thời tiết thời gian thực (OpenWeatherMap).
* ⚖️ **Mô hình AHP (Analytic Hierarchy Process)**: Đánh giá và xếp hạng độ phù hợp của dàn phương tiện theo 4 tiêu chí (Chi phí, Độ lệch tuyến, Độ uy tín, Phát thải).
* 🌿 **ESG & Green Logistics**: Định lượng $CO_2$ tiết kiệm được theo chuẩn ISO 14083 / GLEC và quy đổi ra số cây xanh tương ứng.
* 🤖 **Autonomous AI Agents (MCP Protocol)**: Mô hình hóa các tác nhân tự trị (Order Agent & Vehicle Agent) tự tìm kiếm, đàm phán cước và chốt chuyến qua Model Context Protocol.

---

## 🏗️ 2. Kiến Trúc Dự Án (Monorepo Layout)

Dự án được cấu trúc theo dạng đa ứng dụng (Monorepo) trong thư mục `apps/`:

```bash
logistics-backhaul-optimizer/apps/
├── backend/                       # NestJS RESTful API & Realtime Server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/              # Xác thực người dùng, JWT & Refresh Token Cookie
│   │   │   ├── users/             # Quản lý tài khoản, gán quyền
│   │   │   ├── roles/             # Quản lý vai trò (Role Deck)
│   │   │   ├── permissions/       # Quản lý định nghĩa phân quyền (RBAC Matrix)
│   │   │   ├── depots/            # Quản lý Bãi xe & GeoJSON 2dsphere indexing
│   │   │   ├── vehicles/          # Quản lý Dàn xe (Tải trọng, thể tích, định mức xăng)
│   │   │   └── databases/         # Database Seeder (Tạo tài khoản & quyền mặc định)
│   │   ├── core/                  # Interceptors, Filters, Guards, Decorators
│   │   └── main.ts                # Bootstrap & Global Pipes
│   └── package.json
│
├── admin-dashboard/               # Web Quản trị Trung tâm (Vite + React 19 + Tailwind v4)
│   ├── src/
│   │   ├── components/            # UI Components (Sidebar, Header, Modals, Tables, Badges)
│   │   ├── pages/                 # Auth, Dashboard, Depots, Vehicles, Users, Roles, Permissions
│   │   ├── services/              # API Client (Axios Interceptors, Auto Refresh Token)
│   │   ├── store/                 # Redux Toolkit State Management
│   │   └── types/                 # TypeScript Data Models & DTOs
│   └── vite.config.ts             # Dev proxy đến http://localhost:8080
│
└── README.md                      # Tài liệu dự án
```

---

## ⚡ 3. Công Nghệ Sử Dụng (Tech Stack)

### Backend Services
| Thành phần | Công nghệ | Chi tiết sử dụng |
| :--- | :--- | :--- |
| **Framework** | NestJS 12 (TypeScript) | Kiến trúc Module hóa, Dependency Injection, Guards, Interceptors |
| **Database** | MongoDB (Mongoose 9) | Quản lý dữ liệu NoSQL, chỉ mục **`2dsphere`** tối ưu truy vấn vị trí |
| **Security** | Passport JWT, BcryptJS | Xác thực 2 lớp: Access Token (Header) + Refresh Token (HttpOnly Cookie) |
| **Query Engine** | `api-query-params` | Hỗ trợ phân trang, lọc nâng cao, Regex tìm kiếm và sorting linh hoạt |
| **Routing / Engine** | OSRM API / OpenWeather | Tính toán cự ly, thời gian lý thuyết, điều chỉnh hệ số thời tiết |

### Admin Dashboard Frontend
| Thành phần | Công nghệ | Chi tiết sử dụng |
| :--- | :--- | :--- |
| **Core Framework** | React 19 + Vite 8 | Tốc độ bundle siêu nhanh, kiến trúc Hook và Functional Components hiện đại |
| **Styling** | Tailwind CSS v4 | Thiết kế giao diện hiện đại, Dark/Glassmorphic accents, responsive đa màn hình |
| **State Management** | Redux Toolkit | Quản lý toàn vẹn trạng thái Auth, User profile, Global UI |
| **Icons** | Lucide React | Bộ icon hiện đại, tối giản cho các chỉ số logistics và trạng thái |
| **Routing** | React Router DOM v7 | Dynamic Protected Routes, RBAC Guard phân quyền theo Role/Permission |

---

## ✨ 4. Tính Năng Đã Triển Khai (Current Features)

### 🔐 1. Quản Trị Hệ Thống & Phân Quyền (RBAC Engine)
* **Xác thực toàn diện:** Đăng nhập, tự động gia hạn token (Refresh Token Rotation), bảo mật qua HTTP-Only Cookie.
* **Ma trận phân quyền (RBAC Matrix):** Quản lý chi tiết từng API Endpoint theo Phương thức HTTP (`GET`, `POST`, `PATCH`, `DELETE`) và Module.
* **Role Deck:** Khai báo và gán vai trò linh hoạt (Admin, Carrier Manager, Shipper, Driver, Operator).
* **Quản lý người dùng:** Quản lý tài khoản, trạng thái kích hoạt, liên kết Role và phân định định danh rõ ràng.

### 🏢 2. Quản Trị Danh Mục Bãi Xe (Depot Master Data)
* **Khai báo bãi đỗ / điểm tập kết:** Quản lý tên bãi xe, địa chỉ chi tiết, sức chứa phương tiện tối đa.
* **Tích hợp Tọa độ Không gian Địa lý (GeoJSON):** Lưu trữ dạng Point `[kinh độ, vĩ độ]` với chỉ mục `2dsphere` phục vụ thuật toán tìm kiếm bán kính gần nhất.
* **Bộ lọc & Quản lý trạng thái:** Lọc theo trạng thái `ACTIVE` / `INACTIVE`, tìm kiếm thời gian thực.
* **Modal CRUD hoàn chỉnh:** Tạo mới, chỉnh sửa, xem chi tiết và xóa bãi xe an toàn.

### 🚚 3. Quản Trị Dàn Xe Không Đồng Nhất (Heterogeneous Fleet)
* **Thông số kỹ thuật đầy đủ:** Biển số, loại thùng (`Thùng kín`, `Mui bạt`, `Thùng lạnh`), tải trọng tối đa ($kg$), thể tích thùng ($m^3$).
* **Định mức tiêu hao nhiên liệu:** Khai báo định mức khi chạy rỗng ($L/100km$) và khi đầy tải ($L/100km$) phục vụ đo lường lượng phát thải $CO_2$.
* **Trạng thái phương tiện:** Quản lý theo vòng đời hoạt động (`IDLE` - Rảnh, `IN_TRANSIT` - Đang chạy, `MAINTENANCE` - Bảo dưỡng).
* **Gán Bãi Xe:** Liên kết xe với Bãi xe trực thuộc hoặc định vị xe ngoài hành lang vận tải.

---

## 🚀 5. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### Yêu Cầu Môi Trường
* **Node.js**: Phiên bản `>= 18.x` (khuyến nghị Node 20 LTS trở lên)
* **npm** hoặc **pnpm / yarn**
* **MongoDB**: Cụm MongoDB Atlas hoặc MongoDB chạy local (hỗ trợ GeoJSON `2dsphere`)

---

### Bước 1: Khởi động Backend (NestJS)

1. Di chuyển vào thư mục backend:
   ```bash
   cd apps/backend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình file biến môi trường `.env`:
   ```env
   PORT=8080
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/logistics
   
   JWT_ACCESS_TOKEN_SECRET=YOUR_ACCESS_SECRET_KEY
   JWT_ACCESS_EXPIRE=86400
   
   JWT_REFRESH_TOKEN_SECRET=YOUR_REFRESH_SECRET_KEY
   JWT_REFRESH_EXPIRE=604800
   
   # Tự động khởi tạo dữ liệu mẫu (Roles, Permissions, Tài khoản Admin mặc định)
   SHOULD_INIT=true
   INIT_PASSWORD=123456
   ```
4. Khởi chạy server ở chế độ Development:
   ```bash
   npm run start:dev
   ```
   * Server API sẽ lắng nghe tại: `http://localhost:8080`
   * Tài khoản quản trị mặc định (khi `SHOULD_INIT=true`): `admin@gmail.com` / `123456`

---

### Bước 2: Khởi động Admin Dashboard (React + Vite)

1. Mở cửa sổ Terminal mới và di chuyển vào thư mục dashboard:
   ```bash
   cd apps/admin-dashboard
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ phát triển Vite:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện quản trị tại: `http://localhost:5173`

> **Lưu ý cấu hình Proxy:** Vite đã được thiết lập tự động chuyển tiếp các request dạng `/api/*` về `http://localhost:8080` mà không gặp lỗi CORS.

---

## 📡 6. Bảng Tra Cứu API Endpoints Chính

| Module | Phương thức | Endpoint | Mô tả |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống & thiết lập Refresh Cookie |
| | `GET` | `/api/v1/auth/account` | Lấy thông tin tài khoản đang đăng nhập |
| | `POST` | `/api/v1/auth/refresh` | Cấp mới Access Token từ Refresh Token |
| | `POST` | `/api/v1/auth/logout` | Đăng xuất & xóa Cookie |
| **Depots** | `GET` | `/api/v1/depots` | Danh sách bãi xe (phân trang, tìm kiếm) |
| | `POST` | `/api/v1/depots` | Tạo mới bãi xe (kèm GeoJSON Point) |
| | `GET` | `/api/v1/depots/:id` | Xem chi tiết bãi xe |
| | `PATCH` | `/api/v1/depots/:id` | Cập nhật thông tin bãi xe |
| | `DELETE` | `/api/v1/depots/:id` | Xóa bãi xe |
| **Vehicles** | `GET` | `/api/v1/vehicles` | Danh sách dàn xe (lọc theo loại thùng, trạng thái, bãi) |
| | `POST` | `/api/v1/vehicles` | Đăng ký phương tiện mới |
| | `GET` | `/api/v1/vehicles/:id` | Xem chi tiết phương tiện |
| | `PATCH` | `/api/v1/vehicles/:id` | Cập nhật thông số phương tiện |
| | `DELETE` | `/api/v1/vehicles/:id` | Xóa phương tiện |
| **RBAC** | `GET` | `/api/v1/roles` / `/api/v1/permissions` | Truy vấn danh mục Roles & Permissions |

---

## 🗺️ 7. Lộ Trình Phát Triển (Product Roadmap)

- [x] **Giai đoạn 1: Nền tảng Master Data & Phân Quyền (Hoàn thành)**
  - Kiến trúc Backend NestJS, Database MongoDB & Caching.
  - Phân quyền RBAC Matrix, quản lý Users, Roles, Permissions.
  - Quản lý Bãi xe (Depots) & Dàn xe không đồng nhất (Vehicles).
- [ ] **Giai đoạn 2: Engine Tối Ưu Ghép Chuyến & Định Tuyến (Đang phát triển)**
  - Tích hợp OSRM Routing Engine tính toán ma trận cự ly & thời gian thực.
  - Bộ 6 điều kiện ràng buộc khả thi (Feasibility Checks) & Thuật toán giảm chi phí ròng.
  - Xếp hạng phương tiện theo mô hình AHP 4 tiêu chí.
- [ ] **Giai đoạn 3: Telematics & Giám Sát Thời Gian Thực**
  - Cổng kết nối Socket.io Gateway nhận tọa độ GPS xe tải liên tục 3–5 giây.
  - Bản đồ Macro View cho Điều độ viên và Micro View cho Tài xế.
  - e-POD (Xác thực giao nhận điện tử qua mã OTP & hình ảnh).
- [ ] **Giai đoạn 4: Báo Cáo Carbon ESG & AI Agent (MCP Protocol)**
  - Bảng đồng hồ phát thải khí nhà kính $CO_2$ theo tiêu chuẩn ISO 14083.
  - Diễn họa tiến trình đàm phán cước tự trị qua **MCP Live Console Log**.

---

## 👥 8. Tác Giả & Bản Quyền

* **Đề tài:** Nghiên cứu phát triển hệ thống hỗ trợ ghép chuyến, lựa chọn và đánh giá phương tiện vận tải nhằm giảm hiện tượng xe chạy rỗng trong logistics đường bộ tại Việt Nam.
* **Người thực hiện:** Long Lê Phan Hải ([@longlephanhai](https://github.com/longlephanhai))
* **Mã nguồn:** Dự án phục vụ mục đích nghiên cứu học thuật và phát triển giải pháp tối ưu hóa logistics xanh.

<div align="center">
  <sub>Được xây dựng với niềm đam mê nâng cao hiệu quả Logistics Xanh tại Việt Nam 🇻🇳</sub>
</div>
