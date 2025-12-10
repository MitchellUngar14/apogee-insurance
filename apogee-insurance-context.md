# Apogee Insurance Platform

## Live Deployments

| Service | URL |
|---------|-----|
| Quoting Service | https://apogee-insurance-quoting.vercel.app |
| Customer Service | https://apogee-insurance-customer-service.vercel.app |
| Benefit Designer | https://apogee-insurance-benefit-designer.vercel.app |

**GitHub:** https://github.com/MitchellUngar14/apogee-insurance

---

## Original Project Plan

**The Tribunal:** Of course. As the General Project Manager, I have synthesized the insights from our specialist team to formulate a cohesive and actionable plan for developing your insurance quoting platform.

Here is the comprehensive project plan:

### **Project: Insurance Quoting Platform**

#### **1. Executive Summary**

The objective is to build a web-based insurance quoting platform that supports two distinct user journeys: **Individual** and **Group**. The platform will feature a wizard-style interface for data collection, handle different insurance product types for each journey, and culminate in a "Ready for Sale" status. A secure API endpoint will allow an external system to retrieve these finalized quotes for policy creation.

This plan outlines the architecture, key components, and a phased development roadmap to deliver this platform efficiently.

---

#### **2. Core Architecture & Components**

Our team has broken the project down into four primary components. This separation of concerns will allow for parallel development and a more maintainable system.

1.  **Frontend (The User Experience)**
    *   **Technology:** A modern JavaScript framework like **React** or **Vue.js** is recommended. These are ideal for building the dynamic, multi-step "wizard" interface you require.
    *   **Functionality:**
        *   **Initial Choice:** A clear starting page where the user selects "Individual Quote" or "Group Quote."
        *   **Dynamic Wizard:** The interface will be a single-page application that guides the user through steps, conditionally showing fields based on their initial choice and previous answers.
        *   **State Management:** We will use a state management library (like Redux or Pinia) to hold the quote information as the user progresses, ensuring data is not lost between steps.
        *   **Component-Based Design:** We'll create reusable components for common elements like personal information forms, coverage selection, and employee lists.

2.  **Backend (API & Business Logic)**
    *   **Technology:** A robust backend framework such as **Node.js (Express)**, **Python (Django/FastAPI)**, or **Go** will house the core logic.
    *   **Functionality:**
        *   **RESTful API:** To handle all communications from the frontend (e.g., saving progress, creating quotes, fetching options).
        *   **Quote Engine Logic:** This service will manage the creation, updating, and status changes of quotes (e.g., from `In Progress` to `Ready for Sale`).
        *   **User & Group Management:** Logic to handle the creation of groups and the addition/management of employees within them.
        *   **External API Endpoint:** A dedicated, secure endpoint (`GET /api/quotes/ready-for-sale`) for the external policy system. This endpoint will require authentication (e.g., an API key) to protect the data.

3.  **Database (The System of Record)**
    *   **Technology:** A relational database like **PostgreSQL** is highly recommended due to the structured nature of insurance data.
    *   **Core Data Models (Schema):**
        *   `Quotes`: Stores the core quote information, status (`Ready for Sale`), type (`Individual`/`Group`), and links to the relevant applicant or group.
        *   `Applicants`: A table for individual applicants and employees.
        *   `Groups`: Stores information about the company or group. A `Group` will have a one-to-many relationship with `Applicants` (employees).
        *   `Coverages`: Stores the specific insurance products selected for a quote (e.g., Health, Dental, Auto) and their associated details.

4.  **Third-Party Integrations (Rating)**
    *   **Critical Function:** To provide actual, real-time quotes, the system must connect to external APIs from insurance carriers. The backend will be responsible for sending the collected applicant/group data to these carrier APIs and receiving the premium/rate information back. This is a crucial step for a functional quoting platform.

---

#### **3. Actionable Phased Development Plan**

We recommend a phased approach to manage complexity and deliver value incrementally.

**Phase 1: Minimum Viable Product (MVP) - The Individual Flow**
*   **Goal:** Build a complete, end-to-end quoting process for a single individual. This validates the core architecture and user experience.
*   **Key Tasks:**
    1.  **Database:** Set up the initial schema for `Quotes` and `Applicants`.
    2.  **Backend:** Develop API endpoints for creating an individual applicant, creating a quote, and updating its status to "Ready for Sale."
    3.  **Frontend:** Build the wizard interface for the *individual flow only*, covering personal details and selection of individual insurance products (Health, Dental, Auto, etc.).
    4.  **API Endpoint:** Implement the secure `/api/quotes/ready-for-sale` endpoint to return completed individual quotes.

**Phase 2: Expansion - The Group Flow**
*   **Goal:** Extend the platform to support the more complex group quoting functionality.
*   **Key Tasks:**
    1.  **Database:** Augment the schema with the `Groups` table and establish the relationship between groups and employees (`Applicants`).
    2.  **Backend:** Create new API endpoints for creating a group, adding/removing employees to a group, and associating a quote with a group.
    3.  **Frontend:** Update the initial choice screen and build out the wizard path for the group flow, including the interface for adding multiple employees (e.g., a simple form or a CSV upload feature).

**Phase 3: Integration & Production Readiness**
*   **Goal:** Connect the platform to real-world data and prepare it for live operation.
*   **Key Tasks:**
    1.  **Carrier API Integration:** Identify key insurance carriers and integrate their rating APIs into the backend. The "quote engine" will now call these services to fetch real premiums.
    2.  **Security Hardening:** Implement robust authentication and authorization for the external API. Ensure all data is transmitted securely (HTTPS) and sensitive data is encrypted at rest.
    3.  **Testing & Deployment:** Conduct thorough end-to-end testing of both flows. Set up a deployment pipeline for launching and maintaining the application on a cloud provider (e.g., AWS, Azure).

---

#### **4. Key Considerations**

*   **Data Security & Compliance:** You will be handling Personally Identifiable Information (PII) and potentially Protected Health Information (PHI). The system must be designed with security best practices and compliance (e.g., HIPAA for health data) in mind from day one.
*   **User Experience (UX):** The success of the wizard depends on its simplicity. We must minimize friction and make the process as intuitive as possible for the end-user.
*   **Scalability:** The architecture should be designed to handle growth in users and quote volume over time.

This phased plan provides a clear roadmap for building your platform, starting with a functional core and progressively adding complexity. Our team is prepared to begin with Phase 1 upon your approval.