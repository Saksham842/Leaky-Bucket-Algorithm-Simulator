import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Droplet, Activity, Settings, Trash2, Play, Square, AlertCircle, Layers, ChevronRight, Info } from 'lucide-react';
import { useLeakyBucket } from './hooks/useLeakyBucket';
import Visualizer from './components/Visualizer';
import RealtimeChart from './components/RealtimeChart';
import gsap from 'gsap';

/* ─────────────────────────────────────────────────────────────────
   App – Classic Dark Theme Layout
   Left: Controls (40%) | Right: 3D Scene (60%)
   Graph is embedded in the left panel below controls.
   Header is compact. No footer.
─────────────────────────────────────────────────────────────────── */

export default function App() {
  const {
    queue, capacity, leakRate, stats,
    setCapacity, setLeakRate, addPackets, update, reset
  } = useLeakyBucket(100, 30);

  const [inflowRate, setInflowRate] = useState(50);
  const [isRunning, setIsRunning]   = useState(false);
  const [packetEvt, setPacketEvt]   = useState(null);
  const [activeTab, setActiveTab]   = useState('controls'); // 'controls' | 'info'

  /* Simulation loop */
  useEffect(() => {
    let id;
    const loop = (ts) => {
      update(ts);
      if (isRunning && Math.random() < inflowRate / 60) {
        const res = addPackets(1);
        setPacketEvt({ id: ts + Math.random(), type: res.dropped > 0 ? 'dropped' : 'normal' });
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isRunning, inflowRate, update, addPackets]);

  /* Entrance */
  useEffect(() => {
    gsap.fromTo('[data-card]',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.55, ease: 'power2.out' }
    );
  }, []);

  const fillPct  = Math.min(100, Math.round((queue / capacity) * 100));
  const critical = queue > capacity * 0.85;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col"
         style={{ background: 'var(--bg-base)', color: '#e2e8f0', fontFamily: 'var(--font-sans)' }}>

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ background: 'rgba(10,13,19,0.97)', borderBottom: '1px solid rgba(255,255,255,0.09)', height: '72px', padding: '0 32px', flexShrink: 0 }}
        className="flex items-center justify-between z-50 backdrop-blur-xl"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 0 16px rgba(245,158,11,0.4)',
              padding: '6px', borderRadius: '10px'
          }}>
            <Droplet size={16} fill="white" color="white" />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
              Leaky<span style={{ color: 'var(--gold)' }}>Bucket</span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginLeft: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              v2 · Realtime Simulator
            </span>
          </div>
        </div>

        {/* Header KPIs */}
        <div className="flex items-center gap-6">
          <Kpi label="Processed" value={stats.processed}  color="var(--green)" />
          <Kpi label="Dropped"   value={stats.dropped}    color="var(--rose)"  />
          <Kpi label="Fill"      value={`${fillPct}%`}    color={critical ? 'var(--rose)' : 'var(--amber)'} />
          <StatusPill critical={critical} />
        </div>
      </motion.header>

      {/* ══ WORKSPACE ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex min-h-0 gap-0">

        {/* ── LEFT PANEL (38%) ─────────────────────────────────────── */}
        <aside style={{ width: '42%', maxWidth: '460px', minWidth: '300px', background: 'rgba(11,15,22,0.98)', borderRight: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto' }}
               className="shrink-0 flex flex-col">

          {/* Tabs */}
          <div className="flex shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['controls', 'info'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: activeTab === tab ? 'var(--amber)' : 'var(--muted)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--amber)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'controls' ? (
              <motion.div
                key="controls"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5 p-5 flex-1"
              >
                {/* Sliders */}
                <Section label="Traffic Parameters">
                  <SliderField
                    label="Inflow Rate" hint="incoming req/s"
                    value={inflowRate} onChange={setInflowRate}
                    min={0} max={200} colorClass="blue"
                    display={`${inflowRate} req/s`} accent="var(--cyan)"
                  />
                  <SliderField
                    label="Leak Rate" hint="outflow req/s"
                    value={leakRate} onChange={setLeakRate}
                    min={1} max={100} colorClass="green"
                    display={`${leakRate} req/s`} accent="var(--green)"
                  />
                  <SliderField
                    label="Buffer Capacity" hint="max packets"
                    value={capacity} onChange={setCapacity}
                    min={10} max={400} colorClass="gold"
                    display={`${capacity} pkts`} accent="var(--gold)"
                  />
                </Section>

                {/* Buffer bar */}
                <Section label="Buffer State" compact>
                  <div className="flex justify-between items-baseline mb-1">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--dim)' }}>Queue</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: critical ? 'var(--rose)' : 'var(--cyan)' }}>
                      {Math.floor(queue)} / {capacity}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${fillPct}%`, height: '100%', borderRadius: '99px',
                      background: critical
                        ? 'linear-gradient(90deg, #f43f5e, #fb923c)'
                        : 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                      boxShadow: critical ? '0 0 10px #f43f5e88' : '0 0 10px #3b82f688',
                      transition: 'width 0.4s ease, background 0.4s ease'
                    }} />
                  </div>
                </Section>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    data-card
                    onClick={() => setIsRunning(v => !v)}
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      border: 'none',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '12px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      transition: 'all 0.2s',
                      ...(isRunning
                        ? { background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.4)' }
                        : { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', boxShadow: '0 0 25px rgba(37,99,235,0.5)' }
                      )
                    }}
                  >
                    {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    {isRunning ? 'Stop Transmission' : 'Engage Propagation'}
                  </button>
                  <button
                    onClick={reset}
                    style={{
                      padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)', color: 'var(--dim)',
                      fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'var(--dim)'}
                  >
                    <Trash2 size={12}/> Purge Buffer
                  </button>
                </div>

                {/* D3 Graph */}
                <div data-card style={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', height: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    <Activity size={10} style={{ display: 'inline', marginRight: '5px' }}/>Propagation Graph
                  </div>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <RealtimeChart data={queue} capacity={capacity} />
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="p-5 flex flex-col gap-5"
              >
                <InfoCard
                  title="Leaky Bucket Algorithm"
                  body="A traffic-shaping mechanism that enforces a maximum output rate regardless of input burst. Packets arriving when the bucket is full are dropped (overflowed)."
                />
                <InfoCard
                  title="Inflow Rate"
                  body="The rate at which packets arrive at the bucket. When this exceeds the Leak Rate, the buffer begins to fill."
                />
                <InfoCard
                  title="Leak Rate"
                  body="The constant rate at which packets are transmitted downstream. This reflects the guaranteed bandwidth of the channel."
                />
                <InfoCard
                  title="Buffer Capacity"
                  body="The maximum number of packets the bucket can hold. Once full, any additional incoming packets are silently dropped."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* ── RIGHT: 3D VISUALIZER (62%) ───────────────────────────── */}
        <div className="flex-1 relative min-w-0" style={{ background: '#080b11' }}>
          <Visualizer
            queue={queue}
            capacity={capacity}
            packetEvent={packetEvt}
            leakRate={leakRate}
          />

          {/* HUD: top-right overlay */}
          <div className="absolute top-5 right-5 flex flex-col gap-3 pointer-events-none">
            <div data-card style={{ background: 'rgba(10,13,19,0.88)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 18px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px' }}>Buffer Fill</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: critical ? 'var(--rose)' : 'var(--amber)' }}>
                {fillPct}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)', marginLeft: '2px' }}>%</span>
              </div>
            </div>
            <div style={{ background: 'rgba(10,13,19,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: critical ? 'var(--rose)' : 'var(--green)', boxShadow: critical ? '0 0 8px var(--rose)' : '0 0 8px var(--green)', animation: critical ? 'ping 1s infinite' : 'none', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                {critical ? 'Overflow Risk' : 'Nominal'}
              </span>
            </div>
          </div>

          {/* Bottom legend */}
          <div className="absolute bottom-5 left-1/2" style={{ transform: 'translateX(-50%)', display: 'flex', gap: '18px', pointerEvents: 'none' }}>
            {[
              { dot: 'var(--amber)', label: 'Inflow' },
              { dot: 'var(--blue)', label: 'Leak' },
              { dot: 'var(--rose)', label: 'Dropped' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(10,13,19,0.7)', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: l.dot, boxShadow: `0 0 6px ${l.dot}`, display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function Kpi({ label, value, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function StatusPill({ critical }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '999px',
      background: critical ? 'rgba(244,63,94,0.12)' : 'rgba(52,211,153,0.1)',
      border: `1px solid ${critical ? 'rgba(244,63,94,0.3)' : 'rgba(52,211,153,0.2)'}`,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: critical ? 'var(--rose)' : 'var(--green)', boxShadow: `0 0 6px ${critical ? 'var(--rose)' : 'var(--green)'}`, display: 'inline-block' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: critical ? 'var(--rose)' : 'var(--green)' }}>
        {critical ? 'Congestion' : 'Stable'}
      </span>
    </div>
  );
}

function Section({ label, children, compact }) {
  return (
    <div data-card style={{ 
      background: 'rgba(17,24,39,0.7)', 
      border: '1px solid rgba(255,255,255,0.07)', 
      borderRadius: '12px', 
      padding: compact ? '10px 14px' : '14px' 
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: compact ? '8px' : '12px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '4px' : '14px' }}>{children}</div>
    </div>
  );
}

function SliderField({ label, hint, value, onChange, min, max, display, accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginLeft: '8px' }}>{hint}</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: accent,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          padding: '2px 10px', borderRadius: '6px', minWidth: '72px', textAlign: 'center'
        }}>
          {display}
        </span>
      </div>
      {/* Custom slider track with filled portion */}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '5px',
          borderRadius: '9999px', background: 'rgba(255,255,255,0.08)'
        }} />
        <div style={{
          position: 'absolute', left: 0, height: '5px',
          width: `${pct}%`, borderRadius: '9999px',
          background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
          boxShadow: `0 0 8px ${accent}66`, transition: 'width 0.1s'
        }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', left: 0, right: 0, width: '100%',
            appearance: 'none', WebkitAppearance: 'none',
            background: 'transparent', cursor: 'pointer', height: '20px', margin: 0,
            accentColor: accent
          }}
        />
      </div>
    </div>
  );
}

function InfoCard({ title, body, accent }) {
  return (
    <div style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: accent || 'var(--amber)', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', lineHeight: '1.65', color: 'var(--dim)' }}>
        {body}
      </div>
    </div>
  );
}
