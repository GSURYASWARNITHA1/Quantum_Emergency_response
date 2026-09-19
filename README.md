# Quantum Emergency Response

> A working prototype for comparing classical and quantum-inspired optimization approaches to emergency resource allocation.

## 📌 Overview

Quantum Emergency Response is an optimization-based system for assigning limited ambulances to multiple emergencies and hospitals.

The system considers:

- Emergency severity
- Travel distance
- Response time
- Ambulance capacity
- Hospital capacity

It compares a classical **MILP** approach with **Simulated Quantum Annealing (SQA)** and provides a **QAOA** quantum-circuit exploration.

The goal is to study how different optimization approaches handle emergency resource allocation and the trade-offs between them.

---

## 🚨 Problem Statement

During large-scale accidents or emergency situations, multiple incidents may occur at the same time while ambulance and hospital resources are limited.

Manually deciding which ambulance should respond to which emergency and which hospital should receive the patient can become difficult as the number of possible assignments increases.

This project models the problem mathematically and uses optimization algorithms to find suitable resource allocations.

---

## 💡 Solution

The system represents possible assignments as:

**Ambulance → Emergency → Hospital**

It compares three approaches:

### Classical MILP

Uses Mixed-Integer Linear Programming with **SciPy/HiGHS** to find an optimized allocation while respecting the defined constraints.

### Simulated Quantum Annealing (SQA)

Uses a **QUBO formulation** and simulated quantum annealing to search for an optimized allocation using a transverse-field Ising model.

### QAOA

Provides a quantum-circuit-based exploration using **Qiskit** and a simulator.

> **Note:** The project does not claim quantum advantage. SQA is simulated on classical hardware, and the purpose is to compare approaches and study their trade-offs.

---

## 📊 Example Result

Standard scenario:

**3 Ambulances | 5 Emergencies | 2 Hospitals**

| Metric | Classical MILP | SQA |
|---|---:|---:|
| Emergencies Served | 5/5 | 3/5 |
| Total Distance | 30 km | 21 km |
| Average Response Time | 10.8 min | 12.6 min |
| High-Severity Served | 3/3 | 2/3 |
| Runtime | 6.14 ms | 29,772.55 ms (~29.8 s) |

The result demonstrates that the two approaches can produce different optimization trade-offs.

In this benchmark, **Classical MILP achieves complete emergency coverage**, while **SQA serves 3/5 emergencies and produces a lower total distance among its selected assignments**.

---

## ✨ Key Features

- 🚑 Ambulance allocation
- 🚨 Emergency severity prioritization
- 🏥 Hospital capacity handling
- 📍 Emergency location visualization
- 🧮 Classical MILP optimization
- ⚛️ Simulated Quantum Annealing
- ⚛️ QAOA exploration
- 📊 Algorithm comparison
- 📈 Distance, response-time, and runtime metrics

---

## 🛠️ Technology Stack

**Frontend:** React, Vite, JavaScript, HTML, CSS

**Backend:** Python, FastAPI, SciPy, HiGHS, Qiskit

**Optimization:** MILP, QUBO, SQA, QAOA

---

## 🏗️ Project Structure

```text
quantum-emergency-response/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── scenario.py
│   │   ├── solvers/
│   │   │   ├── classical.py
│   │   │   ├── qubo_builder.py
│   │   │   └── quantum_sqa.py
│   │   └── utils/
│   │       └── metrics.py
│   │
│   ├── requirements.txt
│   └── test_solvers.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   └── oxlint.config.json
│
└── README.md

Emergency Scenario
        ↓
Ambulances + Emergencies + Hospitals
        ↓
Optimization Model
        ↓
 ┌──────────────┬──────────────────┬──────────────────┐
 ↓              ↓                  ↓
MILP            SQA                QAOA
 ↓              ↓                  ↓
Classical       Quantum-inspired   Quantum-circuit
optimization    classical          exploration
                simulation
 └──────────────┴──────────────────┴──────────────────┘
                         ↓
                  Results & Comparison
```

## **🌐 Links**

**GitHub:**  
[View GitHub Repository](https://github.com/GSURYASWARNITHA1/Quantum_Emergency_response/)

**Live Application:**  
[Open Live Application](https://quantum-emergency-response-1.onrender.com/)

**Demo Video:**  
To be added

**Presentation:**  
[View Presentation](https://docs.google.com/presentation/d/1wOmoyk8hSLGS3lMWP1U6CAbhVKmkTq9b/edit?usp=drivesdk&ouid=104284665235381980060&rtpof=true&sd=t)

🔮 Future Scope
-> Larger emergency scenarios
-> Real road-network and traffic data
-> Dynamic emergency arrivals
-> Improved quantum constraint handling
-> Testing on actual quantum hardware
-> Integration with real emergency-response systems

👤 Individual Project

Developer: GUNUPUDI SURYA SWARNITHA

This project was developed individually as part of the Open Innovation Hackathon.
