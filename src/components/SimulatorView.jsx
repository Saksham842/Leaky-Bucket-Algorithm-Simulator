import React from 'react';
import { Play, Square, Trash2 } from 'lucide-react';
import { Section, Slider } from './ui/Controls';
import Visualizer from './Visualizer';

// The full simulator view: left controls panel + right 3D scene
export default function SimulatorView({
  queue, capacity, leakRate, stats,
  inflowRate, setInflowRate,
  setLeakRate, setCapacity,
  isRunning, setIsRunning,
  packetEvt, reset,
  fillPct, critical,
}) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>

      {/* Left controls sidebar */}
      <aside style={{ width: '42%', maxWidth: '460px', minWidth: '300px', flexShrink: 0, background: 'rgba(11,15,22,0.98)', borderRight: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', flex: 1 }}>

          {/* Rate sliders */}
          <Section label="Traffic Parameters">
            <Slider label="Inflow Rate"    hint="packets/s in"  value={inflowRate} onChange={setInflowRate} min={0}  max={200} accent="var(--cyan)"  display={`${inflowRate} req/s`} />
            <Slider label="Leak Rate"       hint="packets/s out" value={leakRate}   onChange={setLeakRate}   min={1}  max={100} accent="var(--green)" display={`${leakRate} req/s`} />
            <Slider label="Buffer Capacity" hint="max packets"   value={capacity}   onChange={setCapacity}   min={10} max={400} accent="var(--gold)"  display={`${capacity} pkts`} />
          </Section>

          {/* Live buffer fill bar */}
          <Section label="Buffer State" compact>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--dim)' }}>Queue</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: critical ? 'var(--rose)' : 'var(--cyan)' }}>
                {Math.floor(queue)} / {capacity}
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                width: `${fillPct}%`, height: '100%', borderRadius: '99px', transition: 'width 0.4s ease, background 0.4s ease',
                background: critical ? 'linear-gradient(90deg, #f43f5e, #fb923c)' : 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                boxShadow:  critical ? '0 0 10px #f43f5e88' : '0 0 10px #3b82f688',
              }} />
            </div>
          </Section>

          {/* Play/Stop and Reset buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button data-card onClick={() => setIsRunning(v => !v)} style={{
              padding: '18px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s',
              ...(isRunning
                ? { background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.4)' }
                : { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', boxShadow: '0 0 25px rgba(37,99,235,0.5)' })
            }}>
              {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isRunning ? 'Stop Transmission' : 'Engage Propagation'}
            </button>

            <button onClick={reset} style={{
              padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--dim)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
            >
              <Trash2 size={12} /> Purge Buffer
            </button>
          </div>

        </div>
      </aside>

      {/* Right 3D scene */}
      <div style={{ flex: 1, position: 'relative', background: '#080b11' }}>
        <Visualizer queue={queue} capacity={capacity} packetEvent={packetEvt} leakRate={leakRate} />

        {/* Top-right HUD: big fill percentage */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
          <div data-card style={{ background: 'rgba(10,13,19,0.88)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 18px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px' }}>Buffer Fill</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: critical ? 'var(--rose)' : 'var(--amber)' }}>
              {fillPct}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)', marginLeft: '2px' }}>%</span>
            </div>
          </div>
          <div style={{ background: 'rgba(10,13,19,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: critical ? 'var(--rose)' : 'var(--green)', boxShadow: critical ? '0 0 8px var(--rose)' : '0 0 8px var(--green)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              {critical ? 'Overflow Risk' : 'Nominal'}
            </span>
          </div>
        </div>

        {/* Bottom color legend */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '18px', pointerEvents: 'none' }}>
          {[{ dot: 'var(--amber)', label: 'Inflow' }, { dot: 'var(--blue)', label: 'Leak' }, { dot: 'var(--rose)', label: 'Dropped' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(10,13,19,0.7)', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: l.dot, boxShadow: `0 0 6px ${l.dot}`, display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
