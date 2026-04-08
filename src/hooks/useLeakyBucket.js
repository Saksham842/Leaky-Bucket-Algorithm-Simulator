import { useState, useRef, useCallback } from 'react';

// The main logic of the Leaky Bucket algorithm.
// Uses refs for the fast simulation loop (60fps) and state for the UI.
export const useLeakyBucket = (initialCapacity = 100, initialLeakRate = 30) => {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [leakRate, setLeakRate]  = useState(initialLeakRate);
  const [queue, setQueue]        = useState(0);
  const [stats, setStats]        = useState({ processed: 0, dropped: 0 });

  // Refs hold the true simulation values between frames (no re-renders)
  const queueRef    = useRef(0);
  const statsRef    = useRef({ processed: 0, dropped: 0 });
  const lastTimeRef = useRef(performance.now());

  // Try to add packets to the bucket. Drops any that don't fit.
  const addPackets = useCallback((amount) => {
    const space   = capacity - queueRef.current;
    const added   = Math.min(amount, Math.max(0, space));
    const dropped = amount - added;

    queueRef.current        += added;
    statsRef.current.dropped += dropped;

    return { added, dropped };
  }, [capacity]);

  // Called every animation frame to drain the bucket at the leak rate.
  const update = useCallback((now) => {
    const delta = (now - lastTimeRef.current) / 1000; // seconds since last frame
    lastTimeRef.current = now;

    if (queueRef.current > 0) {
      const drained = Math.min(queueRef.current, leakRate * delta);
      queueRef.current          -= drained;
      statsRef.current.processed += drained;
    }

    // Push updated values to the UI
    setQueue(queueRef.current);
    setStats({
      processed: Math.floor(statsRef.current.processed),
      dropped:   Math.floor(statsRef.current.dropped),
    });
  }, [leakRate]);

  // Wipe everything back to zero
  const reset = useCallback(() => {
    queueRef.current  = 0;
    statsRef.current  = { processed: 0, dropped: 0 };
    setQueue(0);
    setStats({ processed: 0, dropped: 0 });
  }, []);

  return {
    queue, capacity, leakRate, stats,
    setCapacity, setLeakRate,
    addPackets, update, reset,
    queueRef, // needed by the 3D scene's useFrame
  };
};
