# IoT Dashboard for CO Reduction & System Monitoring

##  Overview

This project is a real-time IoT monitoring dashboard built to measure and enhance carbon monoxide (CO) reduction in vehicle exhaust systems using a CuO-coated mesh catalyst. It features live data visualization, interactive analytics, and a clean, responsive interface for monitoring key system parameters.

---

## Key Features

- 📈 **Live Sensor Data Monitoring**  
  Visualizes CO concentration (in/out), voltage, current, power, and thermal gradients in real time.

- 🧪 **Performance Insights**  
  Provides efficiency scoring and system health summaries with visual indicators.

- 📤 **Data Export & Summary Stats**  
  Download historical data in CSV format and view quick stats for any time period.

- 📊 **Interactive Dashboard UI**  
  Built with a modern front-end stack for fast, intuitive interaction across devices.

- 🔋 **Low-Power Operation**  
  Optimized for edge deployment in resource-constrained environments.

- 🚴 **Field-Tested Performance**  
  Validated through simulations on bikes, cars, and buses showing up to **92% CO reduction efficiency**.

---

## Tech Stack

| Frontend       | Backend        | Styling          |
|----------------|----------------|------------------|
| Vite           | Flask (Python) | Tailwind CSS     |
| React          | REST API       | ShadCN UI        |
| TypeScript     |                | Responsive Design|

---

## Getting Started

### Prerequisites

- Node.js & npm (recommended via [nvm](https://github.com/nvm-sh/nvm))
- Python 3.9+
- Git

### Setup Instructions

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install frontend dependencies
npm install

# Start the development server
npm run dev
