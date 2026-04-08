import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeakyBucket } from './hooks/useLeakyBucket';
import { Kpi, StatusPill } from './components/ui/Controls';
import SimulatorView from './components/SimulatorView';
import InfoPanel    from './components/InfoPanel';
import ChartPanel   from './components/ChartPanel';
import gsap from 'gsap';

// The tabs shown in the navbar
const NAV_TABS = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'analysis',  label: 'Analysis'  },
  { id: 'info',      label: 'Info'      },
];

export default function App() {
  // Core simulation state (capacity=100, leakRate=30 defaults)
  const { queue, capacity, leakRate, stats, setCapacity, setLeakRate, addPackets, update, reset } = useLeakyBucket(100, 30);

  const [inflowRate, setInflowRate] = useState(50);   // how fast packets arrive
  const [isRunning,  setIsRunning]  = useState(false); // is the simulation running?
  const [packetEvt,  setPacketEvt]  = useState(null);  // triggers a 3D particle
  const [activeTab,  setActiveTab]  = useState('simulator');

  // Main simulation loop — runs every animation frame (60fps)
  // Always active so the Chart tab gets live data even when not on Simulator
  useEffect(() => {
    let frameId;
    const loop = (ts) => {
      update(ts); // drain the bucket
      if (isRunning && Math.random() < inflowRate / 60) {
        const res = addPackets(1);
        setPacketEvt({ id: ts + Math.random(), type: res.dropped > 0 ? 'dropped' : 'normal' });
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, inflowRate, update, addPackets]);

  // Fade cards in on first load
  useEffect(() => {
    gsap.fromTo('[data-card]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.55, ease: 'power2.out' });
  }, []);

  const fillPct  = Math.min(100, Math.round((queue / capacity) * 100));
  const critical = queue > capacity * 0.85; // true when nearly full

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', color: '#e2e8f0', fontFamily: 'var(--font-sans)' }}>

      {/* ── Navbar ── */}
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ height: '72px', padding: '0 32px', flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', background: 'rgba(10,13,19,0.97)', borderBottom: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)', zIndex: 100 }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
            Leaky <span style={{ color: 'var(--gold)' }}>Bucket</span> Algorithm
          </span>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
          {NAV_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '7px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'rgba(245,158,11,0.15)' : 'transparent',
              color:      activeTab === tab.id ? 'var(--amber)' : 'var(--muted)',
              boxShadow:  activeTab === tab.id ? '0 0 0 1px rgba(245,158,11,0.3)' : 'none',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifySelf: 'end' }}>
          <Kpi label="Processed" value={stats.processed} color="var(--green)" />
          <Kpi label="Dropped"   value={stats.dropped}   color="var(--rose)"  />
          <Kpi label="Fill"      value={`${fillPct}%`}   color={critical ? 'var(--rose)' : 'var(--amber)'} />
          <StatusPill critical={critical} />
        </div>
      </motion.header>

      {/* ── Page content (switches between tabs) ── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <AnimatePresence mode="wait">

          {activeTab === 'simulator' && (
            <motion.div key="simulator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ width: '100%', height: '100%' }}>
              <SimulatorView
                queue={queue} capacity={capacity} leakRate={leakRate} stats={stats}
                inflowRate={inflowRate} setInflowRate={setInflowRate}
                setLeakRate={setLeakRate} setCapacity={setCapacity}
                isRunning={isRunning} setIsRunning={setIsRunning}
                packetEvt={packetEvt} reset={reset}
                fillPct={fillPct} critical={critical}
              />
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}>
              <ChartPanel queue={queue} capacity={capacity} stats={stats} isRunning={isRunning} />
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}>
              <InfoPanel />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
