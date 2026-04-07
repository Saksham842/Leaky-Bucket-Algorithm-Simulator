import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage the Leaky Bucket Simulation State.
 */
export const useLeakyBucket = (initialCapacity = 100, initialLeakRate = 30) => {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [leakRate, setLeakRate] = useState(initialLeakRate);
  const [queue, setQueue] = useState(0);
  
  // Real-time stats
  const [stats, setStats] = useState({
    processed: 0,
    dropped: 0,
    incoming: 0
  });

  // Using refs for high-frequency simulation loop (60fps)
  const queueRef = useRef(0);
  const statsRef = useRef({ processed: 0, dropped: 0, incoming: 0 });
  const lastUpdateRef = useRef(performance.now());

  const addPackets = useCallback((amount) => {
    statsRef.current.incoming += amount;
    const available = capacity - queueRef.current;
    const added = Math.min(amount, Math.max(0, available));
    const dropped = amount - added;

    queueRef.current += added;
    statsRef.current.dropped += dropped;

    return { added, dropped };
  }, [capacity]);

  const update = useCallback((now) => {
    const delta = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;

    if (queueRef.current > 0) {
      const leak = leakRate * delta;
      const actualLeak = Math.min(queueRef.current, leak);
      queueRef.current -= actualLeak;
      statsRef.current.processed += actualLeak;
    }

    // Periodically update React state from refs (throttled for UI performance)
    // You could also do this every frame if needed, but refs are better for 3D synchronization.
    setQueue(queueRef.current);
    setStats({
      processed: Math.floor(statsRef.current.processed),
      dropped: Math.floor(statsRef.current.dropped),
      incoming: Math.floor(statsRef.current.incoming)
    });
  }, [leakRate]);

  const reset = useCallback(() => {
    queueRef.current = 0;
    statsRef.current = { processed: 0, dropped: 0, incoming: 0 };
    setQueue(0);
    setStats({ processed: 0, dropped: 0, incoming: 0 });
  }, []);

  return {
    queue,
    capacity,
    leakRate,
    stats,
    setCapacity,
    setLeakRate,
    addPackets,
    update,
    reset,
    queueRef // Exposed for React Three Fiber useFrame
  };
};
