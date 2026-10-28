import os
import joblib
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PredictEtaRequest, PredictEtaResponse

model = None
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "eta_predictor.joblib")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print(f"✅ Đã tải thành công AI Model từ: {MODEL_PATH}")
        except Exception as e:
            print(f"⚠️ Lỗi khi tải model: {e}")
            model = None
    else:
        print(f"ℹ️ Chưa tìm thấy model tại {MODEL_PATH}. Vui lòng chạy 'python models/train_eta_model.py' để train model.")
    yield

app = FastAPI(
    title="Logistics Backhaul Optimizer - AI Service",
    description="Dịch vụ AI dự đoán thời gian di chuyển thực tế (ETA), phân tích kẹt xe và cảnh báo cấm tải nội đô",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "Logistics AI Service",
        "model_loaded": model is not None
    }

@app.post("/predict-eta", response_model=PredictEtaResponse)
def predict_eta(req: PredictEtaRequest):
    # Tự động tính toán các trường logic phụ nếu client chưa truyền
    load_ratio = round(req.actual_weight_kg / max(1.0, float(req.vehicle_max_weight_kg)), 2)
    is_weekend = 1 if req.day_of_week in [5, 6] else (req.is_weekend or 0)
    is_rush_hour = 1 if req.departure_hour in [7, 8, 17, 18] else (req.is_rush_hour or 0)
    is_night_time = 1 if (req.departure_hour >= 22 or req.departure_hour <= 5) else (req.is_night_time or 0)

    # 1. Kiểm tra nguy cơ cấm tải nội đô (Xe tải > 2.5T vào nội đô vào ban ngày)
    is_truck_ban_risk = bool(req.is_urban_dest and req.vehicle_max_weight_kg > 2500 and not is_night_time)

    # 2. Dự đoán qua Model AI (nếu đã train) hoặc Fallback Heuristic
    if model is not None:
        input_df = pd.DataFrame([{
            "is_urban_dest": req.is_urban_dest,
            "osrm_dist_km": req.osrm_dist_km,
            "osrm_duration_min": req.osrm_duration_min,
            "departure_hour": req.departure_hour,
            "day_of_week": req.day_of_week,
            "is_weekend": is_weekend,
            "is_rush_hour": is_rush_hour,
            "is_night_time": is_night_time,
            "truck_type": req.truck_type,
            "vehicle_max_weight_kg": req.vehicle_max_weight_kg,
            "actual_weight_kg": req.actual_weight_kg,
            "load_ratio": load_ratio,
            "weather": req.weather,
            "rain_mm": req.rain_mm or 0.0,
            "stops_count": req.stops_count or 2,
            "is_backhaul": req.is_backhaul or 0,
        }])

        try:
            pred = float(model.predict(input_df)[0])
            predicted_duration = round(max(req.osrm_duration_min, pred), 1)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi dự đoán từ model: {str(e)}")
    else:
        # Heuristic fallback nếu chưa train model
        mult = 1.0
        if is_rush_hour:
            mult += 0.35 if req.is_urban_dest else 0.15
        if req.weather == "RAIN_HEAVY":
            mult += 0.25
        elif req.weather == "RAIN_LIGHT":
            mult += 0.08
        if load_ratio > 0.8:
            mult += 0.10
        service_time = (req.stops_count or 2) * 25.0
        predicted_duration = round(req.osrm_duration_min * mult + service_time, 1)

    traffic_delay = max(0.0, round(predicted_duration - req.osrm_duration_min, 1))
    traffic_multiplier = round(predicted_duration / max(1.0, req.osrm_duration_min), 2)

    expected_baseline = req.osrm_duration_min + (req.stops_count or 2) * 25.0
    is_delayed = bool(predicted_duration > expected_baseline * 1.25)

    # Lời khuyên tối ưu lịch trình
    if is_truck_ban_risk:
        advice = "Cảnh báo: Điểm giao nằm trong nội đô cấm xe tải nặng ban ngày. Khuyến nghị dỡ hàng tại Bãi xe cửa ngõ (Depot) hoặc chuyển giờ giao sau 22:00!"
    elif is_delayed and is_rush_hour:
        advice = f"Dự báo kẹt xe giờ cao điểm (chậm hơn {traffic_delay} phút). Khuyến nghị lùi giờ xuất phát để xe chạy thông thoáng."
    else:
        advice = "Lịch trình tối ưu, điều kiện giao thông và thời tiết thuận lợi."

    return PredictEtaResponse(
        osrm_duration_min=req.osrm_duration_min,
        predicted_duration_min=predicted_duration,
        traffic_delay_min=traffic_delay,
        traffic_multiplier=traffic_multiplier,
        is_delayed=is_delayed,
        is_truck_ban_risk=is_truck_ban_risk,
        advice=advice
    )
