<div align="center">
  <h1>🚀 Blockchain Price Monitor</h1>
  <p>A powerful NestJS application for monitoring cryptocurrency prices and alerts</p>
</div>

## ✨ Features

- 🔄 Auto-updates ETH and Polygon prices every 5 minutes
- 📊 Price history tracking with hourly aggregation
- 🔔 Price alerts system with email notifications
- 💱 ETH to BTC swap rate calculator
- 📈 Automatic 3% price change notifications

## 🛠️ Tech Stack

- NestJS Framework
- PostgreSQL Database
- Docker & Docker Compose
- Moralis API Integration
- Node Mailer

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git

### 🔑 Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Create `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/blockchain_db

# Email Configuration
SMTP_USER=your_email@example.com
RECIPIENT=hyperhire_assignment@hyperhire.in

# Blockchain Configuration
ETH_CONTRACT_ADDRESS=your_eth_contract
BTC_CONTRACT_ADDRESS=your_btc_contract
POLY_CONTRACT_ADDRESS=your_poly_contract
CHAIN_MORALIS_ETH=eth
CHAIN_MORALIS_POLYGON=polygon
```

### 🐳 Docker Setup

1. Build and start the containers:
```bash
docker compose up --build
```

2. Stop the application:
```bash
docker compose down
```

3. Reset everything (including database):
```bash
docker compose down -v
```

## 🔌 API Endpoints

### Documentation
- `GET /documentation` - Access Swagger API documentation UI

<img width="1679" alt="Screen Shot 2024-10-31 at 13 02 55" src="https://github.com/user-attachments/assets/5017f017-507c-4b1c-93c4-310bb1315287">


### Price Monitoring
- `GET /prices/hourly` - Get hourly price history (24h)
- `GET /prices/current` - Get current prices

### Swap Calculator
- `GET /swap-rate?number={amount}` - Calculate ETH to BTC swap rate
  Example: `/swap-rate?ethAmount=1.0`

### Price Alerts
- `POST /alerts` - Set price alert
  ```json
  {
    "chain": "eth",
    "targetPrice": 2000,
    "email": "user@example.com"
  }
  ```

## 🔍 Monitoring

The application automatically:
- Updates prices every 5 minutes
- Checks for significant price changes (>3%)
- Sends email notifications for triggered alerts
- Maintains price history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is [MIT licensed](LICENSE).

## 💡 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or create an issue in the repository.
