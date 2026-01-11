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

