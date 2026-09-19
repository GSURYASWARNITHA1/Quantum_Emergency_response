import React, { useState } from 'react';
import { Truck, AlertTriangle, Building2, Plus, Trash2, MapPin, Sliders } from 'lucide-react';

export default function ScenarioSetup({ scenario, onUpdateScenario }) {
  const [activeTab, setActiveTab] = useState('emergencies');

  // Helpers to update entity lists
  const handleUpdateSeverity = (id, severity) => {
    const updated = scenario.emergencies.map(e => e.id === id ? { ...e, severity: parseInt(severity) } : e);
    onUpdateScenario({ ...scenario, emergencies: updated });
  };

  const handleRemoveEmergency = (id) => {
    onUpdateScenario({
      ...scenario,
      emergencies: scenario.emergencies.filter(e => e.id !== id)
    });
  };

  const handleAddEmergency = () => {
    const nextNum = scenario.emergencies.length + 1;
    const newEmerg = {
      id: `E${nextNum}_${Date.now().toString().slice(-3)}`,
      name: `Emergency #${nextNum}`,
      location: { 
        x: Number((Math.random() * 8 + 1).toFixed(1)), 
        y: Number((Math.random() * 8 + 1).toFixed(1)) 
      },
      severity: 3
    };
    onUpdateScenario({ ...scenario, emergencies: [...scenario.emergencies, newEmerg] });
  };

  const handleAddAmbulance = () => {
    const nextNum = scenario.ambulances.length + 1;
    const newAmb = {
      id: `A${nextNum}_${Date.now().toString().slice(-3)}`,
      name: `Ambulance Unit ${nextNum}`,
      location: { 
        x: Number((Math.random() * 8 + 1).toFixed(1)), 
        y: Number((Math.random() * 8 + 1).toFixed(1)) 
      },
      capacity: 2
    };
    onUpdateScenario({ ...scenario, ambulances: [...scenario.ambulances, newAmb] });
  };

  const handleRemoveAmbulance = (id) => {
    onUpdateScenario({ ...scenario, ambulances: scenario.ambulances.filter(a => a.id !== id) });
  };

  const handleAddHospital = () => {
    const nextNum = scenario.hospitals.length + 1;
    const newHosp = {
      id: `H${nextNum}_${Date.now().toString().slice(-3)}`,
      name: `Hospital #${nextNum}`,
      location: { 
        x: Number((Math.random() * 8 + 1).toFixed(1)), 
        y: Number((Math.random() * 8 + 1).toFixed(1)) 
      },
      capacity: 3
    };
    onUpdateScenario({ ...scenario, hospitals: [...scenario.hospitals, newHosp] });
  };

  const handleRemoveHospital = (id) => {
    onUpdateScenario({ ...scenario, hospitals: scenario.hospitals.filter(h => h.id !== id) });
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <Sliders size={18} color="#38bdf8" /> Scenario Configuration
        </h3>
        <span className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
          10x10 City Grid
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: '#090d16', padding: '6px', borderRadius: '8px', border: '1.5px solid #334155' }}>
        <button 
          className={`btn-secondary ${activeTab === 'emergencies' ? 'btn-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem', fontWeight: '800' }}
          onClick={() => setActiveTab('emergencies')}
        >
          <AlertTriangle size={15} color="#ffffff" /> Emergencies ({scenario.emergencies.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'ambulances' ? 'btn-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem', fontWeight: '800' }}
          onClick={() => setActiveTab('ambulances')}
        >
          <Truck size={15} color="#ffffff" /> Ambulances ({scenario.ambulances.length})
        </button>
        <button 
          className={`btn-secondary ${activeTab === 'hospitals' ? 'btn-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem', fontWeight: '800' }}
          onClick={() => setActiveTab('hospitals')}
        >
          <Building2 size={15} color="#ffffff" /> Hospitals ({scenario.hospitals.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ maxHeight: '440px', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Emergencies List */}
        {activeTab === 'emergencies' && (
          <>
            {scenario.emergencies.map((e) => (
              <div key={e.id} style={{ backgroundColor: '#1e293b', border: '1.5px solid #334155', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>{e.name}</span>
                  <button onClick={() => handleRemoveEmergency(e.id)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer' }} title="Remove Emergency">
                    <Trash2 size={16} color="#fb7185" />
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600' }}>
                    <MapPin size={14} color="#38bdf8" /> Grid: ({e.location.x}, {e.location.y})
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '700' }}>Priority:</span>
                    <select 
                      value={e.severity} 
                      onChange={(evt) => handleUpdateSeverity(e.id, evt.target.value)}
                      className={`severity-${e.severity}`}
                      style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', backgroundColor: '#090d16', color: '#ffffff' }}
                    >
                      <option value="1">1 - Low</option>
                      <option value="2">2 - Moderate</option>
                      <option value="3">3 - Serious</option>
                      <option value="4">4 - Severe</option>
                      <option value="5">5 - Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-secondary" onClick={handleAddEmergency} style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', marginTop: '4px', fontWeight: '800' }}>
              <Plus size={16} color="#ffffff" /> Add Emergency Location
            </button>
          </>
        )}

        {/* Ambulances List */}
        {activeTab === 'ambulances' && (
          <>
            {scenario.ambulances.map((a) => (
              <div key={a.id} style={{ backgroundColor: '#1e293b', border: '1.5px solid #334155', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>{a.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: '12px', marginTop: '4px', fontWeight: '600' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color="#38bdf8" /> Grid: ({a.location.x}, {a.location.y})</span>
                    <span style={{ color: '#38bdf8', fontWeight: '700' }}>Cap: {a.capacity} patients</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveAmbulance(a.id)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer' }} title="Remove Ambulance">
                  <Trash2 size={16} color="#fb7185" />
                </button>
              </div>
            ))}
            <button className="btn-secondary" onClick={handleAddAmbulance} style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', marginTop: '4px', fontWeight: '800' }}>
              <Plus size={16} color="#ffffff" /> Add Ambulance Unit
            </button>
          </>
        )}

        {/* Hospitals List */}
        {activeTab === 'hospitals' && (
          <>
            {scenario.hospitals.map((h) => (
              <div key={h.id} style={{ backgroundColor: '#1e293b', border: '1.5px solid #334155', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>{h.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: '12px', marginTop: '4px', fontWeight: '600' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color="#34d399" /> Grid: ({h.location.x}, {h.location.y})</span>
                    <span style={{ color: '#34d399', fontWeight: '700' }}>Beds: {h.capacity}</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveHospital(h.id)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer' }} title="Remove Hospital">
                  <Trash2 size={16} color="#fb7185" />
                </button>
              </div>
            ))}
            <button className="btn-secondary" onClick={handleAddHospital} style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', marginTop: '4px', fontWeight: '800' }}>
              <Plus size={16} color="#ffffff" /> Add Hospital Facility
            </button>
          </>
        )}

      </div>
    </div>
  );
}
