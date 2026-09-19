import numpy as np
from typing import List, Dict, Tuple, Any
from app.models.scenario import ScenarioConfig, Assignment
from app.utils.metrics import calculate_trip_cost

class QUBOBuilder:
    """
    Constructs the Quadratic Unconstrained Binary Optimization (QUBO) matrix
    for Emergency Response resource allocation.
    
    Variables: x_{a, e, h} in {0, 1}
    N = |Ambulances| * |Emergencies| * |Hospitals|
    
    QUBO Objective:
    min x^T Q x + constant
    
    Q[i, i]: Linear cost + diagonal penalty terms
    Q[i, j]: Off-diagonal quadratic penalty terms (penalizing conflicting assignments)
    """
    
    def __init__(self, config: ScenarioConfig, penalty_multiplier: float = 1500.0):
        self.config = config
        self.P = penalty_multiplier
        self.ambulances = config.ambulances
        self.emergencies = config.emergencies
        self.hospitals = config.hospitals
        
        self.A = len(self.ambulances)
        self.E = len(self.emergencies)
        self.H = len(self.hospitals)
        
        self.triplets: List[Tuple[int, int, int]] = []
        self.variable_map: Dict[Tuple[int, int, int], int] = {}
        self.reverse_map: Dict[int, Tuple[int, int, int]] = {}
        self.trip_data: Dict[int, Tuple[float, float, float, float]] = {}
        
        self._build_variable_mapping()
        self.N = len(self.triplets)
        self.Q = np.zeros((self.N, self.N), dtype=float)
        self.constant_offset = 0.0
        
        self._build_qubo_matrix()

    def _build_variable_mapping(self):
        idx = 0
        for a_idx, amb in enumerate(self.ambulances):
            for e_idx, emerg in enumerate(self.emergencies):
                for h_idx, hosp in enumerate(self.hospitals):
                    key = (a_idx, e_idx, h_idx)
                    self.triplets.append(key)
                    self.variable_map[key] = idx
                    self.reverse_map[idx] = key
                    
                    d1, d2, total_dist, weighted_cost = calculate_trip_cost(
                        amb, emerg, hosp, self.config.severity_weight_factor
                    )
                    self.trip_data[idx] = (d1, d2, total_dist, weighted_cost)
                    idx += 1

    def _build_qubo_matrix(self):
        """Builds linear costs and quadratic penalty terms into Q."""
        # 1. Linear travel / response costs on diagonal Q[i, i]
        for idx in range(self.N):
            _, _, _, weighted_cost = self.trip_data[idx]
            self.Q[idx, idx] += weighted_cost

        # 2. Mandatory Emergency Penalty: Each emergency e MUST be assigned to exactly 1 (amb, hosp) pair
        # Formula: P * (sum_{a, h} x_{a,e,h} - 1)^2
        # Expanding: P * (- sum x_i + 2 * sum_{i < j} x_i x_j + 1)
        for e_idx in range(self.E):
            e_vars = [idx for idx, (a_i, e_i, h_i) in enumerate(self.triplets) if e_i == e_idx]
            self.constant_offset += self.P
            for i in e_vars:
                self.Q[i, i] -= self.P
                for j in e_vars:
                    if i < j:
                        self.Q[i, j] += 2.0 * self.P

        # 3. Ambulance Capacity Penalty: Ambulance a cannot exceed its capacity Cap_a
        for a_idx, amb in enumerate(self.ambulances):
            a_vars = [idx for idx, (a_i, e_i, h_i) in enumerate(self.triplets) if a_i == a_idx]
            for i in a_vars:
                for j in a_vars:
                    if i < j:
                        self.Q[i, j] += 1.2 * self.P

        # 4. Hospital Capacity Penalty: Hospital h overflow penalty
        for h_idx, hosp in enumerate(self.hospitals):
            h_vars = [idx for idx, (a_i, e_i, h_i) in enumerate(self.triplets) if h_i == h_idx]
            for i in h_vars:
                for j in h_vars:
                    if i < j:
                        self.Q[i, j] += 0.8 * self.P

    def evaluate_energy(self, x: np.ndarray) -> float:
        """Calculates energy E(x) = x^T Q x + constant_offset."""
        return float(x.T @ self.Q @ x + self.constant_offset)

    def decode_solution(self, x: np.ndarray) -> Tuple[List[Assignment], List[str], float, float]:
        """
        Decodes binary vector x into concrete Assignment objects.
        Returns (assignments, unassigned_emergencies, total_cost, total_distance)
        """
        assignments: List[Assignment] = []
        assigned_emergencies = set()
        total_cost = 0.0
        total_distance = 0.0
        
        selected_indices = np.where(x > 0.5)[0]
        
        for idx in selected_indices:
            a_idx, e_idx, h_idx = self.reverse_map[idx]
            emerg = self.emergencies[e_idx]
            
            # Avoid duplicate assignments to same emergency in raw QUBO output
            if emerg.id in assigned_emergencies:
                continue
                
            amb = self.ambulances[a_idx]
            hosp = self.hospitals[h_idx]
            d1, d2, total_dist, weighted_cost = self.trip_data[idx]
            
            assignments.append(Assignment(
                ambulance_id=amb.id,
                ambulance_name=amb.name,
                emergency_id=emerg.id,
                emergency_name=emerg.name,
                hospital_id=hosp.id,
                hospital_name=hosp.name,
                distance_amb_to_emerg=d1,
                distance_emerg_to_hosp=d2,
                total_distance=total_dist,
                severity=emerg.severity,
                weighted_cost=weighted_cost
            ))
            assigned_emergencies.add(emerg.id)
            total_cost += weighted_cost
            total_distance += total_dist

        unassigned = [e.id for e in self.emergencies if e.id not in assigned_emergencies]
        return assignments, unassigned, round(total_cost, 2), round(total_distance, 2)

    def to_dict(self) -> Dict[str, Any]:
        """Returns visualizable representation of the QUBO matrix for UI explanation panel."""
        return {
            "num_variables": self.N,
            "constant_offset": float(self.constant_offset),
            "matrix_shape": [self.N, self.N],
            "sample_matrix": np.round(self.Q[:min(10, self.N), :min(10, self.N)], 1).tolist(),
            "variable_labels": [
                f"x_{self.ambulances[a].name[0]}{self.emergencies[e].name[0]}{self.hospitals[h].name[0]}"
                for (a, e, h) in self.triplets[:min(10, self.N)]
            ]
        }
