import React from 'react';

// Shows a single stat (e.g. "Processed: 42") in the header
export function Kpi({ label, value, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// Green "Stable" or red "Congestion" pill in the header
export function StatusPill({ critical }) {
  const color = critical ? 'var(--rose)' : 'var(--green)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: critical ? 'rgba(244,63,94,0.12)' : 'rgba(52,211,153,0.1)', border: `1px solid ${critical ? 'rgba(244,63,94,0.3)' : 'rgba(52,211,153,0.2)'}` }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, display: 'inline-block' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>
        {critical ? 'Congestion' : 'Stable'}
      </span>
    </div>
  );
}

// A labeled dark card that wraps a group of controls
export function Section({ label, children, compact }) {
  return (
    <div data-card style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: compact ? '10px 14px' : '14px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: compact ? '8px' : '12px' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '4px' : '14px' }}>{children}</div>
    </div>
  );
}

// A single slider row with a label, hint, colored fill bar, and value badge
export function Slider({ label, hint, value, onChange, min, max, display, accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginLeft: '8px' }}>{hint}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: accent, background: `${accent}18`, border: `1px solid ${accent}30`, padding: '2px 10px', borderRadius: '6px', minWidth: '72px', textAlign: 'center' }}>
          {display}
        </span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '5px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', left: 0, height: '5px', width: `${pct}%`, borderRadius: '9999px', background: `linear-gradient(90deg, ${accent}cc, ${accent})`, boxShadow: `0 0 8px ${accent}66`, transition: 'width 0.1s' }} />
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', left: 0, right: 0, width: '100%', appearance: 'none', WebkitAppearance: 'none', background: 'transparent', cursor: 'pointer', height: '20px', margin: 0, accentColor: accent }} />
      </div>
    </div>
  );
}
