# 🤖 AI Service - Logistics Backhaul Optimizer

> **Dịch vụ Trí tuệ nhân tạo (AI & Machine Learning)** phục vụ dự đoán thời gian di chuyển thực tế (ETA), ước tính mức độ kẹt xe giờ cao điểm, cảnh báo cấm tải nội đô và hỗ trợ định giá cước động trong hệ thống logistics đường bộ Việt Nam.

---

## 🎯 1. Vai Trò Của AI Service

1. **Dự báo thời gian thực tế (ETA Prediction):**
   * Kết hợp dữ liệu định tuyến OSRM với các yếu tố thời gian thực: giờ cao điểm (`rush_hour`), khung giờ đêm (`night_time`), điều kiện thời tiết (mưa/sương mù từ OpenWeather) và tải trọng thực tế của xe (`load_ratio`).
   * Sử dụng mô hình Machine Learning **XGBoost / Gradient Boosting Regressor** để dự báo thời gian chính xác thay vì dùng công thức cộng trừ cố định.
2. **Cảnh báo kẹt xe & Nguy cơ cấm tải:**
   * Dự đoán nguy cơ trễ hẹn (`is_delayed`) và nguy cơ vi phạm giờ cấm tải nội đô (`is_truck_ban_violated`).
3. **Cung cấp REST API nhanh cho NestJS Backend:**
   * Dựng bằng **FastAPI (Python)**, phản hồi dự đoán trong vòng dưới **$5\text{ ms}$**.

---

## 📁 2. Cấu Trúc Thư Mục

```bash
ai-service/
├── dataset/
│   └── generate_dataset.py      # Script sinh dữ liệu mô phỏng dựa trên Depots & Quốc lộ VN
├── models/
│   └── train_eta_model.py       # Script huấn luyện mô hình XGBoost và lưu file model (.joblib)
├── src/
│   ├── schemas.py               # Pydantic validation cho dữ liệu Request / Response
│   └── main.py                  # FastAPI server cung cấp endpoint POST /predict-eta
├── requirements.txt             # Danh sách thư viện Python cần thiết
└── README.md                    # Tài liệu hướng dẫn
```

---

## ⚡ 3. Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Bước 1: Khởi tạo Virtual Environment (khuyến nghị Python >= 3.10)
```bash
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate    # Trên Linux/macOS
# hoặc: venv\Scripts\activate trên Windows
```

### Bước 2: Cài đặt các gói phụ thuộc
```bash
pip install -r requirements.txt
```

### Bước 3: Sinh dữ liệu mẫu & Huấn luyện Model
```bash
# 1. Sinh 10.000 dòng dữ liệu mô phỏng các chuyến xe thực tế tại VN
python dataset/generate_dataset.py

# 2. Huấn luyện mô hình XGBoost và đánh giá độ chính xác (MAE, RMSE, R2 Score)
python models/train_eta_model.py
```

### Bước 4: Khởi chạy FastAPI Server
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
* API Documentation (Swagger UI): `http://localhost:8000/docs`
* Health Check: `http://localhost:8000/health`
* Dự đoán ETA: `POST http://localhost:8000/predict-eta`
