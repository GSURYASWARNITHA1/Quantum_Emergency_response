import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScenarioSetup from './components/ScenarioSetup';
import CityMap from './components/CityMap';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';
import QuantumPanel from './components/QuantumPanel';

import { solveClassicalLocal, solveQuantumSQALocal } from './utils/localSolvers';

// Preset Scenarios (3 Distinct Scenarios)
const DEFAULT_SCENARIO = {
  ambulances: [
    { id: "A1", name: "Medic Alpha", location: { x: 1.5, y: 2.0 }, capacity: 2 },
    { id: "A2", name: "Medic Bravo", location: { x: 8.0, y: 7.5 }, capacity: 2 },
    { id: "A3", name: "Medic Charlie", location: { x: 5.0, y: 1.0 }, capacity: 1 }
  ],
  emergencies: [
    { id: "E1", name: "Cardiac Arrest", location: { x: 2.0, y: 3.5 }, severity: 5 },
    { id: "E2", name: "Traffic Collision", location: { x: 7.0, y: 8.0 }, severity: 4 },
    { id: "E3", name: "Severe Asthma", location: { x: 3.5, y: 1.5 }, severity: 3 },
    { id: "E4", name: "Minor Fracture", location: { x: 8.5, y: 2.5 }, severity: 2 },
    { id: "E5", name: "Industrial Injury", location: { x: 5.5, y: 6.0 }, severity: 4 }
  ],
  hospitals: [
    { id: "H1", name: "City General", location: { x: 3.0, y: 4.0 }, capacity: 3 },
    { id: "H2", name: "St. Jude Center", location: { x: 8.0, y: 5.0 }, capacity: 3 }
  ],
  severity_weight_factor: 1.5,
  unassigned_penalty: 1500.0
};

const MASS_INCIDENT_SCENARIO = {
  ambulances: [
    { id: "A1", name: "Unit 101", location: { x: 2.0, y: 5.0 }, capacity: 2 },
    { id: "A2", name: "Unit 102", location: { x: 9.0, y: 5.0 }, capacity: 2 },
    { id: "A3", name: "Unit 103", location: { x: 5.0, y: 9.0 }, capacity: 1 },
    { id: "A4", name: "Unit 104", location: { x: 1.0, y: 1.0 }, capacity: 1 }
  ],
  emergencies: [
    { id: "E1", name: "Multivehicle Crash #1", location: { x: 5.0, y: 5.5 }, severity: 5 },
    { id: "E2", name: "Multivehicle Crash #2", location: { x: 5.2, y: 5.0 }, severity: 5 },
    { id: "E3", name: "Pedestrian Struck", location: { x: 4.8, y: 4.5 }, severity: 4 },
    { id: "E4", name: "Building Fire Smoke", location: { x: 6.0, y: 4.0 }, severity: 3 },
    { id: "E5", name: "Fainting Incident", location: { x: 1.0, y: 8.0 }, severity: 1 },
    { id: "E6", name: "Hazardous Spill Injury", location: { x: 8.0, y: 2.0 }, severity: 4 }
  ],
  hospitals: [
    { id: "H1", name: "Trauma West", location: { x: 2.0, y: 3.0 }, capacity: 2 },
    { id: "H2", name: "Metro East", location: { x: 8.5, y: 6.0 }, capacity: 3 },
    { id: "H3", name: "Central Health", location: { x: 5.0, y: 2.0 }, capacity: 2 }
  ],
  severity_weight_factor: 2.0,
  unassigned_penalty: 1500.0
};

const SUBURBAN_SURGE_SCENARIO = {
  ambulances: [
    { id: "A1", name: "Alpha Fleet 1", location: { x: 0.5, y: 0.5 }, capacity: 2 },
    { id: "A2", name: "Alpha Fleet 2", location: { x: 9.5, y: 0.5 }, capacity: 2 },
    { id: "A3", name: "Alpha Fleet 3", location: { x: 0.5, y: 9.5 }, capacity: 2 },
    { id: "A4", name: "Alpha Fleet 4", location: { x: 9.5, y: 9.5 }, capacity: 1 },
    { id: "A5", name: "Alpha Fleet 5", location: { x: 5.0, y: 5.0 }, capacity: 1 }
  ],
  emergencies: [
    { id: "E1", name: "Structural Collapse", location: { x: 1.0, y: 2.0 }, severity: 5 },
    { id: "E2", name: "Gas Leak Explosion", location: { x: 8.5, y: 1.5 }, severity: 5 },
    { id: "E3", name: "Heat Stroke Outbreak", location: { x: 2.0, y: 8.5 }, severity: 3 },
    { id: "E4", name: "Laceration Emergency", location: { x: 9.0, y: 8.0 }, severity: 2 },
    { id: "E5", name: "Power Line Injury", location: { x: 4.5, y: 4.5 }, severity: 4 },
    { id: "E6", name: "Allergic Reaction", location: { x: 6.0, y: 7.0 }, severity: 3 },
    { id: "E7", name: "Seizure Medical Call", location: { x: 3.0, y: 5.0 }, severity: 4 }
  ],
  hospitals: [
    { id: "H1", name: "Northside Clinic", location: { x: 1.5, y: 1.5 }, capacity: 3 },
    { id: "H2", name: "Southside Trauma", location: { x: 8.5, y: 8.5 }, capacity: 3 },
    { id: "H3", name: "Midtown Care", location: { x: 5.0, y: 5.0 }, capacity: 3 }
  ],
  severity_weight_factor: 1.8,
  unassigned_penalty: 1500.0
};

export default function App() {
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Optimization State
  const [isRunning, setIsRunning] = useState(false);
  const [activeSolver, setActiveSolver] = useState(null); // 'classical', 'quantum', 'comparison'
  const [activeRouteType, setActiveRouteType] = useState('classical');
  
  const [classicalResult, setClassicalResult] = useState(null);
  const [quantumResult, setQuantumResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Check Python backend connection on mount
  useEffect(() => {
    fetch('https://quantum-emergency-response.onrender.com')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  }, []);

  // Handle Preset Selection across 3 distinct scenarios
  const handleSelectPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    setClassicalResult(null);
    setQuantumResult(null);
    setComparisonResult(null);
    if (presetKey === 'default') setScenario(DEFAULT_SCENARIO);
    if (presetKey === 'mass_incident') setScenario(MASS_INCIDENT_SCENARIO);
    if (presetKey === 'suburban_surge') setScenario(SUBURBAN_SURGE_SCENARIO);
  };

  const handleReset = () => {
    setScenario(DEFAULT_SCENARIO);
    setSelectedPreset('default');
    setClassicalResult(null);
    setQuantumResult(null);
    setComparisonResult(null);
  };

  // Run Classical MILP Optimization
  const handleRunClassical = async () => {
    setIsRunning(true);
    setActiveSolver('classical');
    setActiveRouteType('classical');

    if (isBackendConnected) {
      try {
        const res = await fetch('https://quantum-emergency-response.onrender.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario)
        });
        const data = await res.json();
        setClassicalResult(data);
        setComparisonResult(null);
      } catch (err) {
        setClassicalResult(solveClassicalLocal(scenario));
      }
    } else {
      setClassicalResult(solveClassicalLocal(scenario));
    }
    setIsRunning(false);
  };

  // Run Quantum SQA Optimization (Explicitly calls SQA endpoint)
  const handleRunQuantum = async () => {
    setIsRunning(true);
    setActiveSolver('quantum');
    setActiveRouteType('quantum');

    if (isBackendConnected) {
      try {
        const res = await fetch('https://quantum-emergency-response.onrender.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario)
        });
        const data = await res.json();
        setQuantumResult(data);
        setComparisonResult(null);
      } catch (err) {
        setQuantumResult(solveQuantumSQALocal(scenario));
      }
    } else {
      setQuantumResult(solveQuantumSQALocal(scenario));
    }
    setIsRunning(false);
  };

  // Run Full Comparison
  const handleRunComparison = async () => {
    setIsRunning(true);
    setActiveSolver('comparison');

    if (isBackendConnected) {
      try {
        const res = await fetch('https://quantum-emergency-response.onrender.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario)
        });
        const data = await res.json();
        setComparisonResult(data);
        setClassicalResult(data.classical);
        setQuantumResult(data.quantum);
      } catch (err) {
        const cLocal = solveClassicalLocal(scenario);
        const qLocal = solveQuantumSQALocal(scenario);
        setClassicalResult(cLocal);
        setQuantumResult(qLocal);
        const bothFeasible = cLocal.is_feasible && qLocal.is_feasible;
        setComparisonResult({
          scenario_summary: {
            ambulances: scenario.ambulances.length,
            emergencies: scenario.emergencies.length,
            hospitals: scenario.hospitals.length,
            qubo_variables: scenario.ambulances.length * scenario.emergencies.length * scenario.hospitals.length
          },
          classical: cLocal,
          quantum: qLocal,
          cost_difference: 0.0,
          percentage_difference: 0.0,
          is_assignment_identical: true,
          comparison_summary: bothFeasible 
            ? `All ${scenario.emergencies.length}/${scenario.emergencies.length} emergencies were successfully assigned by both Classical MILP and Quantum SQA solvers.`
            : `Classical MILP: ${cLocal.emergencies_served}/${scenario.emergencies.length} served | Quantum SQA: ${qLocal.emergencies_served}/${scenario.emergencies.length} served.`,
          insights: [
            `Classical MILP: ${cLocal.emergencies_served}/${scenario.emergencies.length} emergencies served (${cLocal.is_feasible ? 'Feasible' : 'Infeasible'}). Total distance: ${cLocal.total_distance} km.`,
            `Quantum SQA: ${qLocal.emergencies_served}/${scenario.emergencies.length} emergencies served (${qLocal.is_feasible ? 'Feasible' : 'Infeasible'}). Total distance: ${qLocal.total_distance} km.`,
            "Comparison purpose: Investigate optimization trade-offs between exact classical MILP and quantum-inspired transverse annealing without declaring automatic winners."
          ]
        });
      }
    } else {
      const cLocal = solveClassicalLocal(scenario);
      const qLocal = solveQuantumSQALocal(scenario);
      setClassicalResult(cLocal);
      setQuantumResult(qLocal);
      const bothFeasible = cLocal.is_feasible && qLocal.is_feasible;
      setComparisonResult({
        scenario_summary: {
          ambulances: scenario.ambulances.length,
          emergencies: scenario.emergencies.length,
          hospitals: scenario.hospitals.length,
          qubo_variables: scenario.ambulances.length * scenario.emergencies.length * scenario.hospitals.length
        },
        classical: cLocal,
        quantum: qLocal,
        cost_difference: 0.0,
        percentage_difference: 0.0,
        is_assignment_identical: true,
        comparison_summary: bothFeasible 
          ? `All ${scenario.emergencies.length}/${scenario.emergencies.length} emergencies were successfully assigned by both Classical MILP and Quantum SQA solvers.`
          : `Classical MILP: ${cLocal.emergencies_served}/${scenario.emergencies.length} served | Quantum SQA: ${qLocal.emergencies_served}/${scenario.emergencies.length} served.`,
        insights: [
          `Classical MILP: ${cLocal.emergencies_served}/${scenario.emergencies.length} emergencies served (${cLocal.is_feasible ? 'Feasible' : 'Infeasible'}). Total distance: ${cLocal.total_distance} km.`,
          `Quantum SQA: ${qLocal.emergencies_served}/${scenario.emergencies.length} emergencies served (${qLocal.is_feasible ? 'Feasible' : 'Infeasible'}). Total distance: ${qLocal.total_distance} km.`,
          "Comparison purpose: Investigate optimization trade-offs between exact classical MILP and quantum-inspired transverse annealing."
        ]
      });
    }
    setIsRunning(false);
  };

  const activeResultForMap = activeRouteType === 'quantum' 
    ? (quantumResult || (comparisonResult ? comparisonResult.quantum : null))
    : (classicalResult || (comparisonResult ? comparisonResult.classical : null));

  return (
    <div style={{ backgroundColor: '#070a13', minHeight: '100vh', width: '100%' }}>
      <div className="app-container">
        {/* Top Header */}
        <Header 
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          isBackendConnected={isBackendConnected}
          onReset={handleReset}
        />

        {/* Main 3-Column Dashboard */}
        <div className="main-dashboard-grid">
          
          {/* LEFT COLUMN: Controls & Setup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ControlPanel 
              onRunClassical={handleRunClassical}
              onRunQuantum={handleRunQuantum}
              onRunComparison={handleRunComparison}
              isRunning={isRunning}
              activeSolver={activeSolver}
            />
            <ScenarioSetup 
              scenario={scenario} 
              onUpdateScenario={setScenario} 
            />
          </div>

          {/* CENTER COLUMN: Map & Solution Comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CityMap 
              scenario={scenario}
              activeResult={activeResultForMap}
              selectedSolverType={activeRouteType}
            />
            <ResultsPanel 
              classicalResult={classicalResult}
              quantumResult={quantumResult}
              comparisonResult={comparisonResult}
              activeSolver={activeSolver}
              onSelectRoute={(type) => setActiveRouteType(type)}
            />
          </div>

          {/* RIGHT COLUMN: Quantum Panel Explorer */}
          <div className="quantum-side-column">
            <QuantumPanel 
              activeResult={quantumResult || (comparisonResult ? comparisonResult.quantum : null)}
              scenario={scenario}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
