# 🚀 E-Commerce Microservices Platform

Aplikasi e-commerce modern berbasis **microservices architecture** dan menggunakan **Docker**, dan **monitoring terintegrasi**.

---

## 📋 Daftar Isi

- [Overview](#overview)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Services](#services)
- [Database](#database)
- [Monitoring](#monitoring)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

Platform e-commerce ini dibangun dengan arsitektur microservices yang scalable, maintainable, dan production-ready. Setiap service berjalan secara independen dalam container Docker dan di-orchestrate menggunakan Docker Compose.

### Keunggulan Arsitektur:
- ✅ **Scalability** - Setiap service bisa di-scale secara terpisah
- ✅ **Flexibility** - Tech stack berbeda per service
- ✅ **Resilience** - Failure di satu service tidak mengganggu yang lain
- ✅ **Monitoring** - Built-in observability dengan Prometheus & Grafana
- ✅ **Message Queue** - RabbitMQ untuk asynchronous communication
- ✅ **API Gateway** - Traefik untuk routing

---

## 🛠️ Teknologi

### Backend
- **Runtime**: Node.js + Express.js
- **Databases**: PostgreSQL, MySQL
- **Cache/Messaging**: Redis, RabbitMQ
- **API Gateway**: Traefik
- **Real-time**: WebSocket

### DevOps & Monitoring
- **Containerization**: Docker & Docker Compose
- **Monitoring**: Prometheus
- **Visualization**: Grafana
- **System Metrics**: Node Exporter
- **Object Storage**: MinIO

### Development
- **Build Tool**: Vite (Frontend)
- **Package Manager**: npm/yarn
- **Version Control**: Git

---

## 📁 Struktur Project

```
ecommerce-microservice/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── services/                        # Microservices
│   ├── auth-service/               # Autentikasi & JWT
│   ├── user-service/               # User Management
│   ├── product-service/            # Product Catalog
│   ├── order-service/              # Order Management
│   ├── notification-service/       # Real-time Notifications
│   └── email-service/              # Email Processing
│
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml          # Prometheus Configuration
│
├── postgres-init/
│   └── init.sql                    # PostgreSQL Initialization
│
├── mysql-init/
│   └── init.sql                    # MySQL Initialization
│
├── traefik/
│   └── traefik.yml                 # Traefik Configuration
│
└── docker-compose.yml              # Docker Compose Orchestration
```

---

## 📦 Prerequisites

Pastikan system Anda memiliki:

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 16 (untuk development lokal)
- **Git**
- **RAM minimal** 8GB (recommended 16GB)
- **Disk Space** minimal 20GB

### Cek Versi:
```bash
docker --version
docker-compose --version
node --version
```

---

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourrepo/ecommerce-microservice.git
cd ecommerce-microservice
```

### 2. Build Services
```bash
# Build semua services
docker-compose build

# Atau build service spesifik
docker-compose build auth-service
```

### 3. Verifikasi Docker Images
```bash
docker images | grep ecommerce
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root directory:

```env
# PORT CONFIGURATION
PORT=3000
WS_PORT=8083

# DATABASE POSTGRES
DB_HOST=postgres
DB_USER=user
DB_PASSWORD=password
DB_NAME=ecommerce_pg
DB_PORT=5432

# DATABASE MYSQL
MYSQL_HOST=mysql
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_DATABASE=ecommerce_mysql
MYSQL_PORT=3306

# REDIS
REDIS_URL=redis://redis:6379

# RABBITMQ
RABBITMQ_URL=amqp://user:password@rabbitmq:5672
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=user
RABBITMQ_PASSWORD=password

# JWT
JWT_SECRET=supersecretkey
JWT_EXPIRE=24h

# MINIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=minio:9000

# EMAIL SERVICE
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# API BASE URL
API_BASE_URL=http://localhost:8090
VITE_API_URL=http://localhost:8090

# NODE ENVIRONMENT
NODE_ENV=development
```

⚠️ **Jangan commit .env ke repository!**

---

## ▶️ Menjalankan Aplikasi

### Start All Services
```bash
# Start semua services (detached mode)
docker-compose up -d

# Start dengan log visible
docker-compose up

# Start service spesifik
docker-compose up -d auth-service postgres
```

### Stop Services
```bash
# Stop semua services
docker-compose down

# Stop dan hapus volumes
docker-compose down -v

# Stop service spesifik
docker-compose stop auth-service
```

### View Logs
```bash
# Lihat semua logs
docker-compose logs -f

# Lihat logs service spesifik
docker-compose logs -f auth-service

# Lihat logs N baris terakhir
docker-compose logs -f --tail=100 auth-service
```

### Health Check
```bash
# Cek status semua services
docker-compose ps

# Cek service health
curl http://localhost:8090/api/auth/health
curl http://localhost:8090/api/products/health
curl http://localhost:8090/api/orders/health
```

---

## 🏗️ Arsitektur Sistem

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│                 http://localhost:5173                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           TRAEFIK (API Gateway & Load Balancer)             │
│                  http://localhost:8090                       │
│              Dashboard: http://localhost:8080                │
└──────┬─────┬──────────┬──────────┬──────────┬──────────────┘
       │     │          │          │          │
       ▼     ▼          ▼          ▼          ▼
    ┌─────────────────────────────────────────────┐
    │          MICROSERVICES (Port 3000-3005)    │
    ├─────────────────────────────────────────────┤
    │ • Auth Service      (3000) - JWT & Sessions│
    │ • Product Service   (3001) - Product Catalog
    │ • Order Service     (3002) - Order Mgmt    │
    │ • User Service      (3003) - User Mgmt     │
    │ • Notification Svc  (3004) - Real-time WS  │
    │ • Email Service     (3005) - Email Queue   │
    └──────┬──────────┬──────────┬───────────────┘
           │          │          │
    ┌──────▼──┐ ┌─────▼──┐ ┌────▼──────┐
    │ PostgreSQL MySQL  Redis  │
    │ (5432)  (3307) (6379)    │
    └─────────┴────────┴────────┘

    ┌──────────────────────────────────┐
    │    MESSAGE BROKER (RabbitMQ)    │
    │         (Port 5672)              │
    │    UI: localhost:15672          │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │    OBJECT STORAGE (MinIO)        │
    │    API: localhost:9000           │
    │    UI: localhost:9001            │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │        MONITORING STACK          │
    ├──────────────────────────────────┤
    │ • Prometheus (9090)              │
    │ • Grafana (3000)                 │
    │ • Node Exporter                  │
    └──────────────────────────────────┘
```

---

## 🔧 Services

### 1. **Auth Service** (Port 3000)
Menangani autentikasi dan autorisasi pengguna.

**Database**: MySQL
**Dependencies**: -

**Endpoints**:
```
POST   /api/auth/register        - Register user baru
POST   /api/auth/login           - Login & get JWT token
POST   /api/auth/refresh-token   - Refresh JWT token
GET    /api/auth/me              - Get user info (protected)
POST   /api/auth/logout          - Logout
GET    /api/auth/health          - Health check
```

**Fitur**:
- User registration & login
- JWT token generation
- Password hashing (bcrypt)
- Token refresh mechanism

---

### 2. **Product Service** (Port 3001)
Mengelola katalog produk dan inventory.

**Database**: PostgreSQL
**Dependencies**: -

**Endpoints**:
```
GET    /api/products             - Get semua produk (dengan pagination)
GET    /api/products/:id         - Get produk by ID
POST   /api/products             - Create produk (admin)
PUT    /api/products/:id         - Update produk (admin)
DELETE /api/products/:id         - Delete produk (admin)
PATCH  /api/products/:id/stock   - Update stock
GET    /api/products/health      - Health check
GET    /api/products/metrics     - Prometheus metrics
```

**Fitur**:
- Product catalog management
- Inventory tracking
- Pagination & filtering
- Search functionality
- Prometheus metrics

---

### 3. **Order Service** (Port 3002)
Menangani pemesanan dan order management.

**Database**: PostgreSQL
**Dependencies**: RabbitMQ, Notification Service

**Endpoints**:
```
POST   /api/orders               - Create order baru
GET    /api/orders               - Get semua orders (user)
GET    /api/orders/:id           - Get order detail
PUT    /api/orders/:id           - Update order status
DELETE /api/orders/:id           - Cancel order
GET    /api/orders/user/:userId  - Get orders by user
GET    /api/orders/health        - Health check
```

**Fitur**:
- Order creation & management
- Order status tracking
- RabbitMQ integration untuk event publishing
- Real-time notification ke user
- Order history

---

### 4. **User Service** (Port 3003)
Mengelola profil dan data user.

**Database**: MySQL
**Dependencies**: -

**Endpoints**:
```
GET    /api/users                - Get semua users (admin)
GET    /api/users/:id            - Get user profile
PUT    /api/users/:id            - Update user profile
DELETE /api/users/:id            - Delete user (admin)
GET    /api/users/:id/orders     - Get user orders
POST   /api/users/:id/address    - Add address
GET    /api/users/health         - Health check
```

**Fitur**:
- User profile management
- Address management
- User preferences
- Account settings

---

### 5. **Notification Service** (Port 3004)
Real-time notification via WebSocket.

**Database**: Redis (cache)
**Dependencies**: Redis

**WebSocket Endpoints**:
```
ws://localhost:8083/ws           - Connect to notification stream
```

**Message Types**:
```json
{
  "type": "ORDER_CREATED",
  "message": "Your order has been created",
  "orderId": "12345",
  "timestamp": "2024-01-06T10:30:00Z"
}

{
  "type": "ORDER_SHIPPED",
  "message": "Your order is on the way",
  "trackingNumber": "TRK123456"
}

{
  "type": "PAYMENT_SUCCESS",
  "message": "Payment has been processed"
}
```

**Fitur**:
- Real-time notifications via WebSocket
- Redis pub/sub for event distribution
- Prometheus metrics
- Connection management

---

### 6. **Email Service** (Port 3005)
Menangani pengiriman email via RabbitMQ queue.

**Database**: -
**Dependencies**: RabbitMQ, Gmail SMTP

**Endpoints**:
```
POST   /api/email/send            - Send email
GET    /api/email/health          - Health check
```

**Fitur**:
- Email queue processing
- SMTP integration (Gmail)
- Email templates
- Retry mechanism
- HTML & Plain text support

---

## 🗄️ Database

### PostgreSQL
**Port**: 5432
**User**: user
**Password**: password
**Database**: ecommerce_pg

**Digunakan oleh**:
- Product Service
- Order Service

**Koneksi**:
```bash
psql -h localhost -U user -d ecommerce_pg
```

### MySQL
**Port**: 3307 (mapped dari 3306)
**User**: user
**Password**: password
**Database**: ecommerce_mysql
**Root**: rootpassword

**Digunakan oleh**:
- Auth Service
- User Service

**Koneksi**:
```bash
mysql -h localhost -P 3307 -u user -p ecommerce_mysql
```

### Redis
**Port**: 6379
**Digunakan oleh**:
- Notification Service (pub/sub)
- Caching

**Koneksi**:
```bash
redis-cli -h localhost
```

---

## 📊 Monitoring

### Prometheus
**URL**: http://localhost:9090

Mengumpulkan metrics dari semua services:
```
GET /metrics (dari setiap service)
```

### Grafana
**URL**: http://localhost:3000
**Username**: admin
**Password**: admin

**Dashboard yang tersedia**:
- System metrics
- Service health
- Request rates
- Error rates
- Response times

### Node Exporter
Mengumpulkan system-level metrics (CPU, Memory, Disk, Network)

### Akses Monitoring
```bash
# Prometheus
curl http://localhost:9090/graph

# Grafana
curl http://localhost:3000

# Metrics dari service
curl http://localhost:8090/api/auth/metrics
curl http://localhost:8090/api/products/metrics
```

---

## 🔌 Message Queue (RabbitMQ)

**URL**: amqp://localhost:5672
**Management UI**: http://localhost:15672
**Username**: user
**Password**: password

### Exchanges & Queues
```
• Exchange: orders
  ├─ Queue: order.created
  ├─ Queue: order.updated
  └─ Queue: order.shipped

• Exchange: emails
  └─ Queue: email.send
```

### Publishing Event
```javascript
const amqp = require('amqplib');

const connection = await amqp.connect('amqp://user:password@rabbitmq:5672');
const channel = await connection.createChannel();

await channel.assertExchange('orders', 'topic', { durable: true });
await channel.publish('orders', 'order.created', Buffer.from(JSON.stringify({
  orderId: '123',
  userId: 'user-1'
})));
```

---

## 💾 Object Storage (MinIO)

**API URL**: http://localhost:9000
**Console URL**: http://localhost:9001
**Access Key**: minioadmin
**Secret Key**: minioadmin

### Use Cases
- Store product images
- User profile pictures
- Invoice documents

---

## 📚 API Documentation

### Base URL
```
http://localhost:8090/api
```

### Authentication
Gunakan JWT token di header:
```
Authorization: Bearer {token}
```

### Contoh Request

#### Register User
```bash
curl -X POST http://localhost:8090/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Get Products
```bash
curl http://localhost:8090/api/products?page=1&limit=10
```

#### Create Order
```bash
curl -X POST http://localhost:8090/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "items": [
      {"productId": "123", "quantity": 2},
      {"productId": "456", "quantity": 1}
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Jakarta",
      "country": "Indonesia"
    }
  }'
```

#### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8083/ws');

ws.onopen = () => {
  console.log('Connected to notification service');
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Notification:', notification);
};
```

---

## 🔍 Troubleshooting

### 1. Port Already in Use
```bash
# Find process using port
lsof -i :8090

# Kill process
kill -9 <PID>
```

### 2. Database Connection Failed
```bash
# Check database is running
docker-compose ps

# Check database logs
docker-compose logs postgres
docker-compose logs mysql

# Test connection
docker-compose exec postgres psql -U user -d ecommerce_pg -c "SELECT 1"
docker-compose exec mysql mysql -u user -p password -e "SELECT 1"
```

### 3. Service Won't Start
```bash
# Check logs
docker-compose logs -f {service-name}

# Rebuild service
docker-compose build --no-cache {service-name}

# Remove containers and volumes
docker-compose down -v
docker-compose up -d
```

### 4. Redis Connection Issues
```bash
# Check Redis
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### 5. RabbitMQ Issues
```bash
# Check RabbitMQ
docker-compose exec rabbitmq rabbitmqctl status

# View queues
docker-compose exec rabbitmq rabbitmqctl list_queues

# Clear all queues
docker-compose exec rabbitmq rabbitmqctl reset
```

### 6. Traefik Routing Issues
```bash
# Check Traefik dashboard
curl http://localhost:8080/api/http/routers

# Test routing
curl -i http://localhost:8090/api/auth/health
curl -i http://localhost:8090/api/products/health
```

### 7. WebSocket Connection Failed
```bash
# Check notification service logs
docker-compose logs -f notification-service

# Test WebSocket
wscat -c ws://localhost:8083/ws
```

---

## 📈 Performance Tuning

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_users_email ON users(email);
```

### Redis Optimization
```bash
# Set max memory policy
CONFIG SET maxmemory-policy allkeys-lru
CONFIG SET maxmemory 2gb
```

### Service Scaling
```bash
# Scale service (dalam docker-compose)
docker-compose up -d --scale product-service=3
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Gunakan `.env` file untuk secrets
   - Jangan commit `.env` ke git
   - Use strong JWT_SECRET

2. **Database Security**
   - Change default passwords
   - Use strong credentials
   - Enable SSL/TLS for production

3. **API Security**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate input data
   - Use CORS properly

4. **Service Communication**
   - Use internal network (ecommerce-net)
   - Don't expose internal services publicly
   - Implement service-to-service authentication

---

## 📝 Contributing

1. Create feature branch
   ```bash
   git checkout -b feature/feature-name
   ```

2. Commit changes
   ```bash
   git commit -m "Add feature description"
   ```

3. Push to branch
   ```bash
   git push origin feature/feature-name
   ```

4. Create Pull Request

---

## 📞 Support & Contact

- 📧 Email: support@ecommerce.local
- 💬 Slack: #ecommerce-dev
- 📋 Issues: GitHub Issues
- 📚 Wiki: Project Wiki

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 Changelog

### Version 1.0.0 (2024-01-06)
- Initial microservices setup
- Core services implementation
- Docker Compose orchestration
- Monitoring stack integration
- RabbitMQ message queue
- WebSocket real-time notifications

---

**Last Updated**: 2024-01-06  
**Maintained by**: Development Team