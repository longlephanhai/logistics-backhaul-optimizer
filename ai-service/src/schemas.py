from pydantic import BaseModel, Field
from typing import Optional

class PredictEtaRequest(BaseModel):
    origin_lat: float = Field(..., description="Vĩ độ điểm xuất phát")
    origin_lng: float = Field(..., description="Kinh độ điểm xuất phát")
    dest_lat: float = Field(..., description="Vĩ độ điểm đến")
    dest_lng: float = Field(..., description="Kinh độ điểm đến")
    
    is_urban_dest: int = Field(0, description="1 nếu điểm đến ở nội đô, 0 nếu ở ngoại thành/KCN")
    osrm_dist_km: float = Field(..., description="Quãng đường lý thuyết OSRM (km)")
    osrm_duration_min: float = Field(..., description="Thời gian lý thuyết OSRM (phút)")
    
    departure_hour: int = Field(..., ge=0, le=23, description="Giờ xuất phát (0 - 23)")
    day_of_week: int = Field(0, ge=0, le=6, description="Thứ trong tuần (0: Thứ 2, 6: Chủ Nhật)")
    is_weekend: Optional[int] = Field(0, description="1 nếu là cuối tuần")
    is_rush_hour: Optional[int] = Field(0, description="1 nếu rơi vào giờ cao điểm 7-8h30 hoặc 17-18h30")
    is_night_time: Optional[int] = Field(0, description="1 nếu đi khung giờ đêm 22h-6h sáng")
    
    truck_type: str = Field("CLOSED_BOX", description="Loại thùng: CLOSED_BOX, TARPAULIN, REFRIGERATED, FLATBED")
    vehicle_max_weight_kg: int = Field(3500, description="Tải trọng thiết kế tối đa của xe (kg)")
    actual_weight_kg: float = Field(2500.0, description="Khối lượng hàng thực tế chở (kg)")
    
    weather: Optional[str] = Field("CLEAR", description="CLEAR, RAIN_LIGHT, RAIN_HEAVY, FOG")
    rain_mm: Optional[float] = Field(0.0, description="Lượng mưa mm/h")
    stops_count: Optional[int] = Field(2, description="Số điểm dừng bốc/trả hàng")
    is_backhaul: Optional[int] = Field(0, description="1 nếu là xe chiều về ghép chuyến")

class PredictEtaResponse(BaseModel):
    osrm_duration_min: float
    predicted_duration_min: float
    traffic_delay_min: float
    traffic_multiplier: float
    is_delayed: bool
    is_truck_ban_risk: bool
    advice: str
