# 🚰 LeakyBucket v2 · Realtime Network Traffic Simulator

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.dot-js&logoColor=white)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A high-performance, visually immersive simulator for the **Leaky Bucket algorithm**, a fundamental traffic-shaping mechanism used in computer networks to manage bandwidth and prevent congestion.

> [!NOTE]
> This simulator provides a real-time, interactive environment to observe how varying inflow rates interact with fixed leak rates and limited buffer capacities.

---

## ✨ Key Features

- **🎮 Dynamic Controls**: Real-time manipulation of Inflow Rate, Leak Rate, and Buffer Capacity.
- **🧊 3D Visualization**: High-fidelity 3D packet flow rendering powered by **React Three Fiber** and **GSAP**.
- **📊 Live Analytics**: Real-time propagation graphs using **D3.js** to track queue occupancy and overflow events.
- **⚡ Performance First**: State management optimized with `useRef` for 60FPS simulation loops without React render overhead.
- **💎 Premium UI**: A sleek "Classic Dark" dashboard with glassmorphism, responsive layouts, and smooth animations.

---

## 🛠️ Technical Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- **Animations**: [GSAP](https://greensock.com/gsap/) & [Framer Motion](https://www.framer.com/motion/)
- **Data Viz**: [D3.js](https://d3js.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

4. **Open your browser**:
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 📖 How it Works

The **Leaky Bucket** algorithm acts as a buffer. Regardless of how bursty or irregular the incoming traffic is, it exits the bucket at a constant, steady rate.

1. **Inflow**: New "packets" arrive at the bucket based on the user-defined `Inflow Rate`.
2. **Buffer**: If the bucket has space, the packet is queued.
3. **Leak**: Packets are removed from the bucket and "transmitted" at the fixed `Leak Rate`.
4. **Overflow**: If a packet arrives and the bucket is at `Capacity`, it is **dropped** (discarded), simulating network congestion.

---

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── Visualizer.jsx      # 3D Scene (Three.js)
│   │   ├── RealtimeChart.jsx   # D3.js Propagation Graph
│   │   └── ...
│   ├── hooks/
│   │   └── useLeakyBucket.js   # Core Algorithm Logic
│   ├── App.jsx                 # Dashboard Layout & State
│   └── main.jsx
├── public/                     # Static Assets
└── vite.config.js              # Vite Configuration
```

---

## 📐 Implementation Details

### The Simulation Loop
The core algorithm runs inside a high-frequency `requestAnimationFrame` loop. To maintain 60FPS while keeping the UI responsive, we use **React Refs** (`useRef`) to store high-frequency state (like queue size and statistics) and synchronize them with the React state and Three.js frame updates.

### 3D Rendering
The 3D space uses a custom rendering pipeline where packets are treated as individual entities with physics-based trajectories, handled by **GSAP** for smooth movement through the bucket.

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing bugs, adding new features, or improving documentation.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed for educational purposes in Computer Networking.
</p>
