from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

from app.models.scenario import ScenarioConfig, SolverResult, ComparisonResult, Location, Ambulance, Emergency, Hospital
from app.solvers.classical import solve_classical_milp, solve_greedy_heuristic
from app.solvers.quantum_sqa import solve_simulated_quantum_annealing, solve_qiskit_qaoa_simulation
from app.solvers.qubo_builder import QUBOBuilder

app = FastAPI(
    title="Quantum Emergency Response Optimization API",
    description="Backend API comparing Classical MILP vs Simulated Quantum Annealing (SQA) / Qiskit QAOA for emergency resource allocation.",
    version="1.2.0"
)

# Enable CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Quantum Emergency Response Engine"}

@app.get("/api/presets")
def get_preset_scenarios() -> Dict[str, Any]:
    """Provides sample hackathon emergency scenarios."""
    return {
        "default": {
            "name": "Standard City Emergency (Default)",
            "description": "3 Ambulances, 5 Emergencies, 2 Hospitals",
            "scenario": {
                "ambulances": [
                    {"id": "A1", "name": "Medic Alpha", "location": {"x": 1.5, "y": 2.0}, "capacity": 2},
                    {"id": "A2", "name": "Medic Bravo", "location": {"x": 8.0, "y": 7.5}, "capacity": 2},
                    {"id": "A3", "name": "Medic Charlie", "location": {"x": 5.0, "y": 1.0}, "capacity": 1}
                ],
                "emergencies": [
                    {"id": "E1", "name": "Cardiac Arrest (Downtown)", "location": {"x": 2.0, "y": 3.5}, "severity": 5},
                    {"id": "E2", "name": "Traffic Collision (Highway)", "location": {"x": 7.0, "y": 8.0}, "severity": 4},
                    {"id": "E3", "name": "Severe Asthma (Suburbs)", "location": {"x": 3.5, "y": 1.5}, "severity": 3},
                    {"id": "E4", "name": "Minor Fracture (Mall)", "location": {"x": 8.5, "y": 2.5}, "severity": 2},
                    {"id": "E5", "name": "Industrial Injury (Port)", "location": {"x": 5.5, "y": 6.0}, "severity": 4}
                ],
                "hospitals": [
                    {"id": "H1", "name": "City General Hospital", "location": {"x": 3.0, "y": 4.0}, "capacity": 3},
                    {"id": "H2", "name": "St. Jude Medical Center", "location": {"x": 8.0, "y": 5.0}, "capacity": 3}
                ],
                "severity_weight_factor": 1.5,
                "unassigned_penalty": 1500.0
            }
        },
        "mass_incident": {
            "name": "Highway Transit Pileup",
            "description": "4 Ambulances, 6 Emergencies, 3 Hospitals - High Density Corridor",
            "scenario": {
                "ambulances": [
                    {"id": "A1", "name": "Unit 101", "location": {"x": 2.0, "y": 5.0}, "capacity": 2},
                    {"id": "A2", "name": "Unit 102", "location": {"x": 9.0, "y": 5.0}, "capacity": 2},
                    {"id": "A3", "name": "Unit 103", "location": {"x": 5.0, "y": 9.0}, "capacity": 1},
                    {"id": "A4", "name": "Unit 104", "location": {"x": 1.0, "y": 1.0}, "capacity": 1}
                ],
                "emergencies": [
                    {"id": "E1", "name": "Multivehicle Crash #1", "location": {"x": 5.0, "y": 5.5}, "severity": 5},
                    {"id": "E2", "name": "Multivehicle Crash #2", "location": {"x": 5.2, "y": 5.0}, "severity": 5},
                    {"id": "E3", "name": "Pedestrian Struck", "location": {"x": 4.8, "y": 4.5}, "severity": 4},
                    {"id": "E4", "name": "Building Fire Smoke", "location": {"x": 6.0, "y": 4.0}, "severity": 3},
                    {"id": "E5", "name": "Fainting Incident", "location": {"x": 1.0, "y": 8.0}, "severity": 1},
                    {"id": "E6", "name": "Hazardous Spill Injury", "location": {"x": 8.0, "y": 2.0}, "severity": 4}
                ],
                "hospitals": [
                    {"id": "H1", "name": "Trauma Center West", "location": {"x": 2.0, "y": 3.0}, "capacity": 2},
                    {"id": "H2", "name": "Metro Emergency East", "location": {"x": 8.5, "y": 6.0}, "capacity": 3},
                    {"id": "H3", "name": "Central Health Hub", "location": {"x": 5.0, "y": 2.0}, "capacity": 2}
                ],
                "severity_weight_factor": 2.0,
                "unassigned_penalty": 1500.0
            }
        },
        "suburban_surge": {
            "name": "Suburban Disaster Surge",
            "description": "5 Ambulances, 7 Emergencies, 3 Hospitals - Wide Grid Coverage",
            "scenario": {
                "ambulances": [
                    {"id": "A1", "name": "Alpha Fleet 1", "location": {"x": 0.5, "y": 0.5}, "capacity": 2},
                    {"id": "A2", "name": "Alpha Fleet 2", "location": {"x": 9.5, "y": 0.5}, "capacity": 2},
                    {"id": "A3", "name": "Alpha Fleet 3", "location": {"x": 0.5, "y": 9.5}, "capacity": 2},
                    {"id": "A4", "name": "Alpha Fleet 4", "location": {"x": 9.5, "y": 9.5}, "capacity": 1},
                    {"id": "A5", "name": "Alpha Fleet 5", "location": {"x": 5.0, "y": 5.0}, "capacity": 1}
                ],
                "emergencies": [
                    {"id": "E1", "name": "Structural Collapse", "location": {"x": 1.0, "y": 2.0}, "severity": 5},
                    {"id": "E2", "name": "Gas Leak Explosion", "location": {"x": 8.5, "y": 1.5}, "severity": 5},
                    {"id": "E3", "name": "Heat Stroke Outbreak", "location": {"x": 2.0, "y": 8.5}, "severity": 3},
                    {"id": "E4", "name": "Laceration Emergency", "location": {"x": 9.0, "y": 8.0}, "severity": 2},
                    {"id": "E5", "name": "Power Line Injury", "location": {"x": 4.5, "y": 4.5}, "severity": 4},
                    {"id": "E6", "name": "Allergic Reaction", "location": {"x": 6.0, "y": 7.0}, "severity": 3},
                    {"id": "E7", "name": "Seizure Medical Call", "location": {"x": 3.0, "y": 5.0}, "severity": 4}
                ],
                "hospitals": [
                    {"id": "H1", "name": "Northside Clinic", "location": {"x": 1.5, "y": 1.5}, "capacity": 3},
                    {"id": "H2", "name": "Southside Trauma", "location": {"x": 8.5, "y": 8.5}, "capacity": 3},
                    {"id": "H3", "name": "Midtown Care Center", "location": {"x": 5.0, "y": 5.0}, "capacity": 3}
                ],
                "severity_weight_factor": 1.8,
                "unassigned_penalty": 1500.0
            }
        }
    }

@app.post("/api/optimize/classical", response_model=SolverResult)
def run_classical_optimization(config: ScenarioConfig):
    return solve_classical_milp(config)

@app.post("/api/optimize/greedy", response_model=SolverResult)
def run_greedy_optimization(config: ScenarioConfig):
    return solve_greedy_heuristic(config)

@app.post("/api/optimize/sqa", response_model=SolverResult)
@app.post("/api/optimize/quantum", response_model=SolverResult)
def run_sqa_optimization(config: ScenarioConfig):
    """Executes Simulated Quantum Annealing (SQA) solver directly."""
    return solve_simulated_quantum_annealing(config)

@app.post("/api/optimize/qaoa", response_model=SolverResult)
def run_qaoa_simulation(config: ScenarioConfig):
    """Executes Qiskit QAOA quantum circuit simulator for visual exploration."""
    return solve_qiskit_qaoa_simulation(config)

@app.post("/api/optimize/comparison", response_model=ComparisonResult)
def run_full_comparison(config: ScenarioConfig):
    """
    Runs Classical MILP, SQA Quantum Annealing, and Greedy solvers simultaneously
    and generates rigorous comparative benchmarks.
    """
    classical_res = solve_classical_milp(config)
    sqa_res = solve_simulated_quantum_annealing(config)
    greedy_res = solve_greedy_heuristic(config)
    
    # Check if trip assignments are identical between MILP and SQA
    c_set = set((a.ambulance_id, a.emergency_id, a.hospital_id) for a in classical_res.assignments)
    s_set = set((a.ambulance_id, a.emergency_id, a.hospital_id) for a in sqa_res.assignments)
    is_identical = (c_set == s_set) and (len(c_set) > 0)
    
    cost_diff = round(sqa_res.total_distance - classical_res.total_distance, 2)
    pct_diff = round((cost_diff / max(1.0, classical_res.total_distance)) * 100.0, 1) if classical_res.total_distance > 0 else 0.0
    
    E_total = len(config.emergencies)
    insights = []
    
    # Feasibility reporting: summary MUST NOT claim all served unless BOTH are feasible!
    both_feasible = classical_res.is_feasible and sqa_res.is_feasible
    
    if both_feasible:
        comp_summary = f"All {E_total}/{E_total} emergencies were successfully assigned by both Classical MILP and Quantum SQA solvers."
    elif classical_res.is_feasible and not sqa_res.is_feasible:
        comp_summary = f"Classical MILP successfully assigned all {E_total}/{E_total} emergencies (Feasible), while Quantum SQA served {sqa_res.emergencies_served}/{E_total} emergencies."
    elif sqa_res.is_feasible and not classical_res.is_feasible:
        comp_summary = f"Quantum SQA served all {E_total}/{E_total} emergencies (Feasible), while Classical MILP was infeasible."
    else:
        comp_summary = f"INFEASIBLE SCENARIO: Resource capacities are insufficient to serve all {E_total} emergencies."

    # Separate status reporting lines for clarity
    insights.append(f"Classical MILP: {classical_res.emergencies_served}/{E_total} emergencies served ({'Feasible' if classical_res.is_feasible else 'Infeasible'}). Total distance: {classical_res.total_distance} km.")
    insights.append(f"Quantum SQA: {sqa_res.emergencies_served}/{E_total} emergencies served ({'Feasible' if sqa_res.is_feasible else 'Infeasible'}). Total distance: {sqa_res.total_distance} km.")
    
    if both_feasible:
        if is_identical:
            insights.append("Both Classical MILP and Quantum SQA arrived at the exact same optimal assignment routes.")
        else:
            insights.append("The approaches produced different feasible assignment routes based on solution landscape exploration.")

    insights.append("Comparison purpose: Investigate optimization trade-offs between exact classical MILP and quantum-inspired transverse annealing without declaring automatic winners.")

    return ComparisonResult(
        scenario_summary={
            "ambulances": len(config.ambulances),
            "emergencies": len(config.emergencies),
            "hospitals": len(config.hospitals),
            "qubo_variables": classical_res.qubo_num_variables
        },
        classical=classical_res,
        quantum=sqa_res,
        greedy=greedy_res,
        cost_difference=cost_diff,
        percentage_difference=pct_diff,
        is_assignment_identical=is_identical,
        comparison_summary=comp_summary,
        insights=insights
    )

@app.post("/api/qubo-matrix")
def get_qubo_details(config: ScenarioConfig):
    qubo = QUBOBuilder(config)
    return qubo.to_dict()
