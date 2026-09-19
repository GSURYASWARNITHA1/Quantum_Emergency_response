import time
import numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds
from typing import List, Dict, Tuple
from app.models.scenario import ScenarioConfig, SolverResult, Assignment
from app.utils.metrics import calculate_trip_cost, distance_to_minutes

def solve_classical_milp(config: ScenarioConfig) -> SolverResult:
    """
    Solves the Emergency Dispatch problem using Integer Linear Programming (MILP)
    via scipy.optimize.milp. Guarantees exact global optimal cost baseline.
    Enforces mandatory assignment of every emergency.
    """
    start_time = time.time()
    
    A = len(config.ambulances)
    E = len(config.emergencies)
    H = len(config.hospitals)
    
    if A == 0 or E == 0 or H == 0:
        return SolverResult(
            solver_name="Classical ILP Solver",
            solver_type="classical_milp",
            status="Infeasible (Empty Scenario)",
            is_feasible=False,
            assignments=[],
            unassigned_emergencies=[e.id for e in config.emergencies],
            emergencies_total=E,
            emergencies_served=0,
            high_severity_served=0,
            hospitals_used_count=0,
            total_cost=0.0,
            total_distance=0.0,
            avg_response_time_min=0.0,
            execution_time_ms=0.0,
            qubo_num_variables=0,
            result_summary="INFEASIBLE: Scenario contains no available resources."
        )

    # Check capacity feasibility
    total_amb_cap = sum(a.capacity for a in config.ambulances)
    total_hosp_cap = sum(h.capacity for h in config.hospitals)

    if total_amb_cap < E or total_hosp_cap < E:
        exec_time_ms = round((time.time() - start_time) * 1000, 2)
        return SolverResult(
            solver_name="Classical ILP Solver",
            solver_type="classical_milp",
            status="Infeasible (Capacity Limit Exceeded)",
            is_feasible=False,
            assignments=[],
            unassigned_emergencies=[e.id for e in config.emergencies],
            emergencies_total=E,
            emergencies_served=0,
            high_severity_served=0,
            hospitals_used_count=0,
            total_cost=0.0,
            total_distance=0.0,
            avg_response_time_min=0.0,
            execution_time_ms=exec_time_ms,
            qubo_num_variables=A * E * H,
            result_summary=f"INFEASIBLE: Fleet capacity ({total_amb_cap}) or hospital bed capacity ({total_hosp_cap}) is less than required {E} emergencies."
        )

    # Map triplet (a, e, h) to variable index idx
    triplets: List[Tuple[int, int, int]] = []
    costs: List[float] = []
    trip_data: List[Tuple[float, float, float, float]] = []
    
    for a_idx, amb in enumerate(config.ambulances):
        for e_idx, emerg in enumerate(config.emergencies):
            for h_idx, hosp in enumerate(config.hospitals):
                triplets.append((a_idx, e_idx, h_idx))
                d1, d2, total_dist, weighted_cost = calculate_trip_cost(
                    amb, emerg, hosp, config.severity_weight_factor
                )
                costs.append(weighted_cost)
                trip_data.append((d1, d2, total_dist, weighted_cost))
                
    N_vars = len(triplets)
    c = np.array(costs, dtype=float)
    
    row_list = []
    b_l = []
    b_u = []
    
    # 1. Mandatory Emergency Assignment: sum_{a,h} x_{a,e,h} == 1 (EXACTLY 1 assignment per emergency)
    for e_idx in range(E):
        row = np.zeros(N_vars)
        for var_idx, (a_i, e_i, h_i) in enumerate(triplets):
            if e_i == e_idx:
                row[var_idx] = 1.0
        row_list.append(row)
        b_l.append(1.0)
        b_u.append(1.0)
        
    # 2. Ambulance Capacity Constraints: sum_{e,h} x_{a,e,h} <= amb.capacity
    for a_idx, amb in enumerate(config.ambulances):
        row = np.zeros(N_vars)
        for var_idx, (a_i, e_i, h_i) in enumerate(triplets):
            if a_i == a_idx:
                row[var_idx] = 1.0
        row_list.append(row)
        b_l.append(0.0)
        b_u.append(float(amb.capacity))
        
    # 3. Hospital Capacity Constraints: sum_{a,e} x_{a,e,h} <= hosp.capacity
    for h_idx, hosp in enumerate(config.hospitals):
        row = np.zeros(N_vars)
        for var_idx, (a_i, e_i, h_i) in enumerate(triplets):
            if h_i == h_idx:
                row[var_idx] = 1.0
        row_list.append(row)
        b_l.append(0.0)
        b_u.append(float(hosp.capacity))
        
    A_eq = np.vstack(row_list)
    constraints = LinearConstraint(A_eq, b_l, b_u)
    integrality = np.ones(N_vars)  # All variables binary (0 or 1)
    bounds = Bounds(0, 1)
    
    # Solve MILP
    res = milp(c=c, integrality=integrality, bounds=bounds, constraints=constraints)
    exec_time_ms = round((time.time() - start_time) * 1000, 2)
    
    assignments: List[Assignment] = []
    assigned_emergencies = set()
    total_cost = 0.0
    total_distance = 0.0
    
    if res.success and res.x is not None:
        selected_indices = np.where(res.x > 0.5)[0]
        for idx in selected_indices:
            a_idx, e_idx, h_idx = triplets[idx]
            amb = config.ambulances[a_idx]
            emerg = config.emergencies[e_idx]
            hosp = config.hospitals[h_idx]
            d1, d2, total_dist, weighted_cost = trip_data[idx]
            
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

    unassigned = [e.id for e in config.emergencies if e.id not in assigned_emergencies]
    is_feasible = (len(unassigned) == 0 and len(assignments) == E)
    
    if not is_feasible:
        # Fallback to greedy if exact solver encountered fractional feasibility boundaries
        greedy_res = solve_greedy_heuristic(config)
        if greedy_res.is_feasible:
            return greedy_res
            
        return SolverResult(
            solver_name="Classical MILP (SciPy)",
            solver_type="classical_milp",
            status="Infeasible (Partial Assignment)",
            is_feasible=False,
            assignments=assignments,
            unassigned_emergencies=unassigned,
            emergencies_total=E,
            emergencies_served=len(assignments),
            high_severity_served=sum(1 for a in assignments if a.severity >= 4),
            hospitals_used_count=len(set(a.hospital_id for a in assignments)),
            total_cost=round(total_cost, 2),
            total_distance=round(total_distance, 2),
            avg_response_time_min=distance_to_minutes(total_distance / max(1, len(assignments))),
            execution_time_ms=exec_time_ms,
            qubo_num_variables=N_vars,
            result_summary=f"INFEASIBLE: Only {len(assignments)}/{E} emergencies assigned due to resource constraints."
        )

    high_sev_count = sum(1 for a in assignments if a.severity >= 4)
    hosp_count = len(set(a.hospital_id for a in assignments))
    avg_resp_min = distance_to_minutes(total_distance / max(1, len(assignments)))
    
    return SolverResult(
        solver_name="Classical MILP (SciPy)",
        solver_type="classical_milp",
        status="Feasible - All Emergencies Assigned",
        is_feasible=True,
        assignments=assignments,
        unassigned_emergencies=[],
        emergencies_total=E,
        emergencies_served=E,
        high_severity_served=high_sev_count,
        hospitals_used_count=hosp_count,
        total_cost=round(total_cost, 2),
        total_distance=round(total_distance, 2),
        avg_response_time_min=avg_resp_min,
        execution_time_ms=exec_time_ms,
        qubo_num_variables=N_vars,
        result_summary=f"Classical MILP: All {E}/{E} emergencies successfully assigned (Total distance: {round(total_distance, 1)} km, Avg response: {avg_resp_min} min).",
        solver_details={
            "optimality_gap": 0.0,
            "iterations": getattr(res, 'nit', 0),
            "solver_engine": "SciPy HiGHS MILP"
        }
    )

def solve_greedy_heuristic(config: ScenarioConfig) -> SolverResult:
    """
    Classical Greedy Dispatch baseline.
    Priority-first heuristic assigning nearest available ambulance and hospital to highest severity emergencies.
    """
    start_time = time.time()
    E = len(config.emergencies)
    
    amb_remaining = {amb.id: amb.capacity for amb in config.ambulances}
    hosp_remaining = {hosp.id: hosp.capacity for hosp in config.hospitals}
    
    sorted_emergencies = sorted(config.emergencies, key=lambda e: e.severity, reverse=True)
    
    assignments: List[Assignment] = []
    assigned_emergencies = set()
    total_cost = 0.0
    total_distance = 0.0
    
    for emerg in sorted_emergencies:
        best_triplet = None
        best_cost = float('inf')
        best_data = None
        
        for amb in config.ambulances:
            if amb_remaining[amb.id] <= 0:
                continue
            for hosp in config.hospitals:
                if hosp_remaining[hosp.id] <= 0:
                    continue
                d1, d2, total_dist, weighted_cost = calculate_trip_cost(
                    amb, emerg, hosp, config.severity_weight_factor
                )
                if weighted_cost < best_cost:
                    best_cost = weighted_cost
                    best_triplet = (amb, hosp)
                    best_data = (d1, d2, total_dist, weighted_cost)
                    
        if best_triplet and best_data:
            amb, hosp = best_triplet
            d1, d2, total_dist, weighted_cost = best_data
            
            amb_remaining[amb.id] -= 1
            hosp_remaining[hosp.id] -= 1
            
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

    unassigned = [e.id for e in config.emergencies if e.id not in assigned_emergencies]
    is_feasible = (len(unassigned) == 0 and len(assignments) == E)
    exec_time_ms = round((time.time() - start_time) * 1000, 2)
    avg_resp_min = distance_to_minutes(total_distance / max(1, len(assignments)))
    high_sev_count = sum(1 for a in assignments if a.severity >= 4)
    hosp_count = len(set(a.hospital_id for a in assignments))

    return SolverResult(
        solver_name="Classical Greedy Dispatch",
        solver_type="greedy",
        status="Feasible - All Emergencies Assigned" if is_feasible else "Infeasible (Unassigned Emergencies)",
        is_feasible=is_feasible,
        assignments=assignments,
        unassigned_emergencies=unassigned,
        emergencies_total=E,
        emergencies_served=len(assignments),
        high_severity_served=high_sev_count,
        hospitals_used_count=hosp_count,
        total_cost=round(total_cost, 2),
        total_distance=round(total_distance, 2),
        avg_response_time_min=avg_resp_min,
        execution_time_ms=exec_time_ms,
        qubo_num_variables=len(config.ambulances) * E * len(config.hospitals),
        result_summary=f"Greedy Heuristic: {len(assignments)}/{E} emergencies assigned (Total distance: {round(total_distance, 1)} km)." if is_feasible else f"INFEASIBLE: Only {len(assignments)}/{E} emergencies assigned.",
        solver_details={
            "strategy": "Severity-first greedy local search"
        }
    )
