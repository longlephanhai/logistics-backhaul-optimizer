import os
import math
import random
import pandas as pd
import numpy as np

# Danh sách các trung tâm logistics / Bãi xe lớn tại Việt Nam (theo CSDL Depots của dự án)
HUBS = [
    {"name": "ICD Tiên Sơn - Bắc Ninh", "lng": 105.9754, "lat": 21.1352, "is_urban": 0},
    {"name": "Cảng Đình Vũ - Hải Phòng", "lng": 106.7583, "lat": 20.8356, "is_urban": 0},
    {"name": "Kho Vành Đai 3 - Hà Nội", "lng": 105.8048, "lat": 21.0012, "is_urban": 1},
    {"name": "KCN Hòa Khánh - Đà Nẵng", "lng": 108.1524, "lat": 16.0678, "is_urban": 0},
    {"name": "Bãi xe Trung tâm - Đà Nẵng", "lng": 108.2022, "lat": 16.0544, "is_urban": 1},
    {"name": "Cảng Quy Nhơn - Bình Định", "lng": 109.2415, "lat": 13.7712, "is_urban": 0},
    {"name": "KCN Suối Dầu - Nha Trang", "lng": 109.1245, "lat": 12.1852, "is_urban": 0},
    {"name": "ICD Sóng Thần - Bình Dương", "lng": 106.7456, "lat": 10.8954, "is_urban": 0},
    {"name": "Cảng Cát Lái - TP. Hồ Chí Minh", "lng": 106.7865, "lat": 10.7654, "is_urban": 1},
    {"name": "Kho Tân Bình - TP. Hồ Chí Minh", "lng": 106.6542, "lat": 10.8012, "is_urban": 1},
    {"name": "KCN Trà Nóc - Cần Thơ", "lng": 105.7321, "lat": 10.0854, "is_urban": 0},
]

TRUCK_TYPES = ["CLOSED_BOX", "TARPAULIN", "REFRIGERATED", "FLATBED"]
WEATHER_CONDITIONS = ["CLEAR", "RAIN_LIGHT", "RAIN_HEAVY", "FOG"]

def haversine_distance(coord1, coord2):
    """Tính khoảng cách đường bộ ước tính (km) từ 2 tọa độ GPS"""
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    crow_fly = R * c
    # Nhân hệ số đường bộ Việt Nam uốn lượn ~ 1.32
    return max(5.0, crow_fly * 1.32)

def generate_simulation_dataset(num_records=10000, output_path="traffic_trips_dataset.csv"):
    np.random.seed(42)
    random.seed(42)

    data = []

    for _ in range(num_records):
        # 1. Chọn ngẫu nhiên Điểm lấy và Điểm giao khác nhau
        origin = random.choice(HUBS)
        dest = random.choice([h for h in HUBS if h["name"] != origin["name"]])

        origin_lat = origin["lat"] + np.random.uniform(-0.02, 0.02)
        origin_lng = origin["lng"] + np.random.uniform(-0.02, 0.02)
        dest_lat = dest["lat"] + np.random.uniform(-0.02, 0.02)
        dest_lng = dest["lng"] + np.random.uniform(-0.02, 0.02)

        is_urban_dest = dest["is_urban"]

        # 2. Khoảng cách & Thời gian lái lý thuyết OSRM
        dist_km = haversine_distance((origin_lng, origin_lat), (dest_lng, dest_lat))
        # Tốc độ lý thuyết trung bình xe tải trên đường: ~55 km/h
        osrm_duration_min = (dist_km / 55.0) * 60.0

        # 3. Yếu tố Thời gian
        departure_hour = random.randint(0, 23)
        day_of_week = random.randint(0, 6) # 0: Thứ 2, 6: Chủ nhật
        is_weekend = 1 if day_of_week in [5, 6] else 0

        # Giờ cao điểm: 07h-08h30 (7, 8) hoặc 17h-18h30 (17, 18)
        is_rush_hour = 1 if departure_hour in [7, 8, 17, 18] else 0
        # Giờ đêm cấm tải được dỡ bỏ: 22h - 06h
        is_night_time = 1 if (departure_hour >= 22 or departure_hour <= 5) else 0

        # 4. Yếu tố Phương tiện & Tải trọng
        truck_type = random.choice(TRUCK_TYPES)
        # Các phân khúc xe tải phổ biến: 1.5T, 3.5T, 8T, 15T
        vehicle_max_weight_kg = random.choice([1500, 3500, 8000, 15000])
        # Tải trọng thực tế chở: 30% đến 95% tải tối đa
        load_ratio = round(random.uniform(0.35, 0.95), 2)
        actual_weight_kg = round(vehicle_max_weight_kg * load_ratio)

        # 5. Yếu tố Thời tiết
        weather = np.random.choice(WEATHER_CONDITIONS, p=[0.70, 0.18, 0.08, 0.04])
        rain_mm = 0.0
        if weather == "RAIN_LIGHT":
            rain_mm = round(random.uniform(2.0, 10.0), 1)
        elif weather == "RAIN_HEAVY":
            rain_mm = round(random.uniform(25.0, 75.0), 1)

        # 6. Nghiệp vụ Logistics: Số điểm dừng dọc đường (Ghép đơn)
        stops_count = random.choice([2, 2, 2, 3, 3, 4]) # 2 điểm: Lấy - Giao đơn; 3-4: Ghép thêm đơn
        is_backhaul = random.choice([0, 1])

        # ==========================================
        # TÍNH TOÁN THỜI GIAN THỰC TẾ (GROUND TRUTH)
        # ==========================================
        traffic_multiplier = 1.0

        # Kẹt xe giờ cao điểm
        if is_rush_hour:
            traffic_multiplier += 0.35 if is_urban_dest else 0.15

        # Cuối tuần kẹt cửa ngõ thành phố
        if is_weekend and is_urban_dest:
            traffic_multiplier += 0.15

        # Thời tiết xấu làm giảm tốc độ xe
        if weather == "RAIN_HEAVY":
            traffic_multiplier += 0.25
        elif weather == "RAIN_LIGHT":
            traffic_multiplier += 0.08
        elif weather == "FOG":
            traffic_multiplier += 0.20

        # Tải trọng nặng làm chậm tốc độ leo dốc và phanh (load_ratio > 0.8)
        if load_ratio > 0.80:
            traffic_multiplier += 0.10

        # Thùng đông lạnh cồng kềnh chạy cẩn trọng hơn
        if truck_type == "REFRIGERATED":
            traffic_multiplier += 0.05

        # Nhiễu ngẫu nhiên thực tế ngoài đường (-5% đến +10%)
        random_noise = random.uniform(0.95, 1.10)
        traffic_multiplier *= random_noise

        # Thời gian bốc dỡ/thủ tục kho tại mỗi điểm dừng (~25 phút/điểm)
        service_time_min = stops_count * random.uniform(20.0, 35.0)

        # Thời gian thực tế hoàn thành
        actual_duration_min = round(osrm_duration_min * traffic_multiplier + service_time_min, 1)

        # Cảnh báo trễ hạn (Nếu chạy thực tế vượt quá 30% so với lý thuyết + chuẩn dịch vụ)
        expected_standard = osrm_duration_min + stops_count * 25.0
        is_delayed = 1 if (actual_duration_min > expected_standard * 1.25) else 0

        # Nguy cơ cấm tải nội đô (Xe tải > 2.5T vào nội đô vào ban ngày)
        is_truck_ban_risk = 1 if (is_urban_dest and vehicle_max_weight_kg > 2500 and not is_night_time) else 0

        data.append({
            "origin_lat": round(origin_lat, 4),
            "origin_lng": round(origin_lng, 4),
            "dest_lat": round(dest_lat, 4),
            "dest_lng": round(dest_lng, 4),
            "is_urban_dest": is_urban_dest,
            "osrm_dist_km": round(dist_km, 2),
            "osrm_duration_min": round(osrm_duration_min, 1),
            "departure_hour": departure_hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "is_rush_hour": is_rush_hour,
            "is_night_time": is_night_time,
            "truck_type": truck_type,
            "vehicle_max_weight_kg": vehicle_max_weight_kg,
            "actual_weight_kg": actual_weight_kg,
            "load_ratio": load_ratio,
            "weather": weather,
            "rain_mm": rain_mm,
            "stops_count": stops_count,
            "is_backhaul": is_backhaul,
            # Target labels:
            "actual_duration_min": actual_duration_min,
            "is_delayed": is_delayed,
            "is_truck_ban_risk": is_truck_ban_risk,
        })

    df = pd.DataFrame(data)
    
    # Tạo thư mục nếu chưa tồn tại
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✅ Đã tạo thành công dataset {len(df)} dòng tại: {output_path}")
    print(f"📊 Mẫu 3 dòng dữ liệu đầu tiên:")
    print(df[["osrm_dist_km", "departure_hour", "is_rush_hour", "weather", "actual_duration_min"]].head(3))

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "traffic_trips_dataset.csv")
    generate_simulation_dataset(num_records=10000, output_path=file_path)
