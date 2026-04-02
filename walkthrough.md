# 🏗️ Career Compass AI System Architecture

I have generated two versions of the system architecture for your project: a high-fidelity **visual diagram** for presentations and a **technical Mermaid diagram** for your documentation.

## 🖼️ Visual Architecture Diagram

This high-fidelity image represents your modern tech stack (React, FastAPI, MySQL, Redis, AI Core, and Monitoring) in a premium, isometric dark-mode aesthetic.

![Career Compass AI Technical Architecture](/C:\Users\windows-11\.gemini\antigravity\brain\131e2afb-bd36-4faa-8984-b62be400d2e1\technical_architecture_diagram_flat_1774871640667.png)

> [!TIP]
> This flat diagram is designed for technical documentation, clearly showing the service boundaries and data protocols.

---

## 🎨 Visual Architecture Diagram (Isometric)

For presentations and high-level overviews, this high-fidelity isometric version represents your modern stack.

![Career Compass AI Architecture](/C:\Users\windows-11\.gemini\antigravity\brain\131e2afb-bd36-4faa-8984-b62be400d2e1\system_architecture_diagram_1774871516994.png)

---

## 📊 Technical Architecture (Mermaid)

The following diagram is also available in [system_architecture.md](file:///C:/Users/windows-11/.gemini/antigravity/brain/131e2afb-bd36-4faa-8984-b62be400d2e1/system_architecture.md). It details exactly how your Docker services communicate.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#61DAFB,stroke:#ffffff,stroke-width:2px,color:#000000;
    classDef backend fill:#00a393,stroke:#ffffff,stroke-width:2px,color:#ffffff;
    classDef database fill:#4479A1,stroke:#ffffff,stroke-width:2px,color:#ffffff;
    classDef ai fill:#9B59B6,stroke:#ffffff,stroke-width:2px,color:#ffffff;
    classDef infra fill:#2C3E50,stroke:#ffffff,stroke-width:2px,color:#ffffff;
    classDef monitoring fill:#E6522C,stroke:#ffffff,stroke-width:2px,color:#ffffff;
    classDef external fill:#F39C12,stroke:#ffffff,stroke-width:2px,color:#000000;

    %% Client Layer
    subgraph ClientLayer ["Client Layer"]
        UserBrowser("User Browser"):::external
        AdminBrowser("Admin Browser"):::external
    end

    %% Infrastructure Layer
    subgraph Gateway ["Reverse Proxy / Gateway"]
        Nginx{"Nginx Load Balancer<br>(Ports 80/443)"}:::infra
    end

    %% Application Layer
    subgraph AppLayer ["Application Layer (Docker Containers)"]
        Frontend["Frontend App<br>(React, Vite, Tailwind CSS)"]:::frontend
        Backend["Backend Service<br>(FastAPI, Python)"]:::backend
    end

    %% Data Storage Layer
    subgraph DataLayer ["Data Storage & Memory Layer"]
        MySQL[("MySQL 8.0<br>(Primary DB)")]:::database
        Redis[("Redis<br>(Caching & Sessions)")]:::database
    end

    %% Network Connections
    UserBrowser -->|HTTPS| Nginx
    AdminBrowser -->|HTTPS| Nginx
    Nginx -->|Statics| Frontend
    Nginx -->|API| Backend
    Frontend -.->|REST API| Backend
    Backend -->|Persistence| MySQL
    Backend -->|Caching| Redis
```

## 🛠️ Summary of Technologies Represented
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
- **Backend**: FastAPI, Python 3.11, SQLAlchemy.
- **AI Core**: OpenAI GPT-4 integrations, RAG (Retrieval Augmented Generation).
- **Core Infrastructure**: Docker Compose, Nginx (Reverse Proxy).
- **Data Persistence**: MySQL 8.0.
- **Caching**: Redis 7.2.
- **Observability**: Prometheus & Grafana.

---
> [!NOTE]
> All architectural insights were gathered directly from your project's `README.md`, `docker-compose.yml`, and source code.
