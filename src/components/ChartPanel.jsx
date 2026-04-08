import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * MacBook-style Widget Card
 */
const Widget = ({ title, value, subValue, color, icon, children, height = 'auto' }) => (
  <div style={{ 
    flex: 1, 
    background: 'rgba(255, 255, 255, 0.03)', 
    backdropFilter: 'blur(24px)', 
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    borderRadius: '24px', 
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    height: height,
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ color: color, fontSize: '14px', opacity: 0.8 }}>{icon}</div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {value !== undefined && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>
          {value}
        </div>
      )}
      {subValue && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', color: '#475569', marginTop: '6px' }}>
          {subValue}
        </div>
      )}
      {children}
    </div>
  </div>
);

export default function AnalysisPanel({ queue, capacity, stats, isRunning }) {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [peakLoad, setPeakLoad] = useState(0);

  // 1. Session Lifecycle (Start/Stop detection)
  useEffect(() => {
    if (isRunning) {
        setSessionHistory([]);
        setStartTime(Date.now());
        setPeakLoad(0);
    }
  }, [isRunning]);

  // 2. Data Recording (High frequency)
  useEffect(() => {
    if (isRunning) {
        const timestamp = Date.now();
        setSessionHistory(prev => {
            const currentCount = prev.length;
            // Adaptive sampling for performance
            if (currentCount > 500 && currentCount % 2 !== 0) return prev; 
            return [...prev, { time: timestamp, value: queue }];
        });
        
        if (queue > peakLoad) setPeakLoad(queue);
    }
  }, [queue, isRunning, capacity]);

  const handlePurge = () => {
    setSessionHistory([]);
    setStartTime(null);
    setPeakLoad(0);
  };

  const totalIn = stats.processed + stats.dropped;
  const successRate = totalIn > 0 ? ((stats.processed / totalIn) * 100).toFixed(1) : 100;
  
  // Calculate Estimated Latency (seconds)
  // Formula: Queue size / Leak rate
  // This tells us how long a packet will wait in the bucket
  const leakRate = 30; // Standard leak rate from App.jsx defaults
  const latency = (queue / Math.max(leakRate, 1)).toFixed(2);

  return (
    <div style={{ width: '100%', height: '100%', background: '#080b11', display: 'flex', flexDirection: 'column', padding: '32px', gap: '24px', overflowY: 'auto' }}>
      
      {/* Analysis Content */}
 
      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <Widget 
          title="Overall Success" 
          value={`${successRate}%`} 
          subValue={`of ${totalIn} attempted pkts`} 
          color="#10b981" 
          icon="􀁏" 
        />
        <Widget 
          title="Packets Drained" 
          value={stats.processed} 
          subValue="successfully sent" 
          color="#3b82f6" 
          icon="􀒇" 
        />
        <Widget 
          title="Packets Dropped" 
          value={stats.dropped} 
          subValue="overflowed buffer" 
          color="#f43f5e" 
          icon="􀁞" 
        />
        <Widget 
          title="Estimated Latency" 
          value={`${latency}s`} 
          subValue="theoretical packet delay" 
          color="#a855f7" 
          icon="􀙩" 
        />
      </div>

      {/* Secondary Details & Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
        
        {/* Analysis Sparkline Widget */}
        <Widget title="Propagation Spline" height="100%">
           <div style={{ flex: 1, position: 'relative', marginTop: '12px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={sessionHistory}>
                 <defs>
                   <linearGradient id="splineGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Tooltip content={() => null} />
                 <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22d3ee" 
                    strokeWidth={2} 
                    fill="url(#splineGrad)" 
                    isAnimationActive={false}
                 />
               </AreaChart>
             </ResponsiveContainer>
             {sessionHistory.length === 0 && (
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '11px', fontStyle: 'italic' }}>
                 Engage propagation to generate spline trace...
               </div>
             )}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
              <div style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase' }}>Start Time: {startTime ? new Date(startTime).toLocaleTimeString() : '--'}</div>
              <div style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase' }}>Current Queue: {queue} pkts</div>
           </div>
        </Widget>

        {/* Intelligence Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <Widget title="Internal Buffer Intel">
             <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '11px', color: '#94a3b8' }}>Capacity</span>
                   <span style={{ fontSize: '11px', color: '#f8fafc', fontWeight: 600 }}>{capacity} pkts</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '11px', color: '#94a3b8' }}>Leak Rate</span>
                   <span style={{ fontSize: '11px', color: '#22d3ee', fontWeight: 600 }}>{stats.processed} pkts drained</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '11px', color: '#94a3b8' }}>Peak Load</span>
                   <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 600 }}>{peakLoad} / {capacity}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                   <div style={{ height: '100%', width: `${(queue/capacity)*100}%`, background: '#22d3ee' }} />
                </div>
             </div>
           </Widget>

           <Widget title="Bucket Mood">
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    border: '3px solid',
                    background: queue > capacity * 0.85 ? 'rgba(244,63,94,0.1)' : (queue > 0 ? 'rgba(34,211,238,0.05)' : 'transparent'),
                    borderColor: queue > capacity * 0.85 ? '#f43f5e' : (queue > 0 ? '#22d3ee' : '#1e293b'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    boxShadow: queue > capacity * 0.85 ? '0 0 20px rgba(244,63,94,0.25)' : 'none'
                 }}>
                    {Math.round((queue/capacity)*100)}%
                 </div>
                 <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                       {queue > capacity * 0.85 ? 'Feeling Overwhelmed' : (queue > 0 ? 'Flowing Smoothly' : 'Resting & Ready')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                       {queue > capacity * 0.85 
                          ? "I'm struggling to keep up with this inflow. Packets are starting to spill!" 
                          : (queue > 0 
                             ? "Handling the traffic nicely. No stress here." 
                             : "All cleared out. Standing by for the next wave of data.")
                       }
                    </div>
                 </div>
              </div>
           </Widget>
        </div>

      </div>

    </div>
  );
}

