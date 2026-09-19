from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Location(BaseModel):
    x: float
    y: float

class Ambulance(BaseModel):
    id: str
    name: str
    location: Location
    capacity: int = 1  # max emergencies it can handle in one shift/trip

class Emergency(BaseModel):
    id: str
    name: str
    location: Location
    severity: int = Field(default=3, ge=1, le=5)  # 1 (low) to 5 (critical)
    patient_count: int = 1

class Hospital(BaseModel):
    id: str
    name: str
    location: Location
    capacity: int = 3  # available beds/capacity

class ScenarioConfig(BaseModel):
    ambulances: List[Ambulance]
    emergencies: List[Emergency]
    hospitals: List[Hospital]
    severity_weight_factor: float = 1.5  # higher severity increases urgency/cost weight
    unassigned_penalty: float = 1000.0   # penalty for unserviced emergency

class Assignment(BaseModel):
    ambulance_id: str
    ambulance_name: str
    emergency_id: str
    emergency_name: str
    hospital_id: str
    hospital_name: str
    distance_amb_to_emerg: float
    distance_emerg_to_hosp: float
    total_distance: float
    severity: int
    weighted_cost: float

class SolverResult(BaseModel):
    solver_name: str
    solver_type: str  # "classical_milp", "greedy", "quantum_sqa", "qiskit_qaoa"
    status: str
    is_feasible: bool = True
    assignments: List[Assignment]
    unassigned_emergencies: List[str]
    emergencies_total: int
    emergencies_served: int
    high_severity_served: int
    hospitals_used_count: int
    total_cost: float
    total_distance: float
    avg_response_time_min: float
    execution_time_ms: float
    qubo_num_variables: int
    result_summary: str
    qubo_energy: Optional[float] = None
    solver_details: Dict[str, Any] = {}

class ComparisonResult(BaseModel):
    scenario_summary: Dict[str, int]
    classical: SolverResult
    quantum: SolverResult
    greedy: Optional[SolverResult] = None
    cost_difference: float
    percentage_difference: float
    is_assignment_identical: bool = True
    comparison_summary: str
    insights: List[str]
