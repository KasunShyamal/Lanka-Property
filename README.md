# LankaProperty — Enterprise Real Estate Platform & Digital Auction Gateway

> Sri Lanka's next-generation property ecosystem engineered with **Next.js 15 (React 19)**, **NestJS Enterprise Backend**, **PostgreSQL 16 + PostGIS**, and **Redis 7**, fully containerized via **Docker & Compose**.

---

## 🌟 Key Features

1. **Interactive Spatial Map Discovery**:
   - High-performance Leaflet & PostGIS viewport querying with per-perch and per-sqft price badges.
   - Dynamic filtering across Colombo 07, Colombo 03, Rajagiriya, Kandy, Galle Fort, and Negombo.
2. **Real-Time Timed Digital Auctions**:
   - Sub-50ms live bidding feed powered by **WebSockets (`socket.io`)**.
   - **Confidential Reserve Protection**: Reserve prices remain strictly confidential on the server; clients only receive the boolean `reserve_met` state.
   - **Soft-Close Anti-Sniping**: Any bid placed in the final 2 minutes automatically extends the auction clock by 120 seconds.
3. **Structured In-Person Inspection Scheduling**:
   - Buyers can schedule inspection appointments in Sri Lanka Standard Time (UTC+5:30).
   - Sellers review, confirm, or decline with automated feedback and GPS directions.
4. **Property Exchange / Asset Swap Portal**:
   - Barter properties directly with cash differential balance adjustments, bypassing liquidity bottlenecks in the Sri Lankan property market.
   - Deed of Exchange legal compliance disclaimers.
5. **Operations Moderation & Compliance CMS**:
   - Administrative listing queue for title deed and coordinate verification before public publishing.
   - Auction sanctioning and broker verification badges.

---

## 🚀 Quickstart via Docker Desktop

### 1. Prerequisites
- Docker Desktop installed and running.

### 2. Launch All Services
From the repository root, execute:

```bash
docker compose up -d
```

Docker will orchestrate:
| Service | Container Name | Port Mapping | Description |
| :--- | :--- | :--- | :--- |
| **`postgres`** | `lankaproperty-postgres` | `5432:5432` | PostgreSQL 16 + PostGIS spatial extension |
| **`redis`** | `lankaproperty-redis` | `6379:6379` | In-memory cache & atomic bid broadcast engine |
| **`backend`** | `lankaproperty-api` | `4000:4000` | NestJS REST API + WebSocket Gateway |
| **`frontend`** | `lankaproperty-web` | `3000:3000` | Next.js 15 Standalone Responsive UI |

### 3. Open in Browser
- **Web Application Portal:** [http://localhost:3000](http://localhost:3000)
- **Interactive OpenAPI (Swagger) API Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🔑 Pre-Seeded Test Accounts

The platform automatically seeds realistic Sri Lankan listings, live auctions, bids, and test accounts on first database boot:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@lankaproperty.lk` | `Admin@12345` | Full access, moderation queue, auction approvals |
| **Verified Agent** | `agent@premierhomes.lk` | `Admin@12345` | Broker badge, agency listings |
| **Seller A** | `malik.fernando@gmail.com` | `Admin@12345` | Colombo 07 Villa & Nawala Land owner |
| **Seller B** | `chamari.senanayake@yahoo.com` | `Admin@12345` | Galle Fort Villa & Kandy Estate owner |
| **Verified Bidder** | `rohan.de.silva@outlook.com` | `Admin@12345` | KYC-verified bidder in live digital auctions |

---

## 🛠 Local Development (Without Docker Containers for Apps)

If you prefer to run the Node.js apps directly on your host machine while using Docker for Postgres & Redis:

1. **Start database and cache containers:**
   ```bash
   docker compose up -d postgres redis
   ```

2. **Run NestJS backend:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **Run Next.js frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
