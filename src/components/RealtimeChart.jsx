import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

const HISTORY_LEN = 60;

const RealtimeChart = ({ data, capacity }) => {
  const containerRef = useRef(null);
  const historyRef   = useRef(new Array(HISTORY_LEN).fill(0));
  const renderRef    = useRef(null);

  const draw = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    if (W < 10 || H < 10) return;

    const m = { top: 10, right: 12, bottom: 24, left: 34 };
    const iW = W - m.left - m.right;
    const iH = H - m.top - m.bottom;
    const hist = historyRef.current;

    d3.select(el).select('svg').remove();

    const svg = d3.select(el)
      .append('svg')
      .attr('width', W).attr('height', H)
      .style('overflow', 'visible');

    const defs = svg.append('defs');

    // Gradient for the area
    const grad = defs.append('linearGradient')
      .attr('id', 'lbg').attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
    grad.append('stop').attr('offset','0%') .attr('stop-color','#3b82f6').attr('stop-opacity',0.6);
    grad.append('stop').attr('offset','100%').attr('stop-color','#3b82f6').attr('stop-opacity',0.05);

    // Glow filter
    const glow = defs.append('filter').attr('id','lbglow');
    glow.append('feGaussianBlur').attr('stdDeviation','3.5').attr('result','cb');
    const fm = glow.append('feMerge');
    fm.append('feMergeNode').attr('in','cb');
    fm.append('feMergeNode').attr('in','SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const x = d3.scaleLinear().domain([0, HISTORY_LEN - 1]).range([0, iW]);
    const y = d3.scaleLinear().domain([0, Math.max(capacity, 1)]).range([iH, 0]);

    // Decorative grid
    g.append('g')
      .attr('stroke','#1e293b').attr('stroke-width', 0.5)
      .selectAll('line').data(y.ticks(5)).join('line')
        .attr('x1',0).attr('x2',iW)
        .attr('y1',d => y(d)).attr('y2',d => y(d));

    g.append('g')
      .attr('stroke','#1e293b').attr('stroke-width', 0.5)
      .selectAll('line').data(x.ticks(10)).join('line')
        .attr('x1',d => x(d)).attr('x2',d => x(d))
        .attr('y1',0).attr('y2',iH);

    // Axes
    g.append('g')
      .attr('transform',`translate(0,${iH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(() => ''))
      .call(ax => { 
        ax.select('.domain').attr('stroke','#334155').attr('stroke-width', 1.5); 
        ax.selectAll('line').attr('stroke','#334155'); 
      });

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => d))
      .call(ax => {
        ax.select('.domain').attr('stroke','#334155').attr('stroke-width', 1.5);
        ax.selectAll('line').attr('stroke','#334155');
        ax.selectAll('text')
          .attr('fill','#64748b')
          .attr('font-size','9px')
          .attr('font-weight','500')
          .attr('font-family',"'IBM Plex Mono', monospace");
      });

    // Step Area Chart for a modern "digital" look
    const area = d3.area()
      .x((_,i) => x(i)).y0(iH).y1(d => y(d))
      .curve(d3.curveStepAfter);

    g.append('path').datum(hist)
      .attr('fill','url(#lbg)').attr('d', area);

    // Step Line Chart
    const line = d3.line()
      .x((_,i) => x(i)).y(d => y(d))
      .curve(d3.curveStepAfter);

    g.append('path').datum(hist)
      .attr('fill','none')
      .attr('stroke','#60a5fa')
      .attr('stroke-width', 2.5)
      .attr('filter','url(#lbglow)')
      .attr('d', line);

    // Live pulsing dot
    const last = hist[hist.length - 1] ?? 0;
    const dotG = g.append('g').attr('transform', `translate(${x(HISTORY_LEN - 1)}, ${y(last)})`);
    
    dotG.append('circle')
      .attr('r', 6)
      .attr('fill','#60a5fa')
      .attr('opacity', 0.3)
      .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '4;10;4')
        .attr('dur', '1.5s')
        .attr('repeatCount', 'indefinite');

    dotG.append('circle')
      .attr('r', 3.5)
      .attr('fill','#fff')
      .attr('filter','url(#lbglow)');

    // Capacity line
    const cy = y(capacity);
    if (cy >= 0 && cy <= iH) {
      g.append('line')
        .attr('x1',0).attr('x2',iW).attr('y1',cy).attr('y2',cy)
        .attr('stroke','#f43f5e').attr('stroke-width',1.2)
        .attr('stroke-dasharray','4,3').attr('opacity',0.9);

      g.append('text')
        .attr('x', iW - 4).attr('y', cy - 5).attr('text-anchor','end')
        .attr('fill','#f43f5e').attr('font-size','9px').attr('font-weight','700')
        .attr('font-family',"'IBM Plex Mono', monospace")
        .text(`CAPACITY`);
    }
  }, [capacity]);

  useEffect(() => { renderRef.current = draw; }, [draw]);

  useEffect(() => {
    historyRef.current.push(data ?? 0);
    if (historyRef.current.length > HISTORY_LEN) historyRef.current.shift();
    renderRef.current?.();
  }, [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => renderRef.current?.());
    ro.observe(el);
    setTimeout(() => renderRef.current?.(), 100);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '120px' }} />
  );
};

export default RealtimeChart;
