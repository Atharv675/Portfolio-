# Atharv Puranik — Profile Reference

> Auto-generated from portfolio source. Update this file whenever your details change so you never have to repeat yourself.

---

## 👤 Identity

| Field       | Value                                                    |
|-------------|----------------------------------------------------------|
| **Name**    | Atharv Puranik                                           |
| **Tagline** | Engineering Cyber Resilience Through Threat Intelligence Systems |
| **Status**  | Open to Work — Cloud Security · Threat Intelligence      |
| **Bio**     | Builder working at the intersection of Cybersecurity, AI, Cloud, and Defence Technology. Work spans agentic AI security, threat intelligence, and geospatial analytics — focused on solving security problems that matter in the real world. Driven by complex problems, secure engineering, and the challenge of turning emerging technology into scalable, resilient, useful systems. |

---

## 📬 Contact & Socials

| Platform     | Link / Value                                                                      |
|--------------|-----------------------------------------------------------------------------------|
| **Email**    | atharv21305@gmail.com                                                             |
| **LinkedIn** | https://www.linkedin.com/in/atharv-puranik-7a1403334/                            |
| **GitHub**   | https://github.com/Atharv675                                                      |
| **Résumé**   | `/atharv-puranik-resume.pdf` (hosted on portfolio site)                           |

---

## 📊 Key Stats

| Metric                               | Value |
|--------------------------------------|-------|
| Security systems built               | 6     |
| OWASP LLM Top 10 risks tested        | 10    |
| LLM security internship(s)           | 1     |
| Peak detection F1 (ADS-B platform)   | 97%   |

---

## 💼 Experience

### LLM Security Intern — EvoluteIQ

**Summary:** Secured generative AI and RAG-based applications against LLM-specific attack vectors, with a focus on defensive controls, API security, and retrieval security.

**Key contributions:**
- Evaluated generative AI workflows built with Ollama, Open WebUI, Qdrant, and RAG against real-world attack vectors to identify security weaknesses.
- Performed offensive security testing aligned with the OWASP Top 10 for LLM Applications (2025) and implemented layered defensive controls to address identified vulnerabilities.
- Engineered an AES-256-GCM envelope encryption framework with secure key management, audit logging, and secret protection to strengthen API security.
- Implemented input/output filtering, structured response validation, and retrieval-security controls to reduce attack surface across RAG-based applications.

---

## 🚀 Projects

### 01 · Secure LLM API Key Vault & Envelope Encryption Gateway ⭐ Featured
- **Hook:** A key-vault gateway that keeps third-party LLM credentials off the client, for teams shipping AI features without leaking provider keys.
- **Stack:** Python · FastAPI · HashiCorp Vault · PostgreSQL · Redis · Docker
- **Result:** Provider keys sealed with AES-256-GCM envelope encryption, wrapped via Vault Transit, so a database breach alone yields nothing usable.
- **Domains:** LLM security
- **Tags:** LLM security · Key management · Encryption
- **GitHub:** https://github.com/Atharv675/Secure-API-Encryption-Vault

---

### 02 · Endpoint Attack Reconstruction Engine (EDR) ⭐ Featured
- **Hook:** An on-prem Windows EDR that rebuilds multi-step attack chains from endpoint telemetry, for SOC teams without a cloud-EDR budget.
- **Stack:** Python · Splunk · Sysmon · Windows Event Logs · MITRE ATT&CK
- **Result:** Correlates Sysmon + Event Logs into risk-scored chains, fires automated response, and grades its own coverage against MITRE ATT&CK.
- **Domains:** Detection engineering
- **Tags:** Detection engineering · EDR · MITRE ATT&CK
- **GitHub:** https://github.com/Atharv675/MINI---EDR-

---

### 03 · Threat Intelligence & SOC Operations Platform
- **Hook:** A two-stage platform turning open-source threat feeds into log-correlated detections, for analysts triaging IOCs at scale.
- **Stack:** Python · FastAPI · MongoDB · OSINT Feeds · D3.js
- **Result:** Enriches and matches IOCs against auth / nginx / DNS logs with behavioural heuristics, mapped on a D3 relationship graph.
- **Domains:** Threat intelligence · Detection engineering
- **Tags:** Threat intel · SOC · OSINT
- **GitHub:** https://github.com/Atharv675/Threat-Intelligence-SOC-

---

### 04 · Identity Document Fraud Detection with an LLM Triage Layer
- **Hook:** A layered fraud pipeline joining transaction scoring, ID-document forensics and an LLM case-triage agent, for fraud and risk ops.
- **Stack:** Python · LightGBM · PyTorch · EfficientNet · NVIDIA NIM · MLflow
- **Result:** Velocity / entity-graph / deviation features plus document forensics; the triage LLM is calibration-checked, prompt-injection red-teamed and drift-monitored live.
- **Domains:** LLM security · Anomaly detection
- **Tags:** Fraud detection · LLM triage · ML
- **GitHub:** https://github.com/Atharv675/Identity-Document-Fraud-Detection-with-an-LLM-Triage-Layer

---

### 05 · SQL Injection Intrusion Detection
- **Hook:** A detection engine for SQL-injection attempts in live database traffic, for app and DB teams hardening against injection.
- **Stack:** Python · scikit-learn · Pattern Matching
- **Result:** Pairs signature patterns with a trained classifier to catch obfuscated and novel payloads that static rules miss.
- **Domains:** Detection engineering · Anomaly detection
- **Tags:** AppSec · Anomaly detection
- **GitHub:** https://github.com/Atharv675/Sqli_Intrusion_Detection

---

### 06 · ADS-B Spoofing Detection & Flight Integrity Platform
- **Hook:** A software-only platform that flags spoofed and anomalous aircraft broadcasts from live ADS-B, for airspace-surveillance integrity.
- **Stack:** Python · Kalman Filter · scikit-learn · FastAPI · PostgreSQL · Docker
- **Result:** Fuses Kalman tracking, NIS testing, Isolation Forest and simulated sensors into one suspicion score: 97.4% F1 on ghost aircraft, 0.5% false positives on clean traffic.
- **Domains:** Anomaly detection
- **Tags:** Anomaly detection · Sensor fusion · Aviation
- **GitHub:** https://github.com/Atharv675/ADS-B-Spoofing-Detection-and-Flight-Integrity-Platform

---

## 🛠 Skills & Capabilities

### Development
- Python · C · Java
- MySQL · MongoDB · PostgreSQL
- Git · GitHub

### AI / Machine Learning
- Machine Learning
- RAG (Retrieval-Augmented Generation)
- Qdrant · Vector Search
- Ollama
- Anomaly Detection

### Security & Intelligence
- Threat Hunting
- OSINT
- Splunk
- Nmap · Strix
- ISO 27001

### Cloud & DevOps
- Azure
- Docker
- Jenkins
- SonarQube
- CI/CD

---

## 🌐 Portfolio Website

- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **Workspace Path:** `c:\Users\Sarika Puranik\OneDrive\Desktop\Portfolio WEBSITE 3`
- **Key sections:** Hero · About · Marquee · Projects · Experience · Skills · Contact

---

## 📌 Project Domains (Filter Tags Used on Portfolio)

| Domain                 | Projects                                                |
|------------------------|---------------------------------------------------------|
| LLM security           | 01 (Key Vault), 04 (Fraud Detection)                   |
| Detection engineering  | 02 (EDR), 03 (SOC Platform), 05 (SQLi IDS)             |
| Threat intelligence    | 03 (SOC Platform)                                       |
| Anomaly detection      | 04 (Fraud Detection), 05 (SQLi IDS), 06 (ADS-B)        |

---

*Last updated: September 2026 · Source of truth: portfolio component files*
