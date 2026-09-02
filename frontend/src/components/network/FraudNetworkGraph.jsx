import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, AlertTriangle, Monitor, Mail, Globe, Loader2 } from 'lucide-react';
import { fetchFraudNetwork } from '../../services/api';

// Force-directed graph simulation using Canvas 2D
function useForceSimulation(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});
  const frameRef = useRef();
  const velocities = useRef({});

  useEffect(() => {
    if (!nodes.length) return;

    // Initialize positions randomly
    const pos = {};
    const vel = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = n.type === 'transaction' ? 180 + Math.random() * 120 : 60 + Math.random() * 40;
      pos[n.id] = {
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 80,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 80,
      };
      vel[n.id] = { x: 0, y: 0 };
    });
    velocities.current = vel;

    let iteration = 0;
    const maxIter = 200;

    function tick() {
      iteration++;
      const damping = 0.92;
      const repulsion = 800;
      const attraction = 0.005;
      const centerGravity = 0.01;

      const nodeArr = Object.keys(pos);

      // Repulsion between all nodes
      for (let i = 0; i < nodeArr.length; i++) {
        for (let j = i + 1; j < nodeArr.length; j++) {
          const a = pos[nodeArr[i]];
          const b = pos[nodeArr[j]];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          vel[nodeArr[i]].x += fx;
          vel[nodeArr[i]].y += fy;
          vel[nodeArr[j]].x -= fx;
          vel[nodeArr[j]].y -= fy;
        }
      }

      // Attraction along edges
      edges.forEach((e) => {
        const a = pos[e.source];
        const b = pos[e.target];
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        vel[e.source].x += fx;
        vel[e.source].y += fy;
        vel[e.target].x -= fx;
        vel[e.target].y -= fy;
      });

      // Center gravity
      nodeArr.forEach((id) => {
        vel[id].x += (width / 2 - pos[id].x) * centerGravity;
        vel[id].y += (height / 2 - pos[id].y) * centerGravity;
      });

      // Apply velocities with damping
      nodeArr.forEach((id) => {
        vel[id].x *= damping;
        vel[id].y *= damping;
        pos[id].x += vel[id].x;
        pos[id].y += vel[id].y;
        // Keep within bounds
        pos[id].x = Math.max(30, Math.min(width - 30, pos[id].x));
        pos[id].y = Math.max(30, Math.min(height - 30, pos[id].y));
      });

      setPositions({ ...pos });

      if (iteration < maxIter) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [nodes, edges, width, height]);

  return positions;
}

const NODE_COLORS = {
  CRITICAL: '#f43f5e',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981',
};

const TYPE_ICONS = {
  ip_cluster: '🌐',
  device_cluster: '💻',
  email_cluster: '📧',
  destination_cluster: '🌍',
};

export default function FraudNetworkGraph() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 900, h: 520 });

  useEffect(() => {
    fetchFraudNetwork().then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDims({ w: rect.width, h: 520 });
    }
  }, [data]);

  const nodes = data?.nodes || [];
  const edges = data?.edges || [];
  const stats = data?.stats || {};

  const positions = useForceSimulation(nodes, edges, dims.w, dims.h);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nodes.length || !Object.keys(positions).length) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dims.w, dims.h);

    // Draw edges
    edges.forEach((e) => {
      const a = positions[e.source];
      const b = positions[e.target];
      if (!a || !b) return;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      const edgeColors = {
        shared_ip: 'rgba(99, 102, 241, 0.12)',
        shared_device: 'rgba(244, 63, 94, 0.12)',
        shared_email: 'rgba(234, 179, 8, 0.12)',
        shared_destination: 'rgba(249, 115, 22, 0.12)',
      };
      ctx.strokeStyle = edgeColors[e.type] || 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((n) => {
      const p = positions[n.id];
      if (!p) return;

      const isHub = n.type !== 'transaction';
      const radius = isHub ? 8 : Math.max(2.5, n.risk_score * 5);
      const color = NODE_COLORS[n.risk_level] || '#64748b';

      // Glow for critical nodes
      if (n.risk_level === 'CRITICAL') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + 4, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, radius, p.x, p.y, radius + 6);
        glow.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
        glow.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Hub nodes get a diamond shape
      if (isHub) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - radius);
        ctx.lineTo(p.x + radius, p.y);
        ctx.lineTo(p.x, p.y + radius);
        ctx.lineTo(p.x - radius, p.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    // Draw hovered node info
    if (hoveredNode) {
      const n = nodes.find((x) => x.id === hoveredNode);
      const p = positions[hoveredNode];
      if (n && p) {
        ctx.fillStyle = 'rgba(18, 20, 28, 0.95)';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        const tw = 160;
        const th = 52;
        const tx = Math.min(p.x + 12, dims.w - tw - 10);
        const ty = Math.max(p.y - th / 2, 10);
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, th, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(n.label || n.id, tx + 8, ty + 16);
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = NODE_COLORS[n.risk_level] || '#94a3b8';
        ctx.fillText(`${n.risk_level} — ${(n.risk_score * 100).toFixed(0)}%`, tx + 8, ty + 30);
        if (n.amount) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`$${n.amount.toLocaleString()} · ${n.category}`, tx + 8, ty + 44);
        }
        if (n.count) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`${n.count} linked transactions`, tx + 8, ty + 44);
        }
      }
    }
  }, [positions, hoveredNode, nodes, edges, dims]);

  // Mouse interaction
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let closest = null;
    let closestDist = 20;
    nodes.forEach((n) => {
      const p = positions[n.id];
      if (!p) return;
      const d = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
      if (d < closestDist) {
        closest = n.id;
        closestDist = d;
      }
    });
    setHoveredNode(closest);
  }, [nodes, positions]);

  if (loading) {
    return (
      <div className="pro-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Loader2 size={20} className="spin" style={{ marginRight: 8 }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Building fraud network topology...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats Strip */}
      <div className="grid-4">
        {[
          { label: 'Total Nodes', value: stats.total_nodes || 0, color: '#818cf8' },
          { label: 'Hub Clusters', value: stats.hub_nodes || 0, color: '#f97316' },
          { label: 'Edge Links', value: stats.total_edges || 0, color: '#94a3b8' },
          { label: 'Ring Suspects', value: stats.suspected_ring_members || 0, color: '#f43f5e' },
        ].map((s, i) => (
          <div key={i} className="pro-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color }}>
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Canvas Graph */}
      <div className="pro-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pro-card-title">
              <Network size={14} color="#818cf8" />
              <span>Fraud Ring Network Topology</span>
            </div>
            <div className="pro-card-subtitle">
              Force-directed graph of linked entities — shared IPs, devices, email domains, and cross-border destinations
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { color: '#f43f5e', label: 'Critical' },
              { color: '#f97316', label: 'High' },
              { color: '#eab308', label: 'Medium' },
              { color: '#10b981', label: 'Low' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, transform: 'rotate(45deg)', background: '#818cf8' }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Hub</span>
            </div>
          </div>
        </div>

        <div ref={containerRef} style={{ position: 'relative', background: '#08090d' }}>
          <canvas
            ref={canvasRef}
            width={dims.w}
            height={dims.h}
            style={{ width: '100%', height: dims.h, cursor: hoveredNode ? 'pointer' : 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => {
              if (hoveredNode) setSelectedNode(hoveredNode === selectedNode ? null : hoveredNode);
            }}
          />
        </div>
      </div>

      {/* Cluster Breakdown */}
      <div className="grid-3">
        {[
          { icon: Globe, label: 'IP Subnet Clusters', count: nodes.filter((n) => n.type === 'ip_cluster').length, desc: 'Transactions sharing suspicious IP ranges', color: '#818cf8' },
          { icon: Monitor, label: 'Device Fingerprint Rings', count: nodes.filter((n) => n.type === 'device_cluster').length, desc: 'Linked device / VPN fingerprint groups', color: '#f43f5e' },
          { icon: Mail, label: 'Email Domain Clusters', count: nodes.filter((n) => n.type === 'email_cluster').length, desc: 'Disposable and shared email domain groups', color: '#eab308' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="pro-card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={14} color={c.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: c.color, marginBottom: 4 }}>
                {c.count}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
