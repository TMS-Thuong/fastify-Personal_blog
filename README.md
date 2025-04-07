# Hướng dẫn chạy Fastify Blog với Docker

## 1. Tạo file `.env` ở thư mục gốc (nếu chưa có)

# .env (ví dụ)

DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_NAME=blog_personal

DATABASE_URL="postgresql://<your_db_user>:<your_db_password>@postgres_blog:5432/blog_personal?schema=public"

PORT=3000
JWT_SECRET=<your_jwt_secret>
GMAIL_USERNAME=<your_email>
GMAIL_PASSWORD=<your_gmail_password>

---

## 2. Build Docker Image

docker build -t tmsthuong/fastify_blog_app:v1 .

---

## 3. Khởi động container bằng Docker Compose

# Build và chạy lại toàn bộ container

docker compose up --build

# Hoặc chạy container ở chế độ nền (không rebuild)

docker compose up -d

---

## 4. Chạy Prisma trong container (sau khi container đã chạy)

# Generate Prisma Client

docker exec -it fastify_blog npx prisma generate

# Deploy migration lên DB

docker exec -it fastify_blog npx prisma migrate deploy

# Gợi ý: Nếu DB chưa sẵn sàng, hãy đợi vài giây rồi chạy lại lệnh trên

---

## 5. Một số lệnh Docker Compose hữu ích

# Xem log realtime

docker compose logs -f

# Dừng container (giữ data)

docker compose down

# Dừng và xóa toàn bộ (container, network, volume)

docker compose down -v

# Khởi động lại container (không rebuild)

docker compose restart
