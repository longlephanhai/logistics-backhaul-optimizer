import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import GradientBoostingRegressor

def train_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "..", "dataset", "traffic_trips_dataset.csv")

    # Nếu chưa có dataset, tự động sinh dữ liệu trước
    if not os.path.exists(dataset_path):
        print("⚠️ Chưa tìm thấy dataset, đang tiến hành sinh dữ liệu mô phỏng...")
        from dataset.generate_dataset import generate_simulation_dataset
        generate_simulation_dataset(num_records=10000, output_path=dataset_path)

    print(f"📂 Đang tải dữ liệu từ {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # Các features đầu vào
    feature_cols = [
        "is_urban_dest",
        "osrm_dist_km",
        "osrm_duration_min",
        "departure_hour",
        "day_of_week",
        "is_weekend",
        "is_rush_hour",
        "is_night_time",
        "truck_type",
        "vehicle_max_weight_kg",
        "actual_weight_kg",
        "load_ratio",
        "weather",
        "rain_mm",
        "stops_count",
        "is_backhaul",
    ]

    target_col = "actual_duration_min"

    X = df[feature_cols]
    y = df[target_col]

    # Phân loại biến định lượng và biến phân loại
    categorical_features = ["truck_type", "weather"]
    numeric_features = [col for col in feature_cols if col not in categorical_features]

    # Tiền xử lý dữ liệu
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ]
    )

    # Thử import XGBoost, nếu chưa cài thì dùng GradientBoostingRegressor của scikit-learn
    try:
        from xgboost import XGBRegressor
        regressor = XGBRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            random_state=42,
            n_jobs=-1
        )
        model_name = "XGBoost Regressor"
    except ImportError:
        regressor = GradientBoostingRegressor(
            n_estimators=120,
            learning_rate=0.08,
            max_depth=5,
            random_state=42
        )
        model_name = "GradientBoostingRegressor (scikit-learn)"

    # Xây dựng Pipeline hoàn chỉnh
    model_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", regressor)
    ])

    # Chia tập Train / Test (80% / 20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"🚀 Bắt đầu huấn luyện mô hình: {model_name}...")
    model_pipeline.fit(X_train, y_train)

    # Đánh giá trên tập kiểm thử Test
    y_pred = model_pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n" + "="*45)
    print("🏆 KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH AI (ETA PREDICTION)")
    print("="*45)
    print(f"• Sai số tuyệt đối trung bình (MAE) : {mae:.2f} phút")
    print(f"• Sai số căn bậc hai trung bình (RMSE): {rmse:.2f} phút")
    print(f"• Hệ số xác định (R² Score)         : {r2:.4f} (Độ chính xác > {r2*100:.1f}%)")
    print("="*45)

    # Lưu model đã train ra file
    model_output_path = os.path.join(current_dir, "eta_predictor.joblib")
    joblib.dump(model_pipeline, model_output_path)
    print(f"💾 Đã lưu mô hình huấn luyện thành công tại: {model_output_path}")

if __name__ == "__main__":
    train_model()
