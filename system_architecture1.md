# Career Compass AI System Architecture

This interactive diagram provides a high-level overview of the Career Compass AI system architecture based on your project configuration and `docker-compose.yml`.

> [!NOTE]
> The diagram illustrates the exact technological stack you are using in this repository — React/Vite for the frontend, FastAPI for the backend Python service, MySQL 8.0 for relational storage, Redis for caching, Nginx for proxying, and Prometheus & Grafana for monitoring.

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

    %% AI Core Layer
    subgraph AILayer ["AI Pipeline Layer"]
        direction TB
        LLMRouter["LLM Router & Integrations"]:::ai
        RAGModule["RAG Module & Memory"]:::ai
        CareerEngine["Career & Skill Evaluator"]:::ai
    end

    %% Data Storage Layer
    subgraph DataLayer ["Data Storage & Memory Layer"]
        MySQL[("MySQL 8.0<br>(Users, Content, Assessments)")]:::database
        Redis[("Redis<br>(Caching & Sessions)")]:::database
        VectorDB[("Vector Store<br>(Pinecone/External)")]:::database
    end

    %% Monitoring Layer
    subgraph MonitoringLayer ["Monitoring Layer"]
        Prometheus["Prometheus<br>(Metrics Collection)"]:::monitoring
        Grafana["Grafana<br>(Analytics Dashboards)"]:::monitoring
    end
    
    %% External Integrations
    OpenAI("OpenAI API"):::external

    %% Network Connections
    UserBrowser -->|HTTPS| Nginx
    AdminBrowser -->|HTTPS| Nginx
    
    Nginx -->|Statics & Frontend routes| Frontend
    Nginx -->|/api/* routes| Backend
    
    Frontend -.->|REST API Calls| Backend
    
    Backend -->|Read/Write| MySQL
    Backend -->|Session State| Redis
    
    Backend -->|Execute AI Workflows| AILayer
    AILayer -->|Semantic Search| VectorDB
    AILayer <-->|Prompt Generation| OpenAI
    LLMRouter --> RAGModule
    RAGModule --> CareerEngine
    
    Backend -.->|Scrapes /metrics| Prometheus
    Prometheus -->|Provides Datasource| Grafana
```

## Layers Breakdown

1. **Client & API Gateway**: External user requests are routed by an Nginx server, which maps domain routes cleanly to the frontend React bundle or the backend API APIs. 
2. **Application Core**: 
   - **Frontend**: A rich single-page application built with React and styled perfectly with Tailwind CSS.
   - **Backend API**: Driven by a fast, asynchronous FastAPI instance that handles robust routing (authentication, profile info, learning paths, quizzes).
3. **AI Pipeline**: The intelligent component of the tool. Leverages Python algorithms for mapping user skills to vector embeddings, finding matches using LLMs via OpenAI, and serving specialized RAG content to guide career decisions.
4. **Data Infrastructure**: Persistent and relational states are safely captured in a robust MySQL 8.0 database, while Redis drives low-latency operations such as chat sessions. 
5. **Observability**: Prometheus captures performance metrics continuously being presented logically via Grafana.
