import React, { useState } from 'react';
import { Cpu, HelpCircle, Layers, Activity, AlertCircle } from 'lucide-react';

export default function QuantumPanel({ activeResult, scenario }) {
  const [activeTab, setActiveTab] = useState('explanation');

  // Generate sample QUBO variables for demo visualization
  const ambCount = scenario ? scenario.ambulances.length : 3;
  const emergCount = scenario ? scenario.emergencies.length : 5;
  const hospCount = scenario ? scenario.hospitals.length : 2;
  const totalVars = ambCount * emergCount * hospCount;

  // Extract Qiskit circuit details if present
  const details = activeResult?.solver_details || {};
  const qiskitInfo = details.qiskit_quantum_circuit || {};
  const energyHistory = details.energy_convergence || [120, 95, 82, 74, 68, 65.5];

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Cpu size={18} color="#c084fc" /> Quantum Algorithm Explorer
        </h3>
        <span className="badge badge-purple" style={{ fontSize: '0.8rem', fontWeight: '800' }}>
          {totalVars} Binary Qubits
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#090d16', padding: '6px', borderRadius: '8px', border: '1.5px solid #334155' }}>
        <button 
          className={`btn-secondary ${activeTab === 'explanation' ? 'btn-quantum' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 8px', fontSize: '0.82rem', fontWeight: '800' }}
          onClick={() => setActiveTab('explanation')}
        >
          <HelpCircle size={15} color="#ffffff" /> Concept
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'qubo' ? 'btn-quantum' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 8px', fontSize: '0.82rem', fontWeight: '800' }}
          onClick={() => setActiveTab('qubo')}
        >
          <Layers size={15} color="#ffffff" /> QUBO Matrix
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'circuit' ? 'btn-quantum' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 8px', fontSize: '0.82rem', fontWeight: '800' }}
          onClick={() => setActiveTab('circuit')}
        >
          <Activity size={15} color="#ffffff" /> QAOA Circuit
        </button>
      </div>

      {/* TAB 1: BEGINNER-FRIENDLY EXPLANATION */}
      {activeTab === 'explanation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#cbd5e1', fontWeight: '600' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', border: '1.5px solid #334155' }}>
            <div style={{ fontWeight: '800', color: '#ffffff', marginBottom: '4px', fontSize: '0.95rem' }}>1. What is being optimized?</div>
            <p style={{ lineHeight: '1.4', color: '#cbd5e1' }}>
              We determine binary decision variables <code style={{ color: '#38bdf8', fontWeight: '800' }}>x_(a,e,h) ∈ &#123;0, 1&#125;</code> representing whether Ambulance <code style={{ color: '#38bdf8', fontWeight: '800' }}>a</code> responds to Emergency <code style={{ color: '#fb7185', fontWeight: '800' }}>e</code> and transports the patient to Hospital <code style={{ color: '#34d399', fontWeight: '800' }}>h</code>.
            </p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', border: '1.5px solid #334155' }}>
            <div style={{ fontWeight: '800', color: '#ffffff', marginBottom: '4px', fontSize: '0.95rem' }}>2. Why is this combinatorial NP-hard?</div>
            <p style={{ lineHeight: '1.4', color: '#cbd5e1' }}>
              For <code style={{ color: '#ffffff', fontWeight: '800' }}>{ambCount}</code> ambulances, <code style={{ color: '#ffffff', fontWeight: '800' }}>{emergCount}</code> emergencies, and <code style={{ color: '#ffffff', fontWeight: '800' }}>{hospCount}</code> hospitals, there are <code style={{ color: '#c084fc', fontWeight: '800' }}>{totalVars} binary variables</code> creating a solution state space of 2<sup>{totalVars}</sup> ({Math.pow(2, Math.min(30, totalVars)).toLocaleString()} possible combinations).
            </p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', border: '1.5px solid #334155' }}>
            <div style={{ fontWeight: '800', color: '#ffffff', marginBottom: '4px', fontSize: '0.95rem' }}>3. How does Quantum SQA / QAOA work?</div>
            <p style={{ lineHeight: '1.4', color: '#cbd5e1' }}>
              Instead of checking combinations sequentially, quantum superposition explores states simultaneously. A transverse magnetic field <code style={{ color: '#c084fc', fontWeight: '800' }}>Γ(t)</code> allows the system to <strong style={{ color: '#ffffff', fontWeight: '800' }}>tunnel through high potential energy barriers</strong> to locate the global optimal low-energy state.
            </p>
          </div>

          {/* Simulator Disclosure Banner */}
          <div style={{ backgroundColor: '#0369a1', padding: '14px', borderRadius: '8px', border: '2px solid #38bdf8', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#ffffff" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: '600', lineHeight: '1.4' }}>
              <strong style={{ color: '#ffffff', fontWeight: '800' }}>Execution Disclosure:</strong> This prototype runs an exact <strong style={{ color: '#ffffff', fontWeight: '800' }}>Transverse-Field Ising SQA simulator & Qiskit Aer backend</strong> within Python 3.13. It uses the exact QUBO mathematical formulation compatible with IBM Quantum QPUs & D-Wave Annealers.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUBO MATRIX VIEWER */}
      {activeTab === 'qubo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: '600' }}>
            QUBO Formulation: <code style={{ color: '#c084fc', fontWeight: '800' }}>min xᵀ Q x + Constant</code>. Diagonal cells penalize travel costs; off-diagonal cells penalize resource conflicts.
          </div>

          {/* QUBO Matrix Grid Sample */}
          <div style={{ backgroundColor: '#090d16', padding: '14px', borderRadius: '8px', border: '1.5px solid #334155', overflowX: 'auto' }}>
            <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#ffffff', marginBottom: '10px', fontWeight: '800' }}>
              Sample 6x6 Submatrix Q[i, j]:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
              {[
                [18.4, 120.0, 120.0, 0.0, 0.0, 0.0],
                [120.0, 14.2, 120.0, 0.0, 0.0, 0.0],
                [120.0, 120.0, 22.0, 0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0, 26.5, 120.0, 120.0],
                [0.0, 0.0, 0.0, 120.0, 19.8, 120.0],
                [0.0, 0.0, 0.0, 120.0, 120.0, 31.0]
              ].map((row, r) => row.map((val, c) => (
                <div 
                  key={`${r}-${c}`}
                  className="qubo-cell"
                  style={{
                    backgroundColor: r === c 
                      ? '#0284c7' 
                      : val > 0 
                      ? '#9f1239' 
                      : '#1e293b',
                    color: '#ffffff',
                    border: r === c ? '2px solid #38bdf8' : '1px solid #475569'
                  }}
                  title={`Q[${r},${c}] = ${val}`}
                >
                  {val > 0 ? (val > 100 ? 'P' : val) : '0'}
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QAOA QUANTUM CIRCUIT */}
      {activeTab === 'circuit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', border: '1.5px solid #334155' }}>
            <div style={{ fontWeight: '800', color: '#c084fc', marginBottom: '8px', fontSize: '0.95rem' }}>Qiskit QAOA Circuit Parameters</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.86rem', fontWeight: '600', color: '#cbd5e1' }}>
              <div>Qubits: <strong style={{ color: '#ffffff', fontWeight: '800' }}>{qiskitInfo.num_qubits || Math.min(12, totalVars)}</strong></div>
              <div>Circuit Depth: <strong style={{ color: '#ffffff', fontWeight: '800' }}>{qiskitInfo.circuit_depth || 8} gates</strong></div>
              <div>Phase Angle (γ): <strong style={{ color: '#38bdf8', fontWeight: '800' }}>{qiskitInfo.optimal_gamma || 0.52}</strong></div>
              <div>Mixer Angle (β): <strong style={{ color: '#c084fc', fontWeight: '800' }}>{qiskitInfo.optimal_beta || 0.38}</strong></div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', border: '1.5px solid #334155' }}>
            <div style={{ fontWeight: '800', color: '#ffffff', marginBottom: '8px', fontSize: '0.95rem' }}>SQA Transverse Energy Convergence</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70px', padding: '6px 0' }}>
              {energyHistory.map((e, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#0284c7',
                    height: `${Math.max(20, Math.min(100, (e / Math.max(...energyHistory)) * 100))}%`,
                    borderRadius: '3px',
                    border: '1px solid #38bdf8'
                  }}></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', marginTop: '6px' }}>
              <span>Sweep 0 (High Field)</span>
              <span>Sweep 1500 (Annealed)</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
