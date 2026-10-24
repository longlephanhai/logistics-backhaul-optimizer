export enum VehicleType {
  CLOSED_BOX = 'CLOSED_BOX',       // Thùng kín 
  TARPAULIN = 'TARPAULIN',         // Thùng mui bạt 
  REFRIGERATED = 'REFRIGERATED',   // Thùng lạnh / đông mát
  FLATBED = 'FLATBED',             // Sàn phẳng 
}


export enum VehicleStatus {
  IDLE = 'IDLE',                   // Xe đang rảnh, sẵn sàng nhận ghép đơn
  IN_TRANSIT = 'IN_TRANSIT',       // Xe đang chạy trên đường
  MAINTENANCE = 'MAINTENANCE',     // Xe đang bảo dưỡng / sửa chữa
}
