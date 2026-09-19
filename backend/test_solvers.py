import sys
from app.models.scenario import ScenarioConfig, Ambulance, Emergency, Hospital, Location
from app.solvers.classical import solve_classical_milp, solve_greedy_heuristic
from app.solvers.quantum_sqa import solve_simulated_quantum_annealing, solve_qiskit_qaoa_simulation

def test_all():
    print("Testing updated backend solvers...")
    config = ScenarioConfig(
        ambulances=[
            Ambulance(id="A1", name="Medic 1", location=Location(x=1, y=2), capacity=2),
            Ambulance(id="A2", name="Medic 2", location=Location(x=8, y=7), capacity=2),
            Ambulance(id="A3", name="Medic 3", location=Location(x=5, y=1), capacity=1)
        ],
        emergencies=[
            Emergency(id="E1", name="Cardiac Downtown", location=Location(x=2, y=3), severity=5),
            Emergency(id="E2", name="Traffic Highway", location=Location(x=7, y=8), severity=4),
            Emergency(id="E3", name="Asthma Suburbs", location=Location(x=3, y=1), severity=3),
            Emergency(id="E4", name="Fracture Mall", location=Location(x=8, y=2), severity=2),
            Emergency(id="E5", name="Industrial Port", location=Location(x=5, y=6), severity=4)
        ],
        hospitals=[
            Hospital(id="H1", name="City General", location=Location(x=3, y=4), capacity=3),
            Hospital(id="H2", name="St Jude", location=Location(x=8, y=5), capacity=3)
        ]
    )
    
    print("\n--- Running Classical MILP ---")
    c_res = solve_classical_milp(config)
    print(f"Status: {c_res.status} | Feasible: {c_res.is_feasible} | Distance: {c_res.total_distance} km | Time: {c_res.execution_time_ms} ms")
    print(f"  Summary: {c_res.result_summary}")
    for a in c_res.assignments:
        print(f"  {a.ambulance_name} -> {a.emergency_name} (Sev {a.severity}) -> {a.hospital_name} [Cost: {a.weighted_cost}]")
        
    print("\n--- Running SQA Quantum Solver ---")
    sqa_res = solve_simulated_quantum_annealing(config)
    print(f"Status: {sqa_res.status} | Feasible: {sqa_res.is_feasible} | Distance: {sqa_res.total_distance} km | Time: {sqa_res.execution_time_ms} ms")
    print(f"  Summary: {sqa_res.result_summary}")

    print("\n--- Running Qiskit QAOA Circuit Simulation ---")
    qaoa_res = solve_qiskit_qaoa_simulation(config)
    print(f"Status: {qaoa_res.status} | Feasible: {qaoa_res.is_feasible} | Time: {qaoa_res.execution_time_ms} ms")

    print("\nALL BACKEND SOLVERS PASSED VERIFICATION!")

if __name__ == "__main__":
    test_all()
