import React, { useState } from 'react';
import { Map, Truck, AlertTriangle, Building2 } from 'lucide-react';

export default function CityMap({ scenario, activeResult, selectedSolverType }) {
  const [hoveredEntity, setHoveredEntity] = useState(null);

  // SVG grid sizing
  const width = 600;
  const height = 500;
  const padding = 40;
  const gridMax = 10;

  const mapX = (val) => padding + (val / gridMax) * (width - 2 * padding);
  const mapY = (val) => padding + (val / gridMax) * (height - 2 * padding);

  // Route colors for active algorithm assignments
  const routeColors = ['#38bdf8', '#c084fc', '#fde047', '#34d399', '#fb7185', '#818cf8'];

  // Match assignments from active result
  const assignments = activeResult ? activeResult.assignments : [];

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            <Map size={20} color="#38bdf8" /> City Emergency Grid Map
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '2px', fontWeight: '500' }}>
            Real-time emergency locations & assigned response routes ({selectedSolverType ? selectedSolverType.toUpperCase() : 'NO ROUTE ACTIVE'})
          </p>
        </div>

        {/* Map Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', fontWeight: '700', background: 'rgba(15, 23, 42, 0.95)', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8' }}>
            <Truck size={14} /> Ambulance
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fb7185' }}>
            <AlertTriangle size={14} /> Emergency
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399' }}>
            <Building2 size={14} /> Hospital
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div style={{ width: '100%', height: '480px', background: '#090d16', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', overflow: 'hidden', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            </pattern>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* City Grid Avenues */}
          {[1, 3, 5, 7, 9].map((gridVal) => (
            <React.Fragment key={gridVal}>
              <line x1={mapX(gridVal)} y1={padding} x2={mapX(gridVal)} y2={height - padding} stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
              <line x1={padding} y1={mapY(gridVal)} x2={width - padding} y2={mapY(gridVal)} stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
            </React.Fragment>
          ))}

          {/* Axis Labels */}
          <text x={width / 2} y={height - 10} fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle">City Grid X-Axis (km)</text>
          <text x={14} y={height / 2} fill="#cbd5e1" fontSize="11" fontWeight="600" textAnchor="middle" transform={`rotate(-90, 14, ${height / 2})`}>City Grid Y-Axis (km)</text>

          {/* DRAW ANIMATED ROUTES IF ACTIVE RESULT IS SELECTED */}
          {assignments.map((assign, idx) => {
            const amb = scenario.ambulances.find(a => a.id === assign.ambulance_id);
            const emerg = scenario.emergencies.find(e => e.id === assign.emergency_id);
            const hosp = scenario.hospitals.find(h => h.id === assign.hospital_id);

            if (!amb || !emerg || !hosp) return null;

            const color = routeColors[idx % routeColors.length];
            const ambX = mapX(amb.location.x);
            const ambY = mapY(amb.location.y);
            const emX = mapX(emerg.location.x);
            const emY = mapY(emerg.location.y);
            const hoX = mapX(hosp.location.x);
            const hoY = mapY(hosp.location.y);

            return (
              <g key={`route-${idx}`}>
                {/* Leg 1: Ambulance -> Emergency */}
                <line 
                  x1={ambX} y1={ambY} x2={emX} y2={emY} 
                  stroke={color} strokeWidth="3" strokeOpacity="0.9" 
                  className="route-path-animated"
                />
                {/* Leg 2: Emergency -> Hospital */}
                <line 
                  x1={emX} y1={emY} x2={hoX} y2={hoY} 
                  stroke={color} strokeWidth="2.5" strokeOpacity="0.8" strokeDasharray="5 5"
                />
              </g>
            );
          })}

          {/* DRAW HOSPITALS */}
          {scenario.hospitals.map((hosp) => {
            const cx = mapX(hosp.location.x);
            const cy = mapY(hosp.location.y);
            return (
              <g key={hosp.id} onMouseEnter={() => setHoveredEntity(hosp)} onMouseLeave={() => setHoveredEntity(null)} style={{ cursor: 'pointer' }}>
                <rect x={cx - 14} y={cy - 14} width="28" height="28" rx="6" fill="#10b981" fillOpacity="0.35" stroke="#34d399" strokeWidth="2" />
                <text x={cx} y={cy + 4} fill="#34d399" fontSize="15" fontWeight="bold" textAnchor="middle">+</text>
                <text x={cx} y={cy + 25} fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">{hosp.name}</text>
              </g>
            );
          })}

          {/* DRAW AMBULANCES */}
          {scenario.ambulances.map((amb) => {
            const cx = mapX(amb.location.x);
            const cy = mapY(amb.location.y);
            return (
              <g key={amb.id} onMouseEnter={() => setHoveredEntity(amb)} onMouseLeave={() => setHoveredEntity(null)} style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r="15" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="2" filter="url(#glow-cyan)" />
                <circle cx={cx} cy={cy} r="7" fill="#38bdf8" />
                <text x={cx} y={cy - 18} fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">{amb.name}</text>
              </g>
            );
          })}

          {/* DRAW EMERGENCIES */}
          {scenario.emergencies.map((emerg) => {
            const cx = mapX(emerg.location.x);
            const cy = mapY(emerg.location.y);
            const isCritical = emerg.severity >= 4;

            return (
              <g key={emerg.id} onMouseEnter={() => setHoveredEntity(emerg)} onMouseLeave={() => setHoveredEntity(null)} style={{ cursor: 'pointer' }}>
                {/* Pulse ring for high severity */}
                {isCritical && (
                  <circle cx={cx} cy={cy} r="22" fill="none" stroke="#f43f5e" strokeWidth="2" className="pulse-emergency" />
                )}
                <circle cx={cx} cy={cy} r="13" fill={emerg.severity >= 4 ? "#f43f5e" : "#eab308"} fillOpacity="0.9" stroke="#ffffff" strokeWidth="2" />
                <text x={cx} y={cy + 4} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">S{emerg.severity}</text>
                <text x={cx} y={cy + 25} fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">{emerg.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredEntity && (
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1.5px solid var(--cyan-primary)',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '0.92rem' }}>{hoveredEntity.name}</div>
            <div>Grid Coordinates: ({hoveredEntity.location.x}, {hoveredEntity.location.y})</div>
            {hoveredEntity.severity && <div>Severity Level: {hoveredEntity.severity}/5</div>}
            {hoveredEntity.capacity && <div>Capacity: {hoveredEntity.capacity}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
