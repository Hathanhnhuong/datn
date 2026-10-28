## API Diagnosis

POST /api/diagnosis/upload
Upload ảnh da liễu bằng `multipart/form-data` (field `file`) và nhận kết quả chẩn đoán.

Response:
- predicted_class
- confidence
- skin_score
- input_warning (nullable)

POST /api/diagnosis/capture
Gửi ảnh camera dạng base64 qua JSON.

Request body:
- image_base64: `data:image/jpeg;base64,...` hoặc raw base64
- filename: optional
