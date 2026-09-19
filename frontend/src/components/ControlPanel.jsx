import React from 'react';
import { Play, Cpu, Layers, Loader2, Sparkles } from 'lucide-react';

export default function ControlPanel({ onRunClassical, onRunQuantum, onRunComparison, isRunning, activeSolver }) {
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <Sparkles size={20} color="#c084fc" /> Optimization Controls
        </h3>
        {isRunning && (
          <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
            <Loader2 size={14} className="pulse-emergency" color="#ffffff" /> Executing {activeSolver ? activeSolver.toUpperCase() : 'OPTIMIZATION'}...
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: '600', lineHeight: '1.4' }}>
        Compare exact classical integer linear programming (MILP) against Simulated Quantum Annealing (SQA) & Qiskit QAOA formulations.
      </p>

      {/* Trigger Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <button 
          className="btn-primary" 
          onClick={onRunClassical} 
          disabled={isRunning}
          style={{ opacity: isRunning ? 0.7 : 1 }}
        >
          <Play size={16} color="#ffffff" /> Run Classical MILP
        </button>

        <button 
          className="btn-quantum" 
          onClick={onRunQuantum} 
          disabled={isRunning}
          style={{ opacity: isRunning ? 0.7 : 1 }}
        >
          <Cpu size={16} color="#ffffff" /> Run Quantum SQA
        </button>

        <button 
          className="btn-secondary" 
          onClick={onRunComparison} 
          disabled={isRunning}
          style={{ 
            opacity: isRunning ? 0.7 : 1,
            backgroundColor: '#1e293b',
            border: '2px solid #c084fc',
            color: '#ffffff',
            fontWeight: '800'
          }}
        >
          <Layers size={16} color="#c084fc" /> Run Full Comparison
        </button>
      </div>
    </div>
  );
}
