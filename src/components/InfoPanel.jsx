import React from 'react';
import { motion } from 'framer-motion';

const concepts = [
  { tag: 'Core Concept', title: 'The Bucket', accent: '#f59e0b',
    body: 'The bucket is a fixed-size buffer. Packets fill it from the top. A constant "leak" drains it from the bottom. If packets arrive faster than they leak, the bucket fills up.' },
  { tag: 'Use Case', title: 'Why It Exists', accent: '#22d3ee',
    body: 'Networks are naturally bursty. Without shaping, a single host can flood a link. The leaky bucket enforces fairness and keeps any single flow from overwhelming shared infrastructure.' },
  { tag: 'Parameter', title: 'Inflow Rate', accent: '#22d3ee',
    body: 'How fast packets arrive. Traffic is bursty — they arrive in irregular clusters. A high inflow with a slow leak will quickly fill the buffer and start dropping packets.' },
  { tag: 'Parameter', title: 'Leak Rate', accent: '#34d399',
    body: 'The constant speed at which the bucket drains — the guaranteed output bandwidth. It never speeds up based on demand, which is exactly what smooths the traffic stream.' },
  { tag: 'Parameter', title: 'Buffer Capacity', accent: '#c9a84c',
    body: 'A larger buffer tolerates bigger bursts before dropping. A smaller buffer is stricter — packets get dropped almost immediately when inflow exceeds the leak rate.' },
  { tag: 'Behavior', title: 'Packet Drop', accent: '#f43f5e',
    body: 'When the bucket is full and a new packet arrives, it is silently discarded. The sender detects this loss and should reduce its send rate — a simple form of congestion control.' },
];

const steps = [
  { num: '01', label: 'Packet Arrives', desc: 'from the sender', color: '#f59e0b' },
  { num: '02', label: 'Check Buffer',   desc: 'is there space?',  color: '#22d3ee' },
  { num: '03', label: 'Accept or Drop', desc: 'full = lost',      color: '#f43f5e' },
  { num: '04', label: 'Drip at Rate',   desc: 'constant output',  color: '#34d399' },
];

function BucketGraphic() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{ position: 'relative', width: '220px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Top Plate/Ring */}
      <div style={{ width: '158px', height: '10px', background: '#f59e0b', borderRadius: '4px', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)', zIndex: 5 }} />
      
      {/* Glass Cylinder Body */}
      <div style={{ 
        width: '150px', height: '190px', 
        borderLeft: '2px solid rgba(245, 158, 11, 0.2)', 
        borderRight: '2px solid rgba(245, 158, 11, 0.2)', 
        background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.4) 0%, rgba(30, 41, 59, 0.2) 50%, rgba(30, 41, 59, 0.4) 100%)',
        position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(4px)'
      }}>
        {/* Middle Decorative Ring */}
        <div style={{ position: 'absolute', top: '50%', left: '-5px', right: '-5px', height: '6px', background: '#f59e0b', borderRadius: '3px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)', transform: 'translateY(-50%)', zIndex: 4 }} />
        
        {/* Animated Liquid Fill (Blue) */}
        <motion.div 
          animate={{ height: ['30%', '70%', '50%', '85%', '40%'] }} 
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(180deg, #3b82f6aa, #1d4ed8aa)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)', borderTop: '2px solid #60a5fa' }}
        />
      </div>

      {/* Bottom Plate */}
      <div style={{ width: '158px', height: '12px', background: '#f59e0b', borderRadius: '4px', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)', zIndex: 5 }} />

      {/* Nozzle (Exit Pipe) */}
      <div style={{ width: '20px', height: '30px', background: '#334155', borderRadius: '0 0 4px 4px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
        {/* Leak drip */}
        <motion.div 
          animate={{ y: [0, 50], opacity: [0, 1, 0], scale: [1, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '14px', background: '#60a5fa', borderRadius: '99px', boxShadow: '0 0 10px #3b82f6' }}
        />
      </div>

      {/* Background Glow Orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />
    </motion.div>
  );
}


export default function InfoPanel() {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#080b11', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '56px 60px' }}>

        {/* ── Hero ── */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px', paddingRight: '60px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '20px' }}>
              ◆ Network Fundamentals
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}>
              Leaky Bucket<br /><span style={{ color: '#f59e0b' }}>Algorithm</span>
            </h1>
            <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#94a3b8', maxWidth: '520px', marginBottom: '40px' }}>
              A classical networking algorithm that converts bursty, irregular traffic into a smooth, constant-rate output stream — ensuring fair bandwidth use.
            </p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
              style={{ height: '1px', background: 'linear-gradient(90deg, #334155, transparent)', transformOrigin: 'left' }} />
          </div>

          <div style={{ flexShrink: 0 }}>
            <BucketGraphic />
          </div>
        </motion.section>

        {/* ── Step flow ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} style={{ marginBottom: '64px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', marginBottom: '24px' }}>How it works</div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {steps.map((s) => (
              <div key={s.num} style={{ minWidth: '120px' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: s.color, marginBottom: '8px' }}>{s.num}</div>
                <div style={{ width: '100%', height: '2px', background: `linear-gradient(90deg, ${s.color}70, transparent)`, marginBottom: '12px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Widget grid ── */}
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', marginBottom: '24px' }}>Key Concepts</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '64px' }}>
          {concepts.map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.1 + 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
              style={{ background: 'rgba(17,24,39,0.8)', border: `1px solid ${c.accent}20`, borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden', cursor: 'default' }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${c.accent}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: c.accent, background: `${c.accent}15`, border: `1px solid ${c.accent}30`, padding: '3px 8px', borderRadius: '4px', marginBottom: '16px' }}>{c.tag}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>{c.title}</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#94a3b8' }}>{c.body}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Formula ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
          style={{ padding: '32px', background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', color: '#64748b', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>Core Calculation (per frame)</div>
          <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '15px', color: '#22d3ee', display: 'block', marginBottom: '12px' }}>
            queue = queue + incoming − (leakRate × Δtime)
          </code>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#64748b' }}>
            Every animation frame: add arriving packets, then subtract the amount that leaked out based on elapsed time. If queue exceeds capacity, the overflow is dropped.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
