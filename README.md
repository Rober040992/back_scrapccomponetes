# 🧠 Scrapccomponentes — Backend Documentation

## 📖 Overview

**Scrapccomponentes** is a work-in-progress full-stack project that aims to become a **professional PCComponentes price tracking and analytics platform**.  

The core goal is to **automatically scrape product data (GPUs, CPUs, etc.) from [pccomponentes.com](https://www.pccomponentes.com)**, store it historically, and display price evolution charts over time.  

When completed, the project will allow:
- Public users to search and view price histories.
- Registered users to create **custom price alerts**.
- Automated weekly scraping to maintain updated price data.
- Notifications via **email** and **Discord webhooks** when targets are met.
- Optional **Stripe-based donations** to support the project.

This README focuses on the **backend (Node.js + Express + MongoDB)** part, which manages scraping, caching, and background job processing.

---

## ⚙️ Current Status

The project is **under active development**.  
So far, the following backend components are implemented:

### ✅ Core Features
- **Express API** with endpoints for single-product and status fetching.
- **MongoDB + Mongoose** for structured storage of product data (`ProductPrice` model).
- **Redis + BullMQ** job queue for asynchronous scraping tasks.
- **Puppeteer** scrapers with caching and retry logic.
- **Automatic weekly scraping system** using `node-cron`.
- **Rate limiting** and **honeypot protection** for security.
- **Data caching layer** that stores products for 7 days before re-scraping.

### 🧩 Frontend (In Progress)
- Built in **Next.js + React + TypeScript**.
- Uses **React Query** for data fetching and caching.
- UI powered by **TailwindCSS**.
- Displays product details and images.
- Integrated charting planned with **Chart.js**.

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Backend Runtime** | Node.js (v22.17.0) | Core execution environment |
| **Framework** | Express 5 | REST API and routing |
| **Database** | MongoDB + Mongoose | Persistent product storage |
| **Queue System** | BullMQ + Redis | Job processing for scraping tasks |
| **Scraping Engine** | Puppeteer | Browser automation for extracting data |
| **Scheduler** | node-cron | Automated weekly scraping |
| **Validation** | Zod | Schema validation for inputs |
| **Errors** | http-errors | Standardized error handling |
| **Security** | express-rate-limit, honeypot middleware | Anti-abuse and rate control |
| **Environment Config** | dotenv | Secure environment variable management |
| **Logging** | morgan, debug | Development and monitoring logs |

---

## 🧩 Folder Structure (Backend)

```
backscrap/
│
├── bin/
│   └── www                          # Express server launcher
│
├── controllers/
│   ├── API/
│   │   ├── getSingleProductController.js
│   │   └── getProductStatusController.js
│
├── jobs/
│   └── weeklyScraper.js             # Cron job to enqueue weekly scrapes
│
├── lib/
│   ├── mongooseConfig.js            # MongoDB connection handler
│   ├── redisClient.js               # Redis connector
│   ├── scrapeSingleProduct.js       # Puppeteer scraper
│
├── middlewares/
│   ├── rate&honey.js                # Honeypot + rate limiting
│   └── checkProductCache.js         # Cache control logic
│
├── models/
│   └── ProductPrice.js              # Mongoose schema for price tracking
│
├── queues/
│   └── scraperQueue.js              # BullMQ queue configuration
│
├── workers/
│   └── scraperWorker.js             # Worker consuming scraping jobs
│
├── routes/
│   └── Routes.js                    # API endpoints definitions
│
├── .env                             # Environment variables (not committed)
├── package.json
└── README.md                        # (you are here)
```

---

## ⚡ Backend Flow

Below is the simplified **data flow** of the system:

1. **Frontend** sends request → `/api/products/one?slug=...`
2. **Middleware `checkProductCache`** checks MongoDB cache:
   - If a product exists within the last 7 days → returns cached data.
   - Otherwise → adds the slug to **BullMQ queue** and starts polling.
3. **Worker (`scraperWorker.js`)** processes queue jobs:
   - Launches Puppeteer, scrapes product title, price, and image.
   - Saves to MongoDB (`ProductPrice` collection).
4. **API** responds with:
   - Cached data (if available).
   - Or a `202 Accepted` message if enqueued and waiting.
5. **Weekly Scraper (`weeklyScraper.js`)**:
   - Every Monday at 03:00 AM, it runs via **node-cron**.
   - Fetches all slugs (base + discovered) and enqueues them for re-scraping.
   - Ensures all tracked products stay up-to-date.

---

## 🧠 MongoDB Schema — `ProductPrice.js`

Each document represents a **product snapshot** with metadata:

```js
{
  slug: "nvidia-rtx-4070",
  title: "NVIDIA RTX 4070 Ti 12GB",
  price: "€899.00",
  currency: "EUR",
  image: "https://example.com/4070.jpg",
  isActive: true,
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

Indexes optimize queries by `slug`, `isActive`, and `createdAt`.

---

## 🧰 Development Setup

### 🧩 Requirements
- **Node.js** ≥ 22.17.0
- **MongoDB** running locally or remotely
- **Redis** via Docker (BullMQ requires it)

You'll need **3 terminals** to run the full backend workflow:

| Terminal | Command | Description |
|----------|---------|-------------|
| 1️⃣ | `npm start` | Starts the Express API |
| 2️⃣ | `npm run worker` | Runs BullMQ worker to process jobs |
| 3️⃣ | `npm run weekly-scrape` | Runs the weekly scraper cron job manually |

### 🐳 Docker (Redis Setup)
A running Redis instance is required for the BullMQ queue.  
You can quickly start it with Docker:

```bash
docker run -d \
  --name redis-bullmq \
  -p 6379:6379 \
  redis:7-alpine
```

### 🔑 Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/scrapcomponentes
SCRAPE_BASE_URL=https://www.pccomponentes.com/
REDIS_URL=redis://localhost:6379
```

---

## 🧭 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/one?slug=` | Scrapes or retrieves cached data for a product |
| GET | `/api/status/:slug` | Returns the latest stored data for a slug |

---

## 🔄 Cron Schedule

The weekly scrape job runs automatically:

```
0 3 * * 1
```

➡ Every Monday at 03:00 AM, it enqueues all slugs to ensure fresh data is collected.

---

## 🚧 Work in Progress

**Scrapccomponentes** is not yet finished.  
Next development milestones include:

- [ ] Price alert system with email notifications
- [ ] Discord webhook integration
- [ ] Frontend chart visualization (React + Chart.js)
- [ ] Auth0 integration for user accounts
- [ ] Stripe donations page
- [ ] Admin dashboard for managing scraping jobs

---

## 👨‍💻 Author

**Roberto Gómez Fábrega**  
📧 rgfrasta@gmail.com  
MIT License © 2025

⚠️ *This project is currently under active development. Expect major changes as the system evolves toward production stability.*