# LeakyBucket · Realtime Network Traffic Simulator

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.dot-js&logoColor=white)](https://threejs.org/)
[![Recharts](https://img.shields.io/badge/Recharts-22D3EE?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org/)

A high-performance, visually immersive simulator for the **Leaky Bucket algorithm**, featuring a premium analysis suite and real-time 3D packet physics.

---

## Key Features

- **Dynamic Controls**: Real-time manipulation of Inflow Rate, Leak Rate, and Buffer Capacity.
- **3D Visualization**: High-fidelity 3D packet flow rendering powered by **React Three Fiber**.
- **Real-time Analysis**: A premium dashboard featuring glassmorphism widgets for deep simulation diagnostics.
- **Session Spline**: Lightweight, high-resolution session tracking from start to stop using **Recharts**.
- **Intelligence Metrics**: Real-time calculation of **Estimated Latency** (Queuing Delay) and Peak Load.
- **Feedback**: A "Bucket Mood" indicator that provides descriptive, personality-driven status updates.
- ** Performance First**: State management optimized with `useRef` for 60FPS simulation loops.

---

## 🛠️ Technical Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- **Data Viz**: [Recharts](https://recharts.org/) (for Analysis suite)
- **Animations**: [GSAP](https://greensock.com/gsap/) & [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Vanilla CSS 

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd cn-project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## How it Works

The **Leaky Bucket** algorithm acts as a buffer. Regardless of how bursty or irregular the incoming traffic is, it exits the bucket at a constant, steady rate.

1. **Inflow**: New "packets" arrive at the bucket based on the user-defined `Inflow Rate`.
2. **Buffer**: If the bucket has space, the packet is queued (adding to **Latency**).
3. **Leak**: Packets are removed from the bucket and "transmitted" at the fixed `Leak Rate`.
4. **Analysis**: The **Analysis Dashboard** monitors success rates, dropped packets, and theoretical queuing delay in real-time.

---

## Project Structure

```text
├── src/
│   ├── components/
│   │   ├── Visualizer.jsx      # 3D Scene (Three.js)
│   │   ├── ChartPanel.jsx     # MacBook-Style Analysis Suite
│   │   ├── InfoPanel.jsx       # Algorithm Documentation
│   │   └── ...
│   ├── hooks/
│   │   └── useLeakyBucket.js   # Core Algorithm Logic
│   ├── App.jsx                 # Dashboard Entry & State
│   └── main.jsx
└── vite.config.js              # Vite Configuration
```

---

## Analysis Suite Details

### Estimated Latency
Calculates the theoretical time a packet spends waiting in the buffer using the formula: `Latency = Queue Size / Leak Rate`. This provides critical insight into the "lag" introduced by traffic shaping.

### Session Spline
A lightweight Recharts implementation that captures the full history of the propagation session from the moment it starts until it stops, providing a high-fidelity visual trace of queue behavior.

---

<p align="center">
  Developed for Computer Networking project by Saksham Hans and group.
</p>
