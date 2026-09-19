import React from 'react';
import { Activity, Cpu, Zap, RotateCcw } from 'lucide-react';

export default function Header({ selectedPreset, onSelectPreset, isBackendConnected, onReset }) {
  return (
    <header className="glass-panel" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#1e293b',
          border: '2px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
        }}>
          <Zap size={28} color="#38bdf8" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#38bdf8' }}>
              QUANTUM DISPATCH
            </h1>
            <span className="badge badge-purple">
              <Cpu size={14} color="#ffffff" /> Quantum Optimization Prototype
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px', fontWeight: '600' }}>
            Combinatorial Resource Allocation for Ambulances & Emergency Hospitals
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Connection Status */}
        <div className={`badge ${isBackendConnected ? 'badge-emerald' : 'badge-cyan'}`}>
          <Activity size={14} color="#ffffff" />
          {isBackendConnected ? 'FastAPI Python QPU Backend' : 'Browser Quantum Simulator'}
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: '700' }}>Scenario Preset:</span>
          <select 
            value={selectedPreset} 
            onChange={(e) => onSelectPreset(e.target.value)}
            style={{ cursor: 'pointer', fontWeight: '700', backgroundColor: '#090d16', color: '#ffffff', borderColor: '#38bdf8' }}
          >
            <option value="default">Standard City (3 Amb, 5 Emerg, 2 Hosp)</option>
            <option value="mass_incident">Highway Transit Pileup (4 Amb, 6 Emerg, 3 Hosp)</option>
            <option value="suburban_surge">Suburban Disaster Surge (5 Amb, 7 Emerg, 3 Hosp)</option>
          </select>
        </div>

        {/* Reset Button */}
        <button className="btn-secondary" onClick={onReset} title="Reset to default scenario">
          <RotateCcw size={14} color="#ffffff" /> Reset
        </button>
      </div>
    </header>
  );
}
