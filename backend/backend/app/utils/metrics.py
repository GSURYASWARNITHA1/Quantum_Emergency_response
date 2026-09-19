import math
from app.models.scenario import Location, Ambulance, Emergency, Hospital

def calculate_euclidean_distance(loc1: Location, loc2: Location) -> float:
    """Calculates Euclidean distance between two locations."""
    return math.sqrt((loc1.x - loc2.x) ** 2 + (loc1.y - loc2.y) ** 2)

def calculate_manhattan_distance(loc1: Location, loc2: Location) -> float:
    """Calculates Manhattan grid distance (realistic for block-based city streets)."""
    return abs(loc1.x - loc2.x) + abs(loc1.y - loc2.y)

def get_severity_weight(severity: int, severity_factor: float = 1.5) -> float:
    """
    Returns non-linear severity weight multiplier.
    Critical (5): 3.5x
    Severe (4): 2.5x
    Serious (3): 1.8x
    Moderate (2): 1.3x
    Minor (1): 1.0x
    """
    base_weights = {1: 1.0, 2: 1.3, 3: 1.8, 4: 2.5, 5: 3.5}
    weight = base_weights.get(severity, 1.0)
    # Apply user scenario scaling factor
    return round(1.0 + (weight - 1.0) * (severity_factor / 1.5), 2)

def calculate_trip_cost(
    amb: Ambulance,
    emerg: Emergency,
    hosp: Hospital,
    severity_factor: float = 1.5
) -> tuple[float, float, float, float]:
    """
    Calculates distance and severity-weighted cost for a dispatch trip:
    Ambulance -> Emergency -> Hospital.

    Cost formula:
    Priority Weight = get_severity_weight(Severity, severity_factor)
    Distance 1: Ambulance to Emergency
    Distance 2: Emergency to Hospital
    Cost = (Distance_1 * Priority_Weight) + Distance_2

    Returns:
        (dist_amb_to_emerg, dist_emerg_to_hosp, total_dist, weighted_cost)
    """
    d1 = calculate_manhattan_distance(amb.location, emerg.location)
    d2 = calculate_manhattan_distance(emerg.location, hosp.location)
    total_dist = d1 + d2

    priority_weight = get_severity_weight(emerg.severity, severity_factor)
    weighted_cost = (d1 * priority_weight) + d2
    return round(d1, 2), round(d2, 2), round(total_dist, 2), round(weighted_cost, 2)

def distance_to_minutes(distance_units: float) -> float:
    """Translates grid distance units to estimated emergency response time in minutes."""
    return round(distance_units * 1.8, 1)
