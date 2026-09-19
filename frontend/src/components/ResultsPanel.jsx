import React from 'react';
import { CheckCircle2, AlertOctagon, ArrowRight, Zap, Scale, ShieldCheck } from 'lucide-react';

export default function ResultsPanel({ classicalResult, quantumResult, comparisonResult, activeSolver, onSelectRoute }) {
  if (!classicalResult && !quantumResult && !comparisonResult) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', backgroundColor: '#0f172a', border: '1.5px solid #334155' }}>
        <Zap size={38} color="#38bdf8" style={{ marginBottom: '12px' }} />
        <h4 style={{ color: '#ffffff', marginBottom: '6px', fontSize: '1.15rem', fontWeight: '800' }}>Ready for Optimization</h4>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>Select an algorithm above and click "RUN OPTIMIZATION" to dispatch ambulances.</p>
      </div>
    );
  }

  // Determine active/comparison results
  const classical = comparisonResult ? comparisonResult.classical : classicalResult;
  const quantum = comparisonResult ? comparisonResult.quantum : quantumResult;
  const mainResult = comparisonResult ? comparisonResult.classical : (classicalResult || quantumResult);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* RESULT SUMMARY BANNER (Mandatory Summary Text) */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderLeft: '5px solid #38bdf8', backgroundColor: '#0f172a', border: '1.5px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: '#ffffff' }}>
              <ShieldCheck size={22} color="#34d399" /> Result Summary
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38bdf8', marginTop: '4px' }}>
              {comparisonResult ? comparisonResult.comparison_summary : (mainResult ? mainResult.result_summary : 'Optimization Executed.')}
            </div>
          </div>

          {/* Feasibility Status Badge */}
          {mainResult && (
            <div className={`badge ${mainResult.is_feasible ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              {mainResult.is_feasible ? <CheckCircle2 size={16} /> : <AlertOctagon size={16} />}
              {mainResult.status}
            </div>
          )}
        </div>

        {/* Detailed Breakdown Lines */}
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1.5px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#ffffff', fontWeight: '600' }}>
          {classical && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#38bdf8', fontWeight: '800' }}>Classical MILP:</span>
              <span>{classical.result_summary}</span>
            </div>
          )}
          {quantum && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#c084fc', fontWeight: '800' }}>Quantum SQA:</span>
              <span>{quantum.result_summary}</span>
            </div>
          )}
        </div>

        {/* Comparison Scientific Insights if benchmark was run */}
        {comparisonResult && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '500', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} color="#c084fc" /> Scientific Comparison & Optimization Trade-offs:
            </div>
            {comparisonResult.insights.map((insight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '4px' }}>
                <CheckCircle2 size={15} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-Side Solution Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* CLASSICAL SOLVER CARD */}
        {classical && (
          <div 
            className="glass-panel" 
            style={{ 
              padding: '20px', 
              borderTop: '5px solid #38bdf8',
              backgroundColor: '#0f172a',
              cursor: 'pointer'
            }}
            onClick={() => onSelectRoute('classical')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-cyan">Classical Algorithm</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>{classical.solver_name}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>Runtime</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#38bdf8', fontSize: '1.05rem' }}>{classical.execution_time_ms} ms</div>
              </div>
            </div>

            {/* Standardized Common Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1.5px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Emergencies Served</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: classical.is_feasible ? '#34d399' : '#fb7185' }}>
                  {classical.emergencies_served} / {classical.emergencies_total}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Total Distance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>{classical.total_distance} km</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Avg Response</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#38bdf8' }}>{classical.avg_response_time_min} mins</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>High Severity (S4-S5)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fde047' }}>{classical.high_severity_served} served</div>
              </div>
            </div>

            {/* Assignments List */}
            <h5 style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', marginBottom: '8px', fontWeight: '800' }}>
              Dispatched Routes ({classical.assignments.length}):
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {classical.assignments.map((assign, idx) => (
                <div key={idx} style={{ backgroundColor: '#1e293b', border: '1.5px solid #334155', padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#38bdf8', fontWeight: '800' }}>{assign.ambulance_name}</span>
                    <ArrowRight size={14} color="#ffffff" style={{ margin: '0 6px' }} />
                    <span className={`severity-${assign.severity}`} style={{ padding: '3px 7px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '800' }}>{assign.emergency_name}</span>
                    <ArrowRight size={14} color="#ffffff" style={{ margin: '0 6px' }} />
                    <span style={{ color: '#34d399', fontWeight: '800' }}>{assign.hospital_name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ffffff', fontWeight: '800' }}>c={assign.weighted_cost}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUANTUM SOLVER CARD */}
        {quantum && (
          <div 
            className="glass-panel" 
            style={{ 
              padding: '20px', 
              borderTop: '5px solid #c084fc',
              backgroundColor: '#0f172a',
              cursor: 'pointer'
            }}
            onClick={() => onSelectRoute('quantum')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-purple">Quantum Solver</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>{quantum.solver_name}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>Runtime</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#c084fc', fontSize: '1.05rem' }}>{quantum.execution_time_ms} ms</div>
              </div>
            </div>

            {/* Standardized Common Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1.5px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Emergencies Served</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: quantum.is_feasible ? '#34d399' : '#fb7185' }}>
                  {quantum.emergencies_served} / {quantum.emergencies_total}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Total Distance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>{quantum.total_distance} km</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Avg Response</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#c084fc' }}>{quantum.avg_response_time_min} mins</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>High Severity (S4-S5)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fde047' }}>{quantum.high_severity_served} served</div>
              </div>
            </div>

            {/* Assignments List */}
            <h5 style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ffffff', marginBottom: '8px', fontWeight: '800' }}>
              Dispatched Routes ({quantum.assignments.length}):
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {quantum.assignments.map((assign, idx) => (
                <div key={idx} style={{ backgroundColor: '#1e293b', border: '1.5px solid #334155', padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#c084fc', fontWeight: '800' }}>{assign.ambulance_name}</span>
                    <ArrowRight size={14} color="#ffffff" style={{ margin: '0 6px' }} />
                    <span className={`severity-${assign.severity}`} style={{ padding: '3px 7px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '800' }}>{assign.emergency_name}</span>
                    <ArrowRight size={14} color="#ffffff" style={{ margin: '0 6px' }} />
                    <span style={{ color: '#34d399', fontWeight: '800' }}>{assign.hospital_name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ffffff', fontWeight: '800' }}>c={assign.weighted_cost}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
