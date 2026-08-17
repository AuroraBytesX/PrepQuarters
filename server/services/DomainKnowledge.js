/*
 * Curated Domain Knowledge, Company Profiles, and Evaluation Rubrics
 * PrepQuarters Interview Platform
 * Expanded repository with Easy, Medium, and Hard tiers across all 6 domains.
 * Covers Technical, System Design, Conceptual, Behavioral, Situational, and Problem-Solving questions.
 */

const DOMAINS = {
  "Software Engineering": {
    name: "Software Engineering",
    description: "Algorithms, distributed system design, API architecture, concurrency, database indexing, and clean code practices.",
    roles: ["Software Engineer", "Backend Developer", "Frontend Developer", "Fullstack Engineer", "Systems Engineer", "Staff Engineer"],
    topCompanies: ["Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "Uber", "Stripe"],
    skillCategories: [
      "Algorithmic Thinking and Data Structures",
      "System Architecture and Scalability",
      "API Design and Data Modeling",
      "Concurrency and Performance Optimization",
      "Reliability, Testing and Clean Code",
      "Behavioral and Engineering Leadership",
    ],
    companyStyles: {
      "Google": {
        focus: "Algorithmic rigor, distributed systems, clean complexity bounds (Big-O), and scalable design.",
        interviewerPersona: "Analytical, probes edge cases, requests exact time and space trade-offs, and expects structured reasoning.",
        keyQuestionsHard: [
          {
            topic: "Distributed Systems & Scalability",
            subtopic: "Global Rate Limiting",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Design a globally distributed rate limiting service that handles 100,000 requests per second across 5 geographic regions. How do you handle clock skew, regional synchronization, and minimal latency overhead?",
            expectedKeyPoints: [
              "Token bucket or sliding window log algorithms",
              "Redis clusters or local in-memory counters with asynchronous batched sync",
              "Trade-off between strict global accuracy and low request latency",
              "Failure mode: fail open vs fail closed during network partitions",
            ],
          },
          {
            topic: "Concurrency & Data Structures",
            subtopic: "Lock-Free LRU Cache",
            questionType: "Technical",
            difficulty: "Hard",
            questionText: "How would you design a thread-safe, lock-free LRU cache in a multi-threaded server environment? Walk through how you avoid race conditions during cache eviction and key updates.",
            expectedKeyPoints: [
              "Concurrent hash map combined with lock-free doubly linked list or epoch-based reclamation",
              "CAS (Compare-And-Swap) operations and hazard pointers",
              "Segmented locking vs lock-free trade-offs in real-world memory access",
              "Eviction synchronization without stopping concurrent reader threads",
            ],
          },
          {
            topic: "Distributed Consensus & Storage",
            subtopic: "Raft Consensus & Leader Election",
            questionType: "Technical",
            difficulty: "Hard",
            questionText: "Walk through the Raft consensus algorithm during a network partition where the leader is isolated in a minority partition. How do clients discover the new leader and prevent split-brain writes?",
            expectedKeyPoints: [
              "Term numbers and majority quorum heartbeat checks",
              "Candidate election timeouts and log replication matching",
              "Stale leader rejecting writes when unable to achieve write quorum",
              "Read-index or lease reads to prevent stale reads without log writes",
            ],
          },
          {
            topic: "Behavioral & Technical Trade-offs",
            subtopic: "High-Stakes Technical Disagreement",
            questionType: "Behavioral",
            difficulty: "Hard",
            questionText: "Tell me about a time you strongly disagreed with a senior engineer or tech lead on a fundamental architectural decision. How did you present your counter-proposal and resolve the dispute?",
            expectedKeyPoints: [
              "Grounded disagreement in objective benchmarks, data, and user impact",
              "Constructive communication without personal ego",
              "Prototyping a quick benchmark spike to test competing hypotheses",
              "Committing fully once a team decision was reached",
            ],
          },
        ],
      },
      "Amazon": {
        focus: "Leadership Principles (Customer Obsession, Ownership, Dive Deep, Bias for Action), operational excellence, and microservice resiliency.",
        interviewerPersona: "Inquisitive, focuses on customer impact, deep dives into architectural bottlenecks, and asks for concrete failure scenarios.",
        keyQuestionsHard: [
          {
            topic: "Resilience & Operational Excellence",
            subtopic: "Cascading Failure Mitigation",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "You are operating a critical checkout service that experiences a sudden 10x traffic spike while a downstream payment provider latency degrades from 50ms to 2000ms. How do you prevent cascading failure across your fleet?",
            expectedKeyPoints: [
              "Circuit breaker pattern and dynamic timeout degradation",
              "Queue-based load leveling and asynchronous fallback processing",
              "Bulkheading thread pools and shedding non-critical dependencies",
              "Monitoring metrics: p99 latency, error budgets, and health check isolation",
            ],
          },
          {
            topic: "Microservices & Ownership",
            subtopic: "Eventual Consistency & Sagas",
            questionType: "Technical",
            difficulty: "Hard",
            questionText: "In a decentralized microservices architecture without distributed 2PC transactions, how do you maintain data consistency across Order, Inventory, and Billing services during a complex checkout workflow?",
            expectedKeyPoints: [
              "Saga pattern with orchestrator vs choreography",
              "Compensating transactions for rollback scenarios",
              "Idempotency keys and outbox pattern for reliable event publishing",
              "Reconciliation jobs and dead letter queue management",
            ],
          },
          {
            topic: "Situational Leadership",
            subtopic: "Production Outage Post-Mortem",
            questionType: "Situational",
            difficulty: "Hard",
            questionText: "A critical customer-facing feature you deployed broke production for 30 minutes during peak business hours. Walk through your immediate response, customer communication, and long-term blameless post-mortem.",
            expectedKeyPoints: [
              "Immediate triage: automated rollback before root cause deep-dive",
              "Clear stakeholder and status page communication",
              "Blameless 5-Whys post-mortem focusing on systemic guardrails (canary tests, feature flags)",
              "Action items assigned with strict SLA tracking",
            ],
          },
        ],
      },
      "Meta": {
        focus: "Rapid execution, massive scale, caching tiers, graph architectures, and engineering trade-offs under high throughput.",
        interviewerPersona: "Pragmatic, fast-paced, pushes for quick end-to-end architecture before diving into bottlenecks and caching strategies.",
        keyQuestionsHard: [
          {
            topic: "High Throughput Systems",
            subtopic: "Social Feed Distribution",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Design the live feed generation and distribution system for millions of active users with celebrity accounts having tens of millions of followers. How do you balance fan-out on write vs fan-out on read?",
            expectedKeyPoints: [
              "Hybrid fan-out model (push for regular users, pull for high-follower celebrities)",
              "Multi-tier cache hierarchy (Memcached/TAO graph cache)",
              "Ranking and real-time aggregation pipeline with message brokers (Kafka)",
              "Pagination using cursor-based tokens rather than offset pagination",
            ],
          },
          {
            topic: "Data Modeling & Graph Storage",
            subtopic: "Social Graph Traversal",
            questionType: "Technical",
            difficulty: "Hard",
            questionText: "How do you model and query bidirectional user relationships, mutual friend lookups, and privacy access control checks at millisecond latency across billions of graph edges?",
            expectedKeyPoints: [
              "Adjacency lists indexed in distributed key-value/graph datastores",
              "Two-hop breadth-first search optimization with bloom filters",
              "Sharding strategies by user ID or edge hash to prevent hot partitions",
              "Layered caching of precomputed privacy access lists",
            ],
          },
        ],
      },
      "Microsoft": {
        focus: "Enterprise reliability, cloud-native design on Azure, backward compatibility, and solid modular design.",
        interviewerPersona: "Collaborative, checks for maintainability, security, cross-team interfaces, and clean separation of concerns.",
        keyQuestionsHard: [
          {
            topic: "Cloud Architecture & Security",
            subtopic: "Multi-tenant Isolation",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "How do you architect a multi-tenant SaaS application that guarantees compute and data isolation across enterprise clients with strict compliance requirements, while optimizing operational costs?",
            expectedKeyPoints: [
              "Database per tenant vs shared database with row-level security",
              "Tenant-aware routing, connection pooling, and token validation",
              "Encryption at rest with customer-managed keys (BYOK)",
              "Noisy neighbor mitigation via tenant rate limiting and resource quotas",
            ],
          },
        ],
      },
      "Apple": {
        focus: "Precision engineering, end-to-end user privacy, latency optimization, and robust native/backend integration.",
        interviewerPersona: "Detail-focused, emphasizes data privacy, battery and bandwidth conservation, and reliable API contracts.",
        keyQuestionsHard: [
          {
            topic: "API Design & Privacy",
            subtopic: "Zero-Knowledge Sync",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Design a secure end-to-end encrypted synchronization protocol between mobile clients and cloud storage where the server cannot read user data payloads. How do you handle sync conflicts and key rotation?",
            expectedKeyPoints: [
              "Client-side asymmetric key generation and secure enclave storage",
              "CRDTs (Conflict-Free Replicated Data Types) or vector clocks for offline merge",
              "Zero-knowledge metadata minimization to prevent traffic analysis",
              "Differential delta compression to save bandwidth and device battery",
            ],
          },
        ],
      },
      "General Tech": {
        focus: "Core computer science fundamentals, clear problem decomposition, and standard industry practices.",
        interviewerPersona: "Balanced, encouraging, methodically checks technical foundations and problem solving clarity.",
      },
    },
    easyQuestions: [
      {
        topic: "Data Structures & Algorithms",
        subtopic: "Hash Map Mechanics",
        questionType: "Technical",
        difficulty: "Easy",
        questionText: "Can you explain how a Hash Map works internally? What happens during a hash collision, and how can collisions be resolved?",
        expectedKeyPoints: [
          "Hash functions mapping keys to array indices",
          "Collision resolution techniques: Chaining (linked lists / red-black trees) and Open Addressing",
          "Load factor and resizing amortized O(1) time complexity",
        ],
      },
      {
        topic: "Web Fundamentals & APIs",
        subtopic: "REST vs GraphQL",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "What are the core differences between REST APIs and GraphQL? When would you choose one over the other in a project?",
        expectedKeyPoints: [
          "REST: fixed endpoints, multiple round trips, over/under fetching",
          "GraphQL: single endpoint, client specifies exact fields, schema introspection",
          "Caching simplicity in REST (HTTP caching) vs query flexibility in GraphQL",
        ],
      },
      {
        topic: "Database Basics",
        subtopic: "B-Tree Indexing",
        questionType: "Technical",
        difficulty: "Easy",
        questionText: "Explain what a database index is, how a B-Tree index improves read queries, and what trade-offs it introduces for write operations.",
        expectedKeyPoints: [
          "B-Tree balanced structure enabling O(log N) lookup time",
          "Avoids full table scans on filtered and sorted queries",
          "Write overhead: index tree must be updated on INSERT, UPDATE, and DELETE",
        ],
      },
      {
        topic: "Clean Code & Architecture",
        subtopic: "SOLID Principles",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "Walk through one or two SOLID principles that you actively apply in your code, with a brief practical example.",
        expectedKeyPoints: [
          "Single Responsibility Principle: class has only one reason to change",
          "Open/Closed Principle: open for extension, closed for modification",
          "Dependency Inversion: depending on abstractions rather than concrete implementations",
        ],
      },
      {
        topic: "Behavioral Fundamentals",
        subtopic: "Handling Technical Debt",
        questionType: "Behavioral",
        difficulty: "Easy",
        questionText: "Describe a project where you had to balance shipping a critical feature quickly versus taking time to refactor tech debt. How did you decide?",
        expectedKeyPoints: [
          "Assessed business deadline urgency vs long-term maintainability risks",
          "Documented trade-offs and scheduled explicit debt remediation tickets in the backlog",
          "Added automated regression tests to protect the rapid release",
        ],
      },
      {
        topic: "Concurrency Basics",
        subtopic: "Process vs Thread",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "What is the difference between a process and a thread? How does inter-process communication (IPC) differ from multi-threading shared memory?",
        expectedKeyPoints: [
          "Process: isolated memory space, heavier context switch overhead",
          "Thread: shared virtual address space, lighter context switch, race condition risks",
          "IPC mechanisms: pipes, sockets, shared memory segments, message queues",
        ],
      },
    ],
    mediumQuestions: [
      {
        topic: "API Architecture & Security",
        subtopic: "JWT vs Stateful Sessions",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "Compare stateless JWT authentication with server-side session cookies in a distributed web application. How do you handle instant token revocation with JWTs?",
        expectedKeyPoints: [
          "JWT statelessness vs server database session lookups",
          "Token revocation strategies: Redis blacklists, short token TTL with refresh tokens",
          "Security trade-offs: XSS vs CSRF vulnerabilities in token storage",
        ],
      },
      {
        topic: "Database Design & Optimization",
        subtopic: "SQL Query Optimization",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "Walk through how you investigate and fix a slow SQL query in production that takes 4 seconds to execute under load.",
        expectedKeyPoints: [
          "Running EXPLAIN ANALYZE to inspect query execution plan and table scans",
          "Adding composite indexes matching WHERE and ORDER BY clauses",
          "Avoiding N+1 query patterns and reviewing join cardinality",
        ],
      },
      {
        topic: "Asynchronous Processing",
        subtopic: "Message Queues & Worker Pools",
        questionType: "System Design",
        difficulty: "Medium",
        questionText: "How would you design an asynchronous background worker pool for processing large image uploads and video resizing without blocking user HTTP requests?",
        expectedKeyPoints: [
          "Decoupling upload ingestion from processing using RabbitMQ, SQS, or Redis BullMQ",
          "Worker scaling based on queue depth and consumer concurrency limits",
          "Handling job retries, idempotency, and dead letter queues for failed media encodes",
        ],
      },
      {
        topic: "Behavioral Collaboration",
        subtopic: "Code Review Conflicts",
        questionType: "Behavioral",
        difficulty: "Medium",
        questionText: "How do you approach giving constructive code review feedback when a teammate submits a pull request with severe performance or architectural flaws?",
        expectedKeyPoints: [
          "Focusing on the code and system constraints rather than personal criticism",
          "Providing concrete benchmarks or code snippet alternatives",
          "Offering a quick 1-on-1 pairing session to collaborate on the refactor",
        ],
      },
      {
        topic: "Caching Patterns",
        subtopic: "Cache-Aside vs Write-Through",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "Explain the differences between Cache-Aside, Write-Through, and Write-Back caching strategies. When does the cache stampede (thundering herd) problem occur, and how do you prevent it?",
        expectedKeyPoints: [
          "Cache-Aside: application queries cache first, populates on miss",
          "Write-Through: simultaneous synchronous write to cache and datastore",
          "Thundering herd mitigation: mutex locks on cache miss, probabilistic early expiration (XFetch)",
        ],
      },
    ],
  },

  "Data Science & ML": {
    name: "Data Science & Machine Learning",
    description: "Statistical modeling, ML pipelines, A/B testing, feature engineering, and data infrastructure.",
    roles: ["Data Analyst", "Data Scientist", "Machine Learning Engineer", "BI Engineer", "AI Researcher"],
    topCompanies: ["Netflix", "Meta", "Google", "Uber", "Airbnb", "Amazon"],
    skillCategories: [
      "Statistical Analysis and Hypothesis Testing",
      "Machine Learning Algorithms and Evaluation",
      "Data Modeling and SQL Query Optimization",
      "Feature Engineering and Data Pipelines",
      "Business Insight and Metric Formulation",
      "MLOps and Model Deployment",
    ],
    companyStyles: {
      "Netflix": {
        focus: "Recommendation systems, collaborative filtering, real-time contextual bandits, and streaming metrics.",
        interviewerPersona: "Data-driven, probes offline vs online evaluation metrics and personalization trade-offs.",
        keyQuestionsHard: [
          {
            topic: "Recommendation Systems",
            subtopic: "Two-Tower Neural Retrieval",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Design a two-tower neural retrieval pipeline for video recommendations serving 50M daily active users. How do you handle cold-start items and real-time embedding updates?",
            expectedKeyPoints: [
              "Two-tower architecture separating user query context from video candidate embeddings",
              "Approximate Nearest Neighbor (ANN) vector search via HNSW or ScaNN",
              "Cold-start mitigation using metadata feature projection and exploration bandits",
              "Offline batch embedding generation vs lightweight streaming online updates",
            ],
          },
          {
            topic: "Bandit Algorithms & Personalization",
            subtopic: "Multi-Armed Contextual Bandits",
            questionType: "Technical",
            difficulty: "Hard",
            questionText: "How do you implement a contextual multi-armed bandit algorithm (LinUCB) to dynamically personalize video artwork for users while balancing exploration and exploitation?",
            expectedKeyPoints: [
              "Ridge regression for user and artwork context feature vectors",
              "Upper Confidence Bound (UCB) calculation for exploration uncertainty",
              "Offline policy evaluation using inverse propensity scoring (IPS)",
              "Low latency inference budget (<15ms per page view)",
            ],
          },
        ],
      },
      "Meta": {
        focus: "High-dimensional click-through rate (CTR) prediction, graph embeddings, ranking algorithms, and A/B testing at scale.",
        interviewerPersona: "Fast-paced, focuses on feature engineering, model calibration, and experiment variance reduction.",
        keyQuestionsHard: [
          {
            topic: "Ranking & CTR Prediction",
            subtopic: "DLRM Feature Embeddings",
            questionType: "Technical",
            difficulty: "Hard",
            questionText: "How do you design a high-throughput ranking model for news feed ad placement? How do you prevent data leakage and handle extreme class imbalance in conversion prediction?",
            expectedKeyPoints: [
              "Embedding tables for sparse categorical features and cross-feature interaction layers",
              "Negative downsampling and calibration correction via log-odds adjustment",
              "Point-in-time joins to eliminate future lookahead data leakage in feature stores",
              "Online ranking latency constraints (sub-50ms p99 inference budget)",
            ],
          },
        ],
      },
      "Google": {
        focus: "Deep learning foundations, transformer models, mathematical grounding, and distributed training systems.",
        interviewerPersona: "Rigorous, checks loss function formulation, gradient optimization, and bias-variance diagnostics.",
        keyQuestionsHard: [
          {
            topic: "Distributed Training & LLMs",
            subtopic: "Model Parallelism (3D Parallelism)",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "When training a 70B parameter transformer model across a cluster of GPU nodes, how do you combine Tensor Parallelism, Pipeline Parallelism, and Data Parallelism (ZeRO)?",
            expectedKeyPoints: [
              "Megatron-LM tensor parallel intra-node matrix sharding",
              "Pipeline parallel inter-node layer distribution and micro-batch bubble reduction",
              "ZeRO memory partitioning across optimizer states, gradients, and model parameters",
              "Network interconnect bottlenecks (NVLink vs InfiniBand bandwidth)",
            ],
          },
        ],
      },
      "Uber": {
        focus: "Dynamic pricing algorithms, geospatial clustering, supply-demand forecasting, and marketplace experimentation.",
        interviewerPersona: "Operational, asks about real-time streaming data, network interference in A/B tests, and time-series models.",
        keyQuestionsHard: [
          {
            topic: "Marketplace Experimentation",
            subtopic: "Network Interference & Switchback Testing",
            questionType: "Situational",
            difficulty: "Hard",
            questionText: "In a ride-sharing marketplace, standard user-level A/B randomization causes severe interference bias between treatment and control drivers. How do you design valid experiments?",
            expectedKeyPoints: [
              "Switchback experimentation (cluster-level time and spatial alternating blocks)",
              "Synthetic controls and difference-in-differences causal estimation",
              "SUTVA (Stable Unit Treatment Value Assumption) violation mitigation",
              "Variance reduction techniques (CUPED) for marketplace metrics",
            ],
          },
        ],
      },
      "General Tech": {
        focus: "Core statistics, standard regression/classification workflows, SQL fluency, and clean metric definitions.",
        interviewerPersona: "Structured, checks hypothesis testing, exploratory data analysis, and baseline validation.",
      },
    },
    easyQuestions: [
      {
        topic: "Statistical Foundations",
        subtopic: "A/B Testing Power & Sample Size",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "How do you determine the required sample size and duration for an A/B test before launching an experiment?",
        expectedKeyPoints: [
          "Statistical power (1 - beta) typically at 80%",
          "Significance level (alpha) typically at 0.05",
          "Minimum Detectable Effect (MDE) and baseline conversion rate",
          "Avoiding peeking problems and ensuring balanced seasonality",
        ],
      },
      {
        topic: "Machine Learning Concepts",
        subtopic: "Overfitting vs Underfitting",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "What is overfitting in machine learning models, and what techniques do you use to detect and prevent it?",
        expectedKeyPoints: [
          "High variance / low bias where model memorizes training noise",
          "Train/Validation/Test split and k-fold cross-validation",
          "Regularization (L1 Lasso, L2 Ridge, Dropout) and early stopping",
        ],
      },
      {
        topic: "Data Analysis & SQL",
        subtopic: "SQL Window Functions",
        questionType: "Technical",
        difficulty: "Easy",
        questionText: "Can you explain when you would use SQL window functions like ROW_NUMBER(), RANK(), or DENSE_RANK(), and how they differ from GROUP BY?",
        expectedKeyPoints: [
          "Window functions calculate across a set of rows without collapsing individual rows",
          "ROW_NUMBER gives consecutive integers without ties",
          "RANK skips rank numbers after ties; DENSE_RANK does not skip",
        ],
      },
    ],
    mediumQuestions: [
      {
        topic: "Classification & Metrics",
        subtopic: "Precision vs Recall & ROC-AUC",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "In a credit card fraud detection model where only 0.1% of transactions are fraudulent, why is accuracy a misleading metric? What metrics would you optimize instead?",
        expectedKeyPoints: [
          "Accuracy paradox in extreme class imbalance",
          "Precision-Recall AUC (PR-AUC) vs ROC-AUC",
          "Cost matrix trade-off: false positives (customer friction) vs false negatives (fraud loss)",
        ],
      },
      {
        topic: "Feature Engineering",
        subtopic: "Categorical Encoding & Target Leakage",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "Compare One-Hot Encoding, Target Encoding, and Embedding layers for high-cardinality categorical features. How do you prevent target leakage during encoding?",
        expectedKeyPoints: [
          "One-Hot dimension explosion vs Target Encoding mean value substitution",
          "Out-of-fold target encoding and additive smoothing to prevent overfitting",
          "Learned embedding vectors for dense representation",
        ],
      },
      {
        topic: "MLOps & Monitoring",
        subtopic: "Data Drift & Covariate Shift",
        questionType: "System Design",
        difficulty: "Medium",
        questionText: "How do you build an automated monitoring pipeline in production to detect data drift, concept drift, and model performance degradation before users complain?",
        expectedKeyPoints: [
          "Statistical distance metrics: Kolmogorov-Smirnov test, Population Stability Index (PSI)",
          "Ground truth delayed feedback loops and proxy metric monitoring",
          "Automated alerts and scheduled model retraining pipelines",
        ],
      },
      {
        topic: "Ensemble Methods",
        subtopic: "Random Forests vs Gradient Boosting",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "Compare Bagging (Random Forests) with Boosting (XGBoost/LightGBM). How do their variance and bias reduction mechanics differ?",
        expectedKeyPoints: [
          "Random Forests: independent trees trained in parallel on bootstrap samples (variance reduction)",
          "Gradient Boosting: sequential trees trained on residual pseudo-loss gradients (bias and variance reduction)",
          "Hyperparameter tuning: learning rate, max depth, subsampling ratios",
        ],
      },
    ],
  },

  "Product Management": {
    name: "Product Management",
    description: "Product strategy, user empathy, roadmap prioritization, analytical metrics, and cross-functional leadership.",
    roles: ["Product Manager", "Associate PM", "Technical PM", "Growth PM", "Group PM"],
    topCompanies: ["Google", "Meta", "Amazon", "Stripe", "Airbnb"],
    skillCategories: [
      "Product Strategy and Vision",
      "User Empathy and Problem Definition",
      "Metrics and Analytical Decision Making",
      "Prioritization and Execution",
      "Stakeholder Management and Communication",
    ],
    companyStyles: {
      "Google": {
        focus: "Moonshot thinking, technology-enabled scale, user-centric design, and data-backed product hypothesis.",
        interviewerPersona: "Visionary yet analytical, asks how to 10x a product and how to measure user satisfaction.",
        keyQuestionsHard: [
          {
            topic: "Product Strategy & Ecosystems",
            subtopic: "Platform 0-to-1 Strategy",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Google is considering launching an autonomous AI developer copilot integrated into Android Studio and Google Cloud. Define the target user segments, value proposition, competitive moat against GitHub Copilot, and monetization model.",
            expectedKeyPoints: [
              "Clear user persona segmentation (enterprise compliance teams vs individual developers)",
              "Differentiated moat: deep integration with GCP infrastructure and Android APIs",
              "Monetization model: seat-based subscription combined with GCP compute consumption credits",
              "Guardrail metrics: developer retention, code acceptance rate, and security vulnerability rate",
            ],
          },
          {
            topic: "Market Entry & Ecosystems",
            subtopic: "Generative Search Strategy",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "How would you redesign Google Search to integrate generative AI answers without cannibalizing ad revenue and publisher web traffic ecosystem trust?",
            expectedKeyPoints: [
              "Hybrid interface: dynamic AI snapshot with organic publisher attribution cards",
              "Commercial query intent categorization for high-value sponsored ad placements",
              "Publisher revenue sharing or syndication API partnerships",
              "Evaluation metrics: search task completion rate, ad click quality, publisher outbound traffic",
            ],
          },
        ],
      },
      "Amazon": {
        focus: "Working backwards from the customer (PR/FAQ), two-way vs one-way door decisions, and operational excellence.",
        interviewerPersona: "Demands crisp problem statements, customer-first framing, and clear prioritization logic.",
        keyQuestionsHard: [
          {
            topic: "Customer Empathy & PR/FAQ",
            subtopic: "Prime Delivery Innovation",
            questionType: "Conceptual",
            difficulty: "Hard",
            questionText: "Write the outline of an Amazon PR/FAQ for launching dynamic 30-minute drone delivery for critical medical prescriptions. What is the customer problem, the press release headline, and the top 3 internal operational risks?",
            expectedKeyPoints: [
              "Customer pain point: urgent prescription access without physical store travel",
              "PR headline and customer quote expressing emotional relief and speed",
              "FAQ risks: regulatory airspace FAA approval, weather downtime, and cold-chain pharmaceutical preservation",
              "Definition of success: on-time delivery rate, safety record, and pharmacy adoption",
            ],
          },
        ],
      },
      "General Tech": {
        focus: "Core product lifecycles, user personas, MVP definition, and roadmap prioritization frameworks (RICE/MoSCoW).",
        interviewerPersona: "Structured, checks problem-solution fit and clear metric definitions.",
      },
    },
    easyQuestions: [
      {
        topic: "Product Sense",
        subtopic: "Product Teardown & Redesign",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "Pick a digital product you use frequently that frustrates you. Who is the target user, what is the core friction point, and how would you redesign it?",
        expectedKeyPoints: [
          "Clear user persona and context of use",
          "Specific pain point definition rather than vague complaints",
          "Prioritized solution with measurable success metrics",
        ],
      },
      {
        topic: "Execution & Metrics",
        subtopic: "North Star Metric Selection",
        questionType: "Technical",
        difficulty: "Easy",
        questionText: "How do you select a North Star Metric for a two-sided marketplace product? What guardrail metrics would you track alongside it?",
        expectedKeyPoints: [
          "Reflecting core value delivered to both sides of the market",
          "Guardrail metrics: churn rate, dispute rate, latency, cancellation rate",
          "Avoiding vanity metrics like signups without active retention",
        ],
      },
      {
        topic: "Feature Specification",
        subtopic: "Writing User Stories & Acceptance Criteria",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "How do you structure a Product Requirement Document (PRD) for a new user onboarding flow so engineering and design teams have clear scope and zero ambiguity?",
        expectedKeyPoints: [
          "Problem statement and user persona context",
          "Explicit non-goals and out-of-scope boundaries",
          "Detailed user stories with Given-When-Then acceptance criteria",
        ],
      },
    ],
    mediumQuestions: [
      {
        topic: "Roadmap Prioritization",
        subtopic: "Balancing Tech Debt vs Features",
        questionType: "Situational",
        difficulty: "Medium",
        questionText: "Your engineering team insists on dedicating 50% of the next quarter to rewriting backend services, while the sales team demands 3 critical enterprise features to close Q4 deals. How do you resolve this roadmap conflict?",
        expectedKeyPoints: [
          "Quantifying technical debt risk in terms of revenue, SLA outages, and developer velocity",
          "Negotiating a phased allocation (e.g. 70/30 or 80/20 rule)",
          "Aligning both engineering and sales leadership around shared quarterly OKRs",
        ],
      },
      {
        topic: "User Empathy & Discovery",
        subtopic: "Customer Interview Synthesis",
        questionType: "Behavioral",
        difficulty: "Medium",
        questionText: "How do you conduct customer discovery interviews to differentiate between what users say they want versus what problem they actually need solved?",
        expectedKeyPoints: [
          "Focusing on past user behavior rather than future speculation (The Mom Test)",
          "Digging into workarounds users currently employ to solve their problem",
          "Synthesizing qualitative interview notes into structured Jobs-To-Be-Done (JTBD)",
        ],
      },
      {
        topic: "Pricing & Packaging",
        subtopic: "Freemium vs Paid Tier Differentiation",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "How do you design the paywall trigger and feature gating for a B2B SaaS productivity tool transitioning from pure freemium to a multi-tiered monetization model?",
        expectedKeyPoints: [
          "Identifying usage-based value metrics (seats, storage, advanced workflows)",
          "Preserving sufficient free utility for viral top-of-funnel acquisition",
          "Setting enterprise gates around security (SSO/SAML, audit logs, role-based permissions)",
        ],
      },
    ],
  },

  "UI/UX Design": {
    name: "UI/UX Design",
    description: "Visual design systems, user interaction, wireframing, accessibility (WCAG), and usability heuristics.",
    roles: ["UI/UX Designer", "Product Designer", "UX Researcher", "Design Systems Engineer"],
    topCompanies: ["Apple", "Airbnb", "Stripe", "Figma", "Google"],
    skillCategories: [
      "Visual Hierarchy and Design Systems",
      "Interaction Design and Usability",
      "Accessibility (WCAG 2.1 AA) and Inclusivity",
      "User Research and Heuristic Evaluation",
      "Design-to-Engineering Handoff and Prototyping",
    ],
    companyStyles: {
      "Apple": {
        focus: "Human Interface Guidelines (HIG), haptic feedback, fluid motion, visual clarity, and respect for user attention.",
        interviewerPersona: "Exacting about micro-interactions, typographic rhythm, and seamless hardware-software integration.",
        keyQuestionsHard: [
          {
            topic: "Interaction Design & HIG",
            subtopic: "Spatial Computing Ergonomics",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Design the navigation and focus management model for a hands-free spatial computing app. How do you provide accessible feedback without causing visual fatigue or eye strain?",
            expectedKeyPoints: [
              "Gaze and pinch micro-interactions adhering to Apple Human Interface Guidelines",
              "Subtle depth elevation and acoustic feedback rather than heavy visual highlights",
              "Accessibility support for voice control, switch control, and motor limitations",
              "Typography legibility across varying virtual lighting environments",
            ],
          },
        ],
      },
      "General Tech": {
        focus: "Usability heuristics, user journey maps, wireframe fidelity progression, and design system tokens.",
        interviewerPersona: "Constructive, checks user-centric rationale and design system consistency.",
      },
    },
    easyQuestions: [
      {
        topic: "Design Systems & Foundations",
        subtopic: "Typography & Color Tokens",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "How do you establish a scalable typographic hierarchy and accessible color palette for a product design system?",
        expectedKeyPoints: [
          "Modular type scale with clear semantic tokens",
          "WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)",
          "Functional semantic color roles (primary, surface, error, success)",
        ],
      },
      {
        topic: "Usability Fundamentals",
        subtopic: "Fitts's Law & Touch Targets",
        questionType: "Technical",
        difficulty: "Easy",
        questionText: "Explain Fitts's Law in UI design and how it influences mobile button placement, touch targets, and floating action button (FAB) ergonomics.",
        expectedKeyPoints: [
          "Time to acquire target is function of distance and target size",
          "Minimum 44x44px or 48x48px touch targets for mobile accessibility",
          "Thumb zone ergonomics on one-handed mobile devices",
        ],
      },
    ],
    mediumQuestions: [
      {
        topic: "Accessibility & Design Standards",
        subtopic: "Accessible Data Visualization",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "How do you design complex data charts that are fully accessible for color-blind users and screen readers?",
        expectedKeyPoints: [
          "Using patterns, line strokes, and direct labels alongside color palettes",
          "Providing underlying accessible data tables (HTML table / ARIA live regions)",
          "Ensuring keyboard navigation and focus management across interactive data points",
        ],
      },
      {
        topic: "Design-to-Engineering Workflow",
        subtopic: "Token Handoff & Auto-Layout",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "How do you structure design system handoff in Figma to minimize visual discrepancy and responsive layout bugs in frontend implementation?",
        expectedKeyPoints: [
          "Aligning Figma auto-layout properties directly with CSS Flexbox and Grid models",
          "Exporting semantic design tokens via Style Dictionary to CSS custom properties",
          "Documenting interactive states (hover, focus, disabled, loading) for every component",
        ],
      },
      {
        topic: "Micro-interactions & Delight",
        subtopic: "State Transitions & Feedback",
        questionType: "Interaction Design",
        difficulty: "Medium",
        questionText: "Design the micro-interaction and skeleton loading state for an e-commerce checkout button from click, to authorization spinner, to success checkmark.",
        expectedKeyPoints: [
          "Preventing accidental double submissions by disabling pointer events immediately",
          "Smooth easing curves (cubic-bezier) and duration bounds (<300ms)",
          "Accessible ARIA status announcements for screen readers during loading",
        ],
      },
    ],
  },

  "DevOps & Cloud": {
    name: "DevOps & Cloud",
    description: "CI/CD automation, container orchestration, infrastructure as code, observability, and cloud security.",
    roles: ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer (SRE)", "Infrastructure Engineer"],
    topCompanies: ["Amazon (AWS)", "Microsoft (Azure)", "Google (GCP)", "Netflix", "Uber"],
    skillCategories: [
      "Infrastructure as Code and Cloud Architecture",
      "CI/CD Pipeline Automation and Security",
      "Container Orchestration (Kubernetes) and Networking",
      "Observability, SLIs/SLOs, and Incident Management",
      "High Availability and Disaster Recovery",
    ],
    companyStyles: {
      "Amazon (AWS)": {
        focus: "Well-Architected Framework (Security, Reliability, Performance, Cost, Operational Excellence, Sustainability).",
        interviewerPersona: "Operational, asks about VPC topology, IAM least privilege, and multi-AZ failovers.",
        keyQuestionsHard: [
          {
            topic: "AWS Well-Architected Framework",
            subtopic: "Multi-Region Active-Active",
            questionType: "System Design",
            difficulty: "Hard",
            questionText: "Design a multi-region active-active architecture on AWS using Route 53, Aurora Global Database, and ECS/Fargate. How do you handle write conflicts and split-brain scenarios during region failover?",
            expectedKeyPoints: [
              "Route 53 latency-based routing with health check failover triggers",
              "Aurora Global Database replication lag monitoring",
              "Handling write conflicts: single-writer region vs application-level conflict resolution",
              "Cross-region IAM roles and KMS key replication",
            ],
          },
        ],
      },
      "General Tech": {
        focus: "Standard Dockerization, GitHub Actions / GitLab CI, basic Terraform provisioning, and Prometheus/Grafana monitoring.",
        interviewerPersona: "Practical, checks fundamentals of build pipelines, secrets handling, and deployment strategies.",
      },
    },
    easyQuestions: [
      {
        topic: "CI/CD & Deployments",
        subtopic: "Blue/Green vs Canary Rollouts",
        questionType: "Conceptual",
        difficulty: "Easy",
        questionText: "Compare Blue/Green deployment with Canary deployment. What are the advantages, risks, and monitoring requirements of each?",
        expectedKeyPoints: [
          "Blue/Green: Instant switchover between two identical environments, easy rollback",
          "Canary: Incremental traffic shift, minimal blast radius, automated metric validation",
          "Automated health checks and rollback thresholds",
        ],
      },
      {
        topic: "Containers & Orchestration",
        subtopic: "Kubernetes Core Architecture",
        questionType: "Technical",
        difficulty: "Easy",
        questionText: "What is the difference between a Kubernetes Pod, Deployment, and Service? How do they work together to serve web traffic?",
        expectedKeyPoints: [
          "Pod: smallest deployable container unit",
          "Deployment: replica sets, rolling updates, desired state",
          "Service: stable networking endpoint, DNS name, load balancing",
        ],
      },
    ],
    mediumQuestions: [
      {
        topic: "Infrastructure as Code",
        subtopic: "Terraform State Management & Drift",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "How do you manage remote Terraform state in a team of 30 engineers to prevent state locking conflicts, security credential leakage, and configuration drift?",
        expectedKeyPoints: [
          "Remote state storage (S3 + DynamoDB locking or Azure Blob lease)",
          "State file encryption at rest and role-based access control",
          "Automated drift detection cron pipelines and CI/CD plan reviews",
        ],
      },
      {
        topic: "Security & Secret Management",
        subtopic: "Zero-Secret CI/CD with OIDC",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "Why should you avoid storing long-lived AWS IAM or GCP credentials in GitHub Actions secrets? How does OpenID Connect (OIDC) federation solve this?",
        expectedKeyPoints: [
          "Short-lived temporary STS tokens generated via OIDC token exchange",
          "Eliminating credential rotation overhead and leak exposure risks",
          "Scoped IAM assume-role policies restricted to specific GitHub repositories and branches",
        ],
      },
      {
        topic: "Observability & Alerting",
        subtopic: "SLIs, SLOs, and Error Budgets",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "How do you define actionable Service Level Indicators (SLIs) and Service Level Objectives (SLOs) for an HTTP API to prevent alert fatigue on on-call engineers?",
        expectedKeyPoints: [
          "Focusing on user-facing symptoms (p99 latency, success rate) rather than internal metrics (CPU %)",
          "Multi-window burn rate alerts to page only on rapid budget consumption",
          "Establishing clear freeze policies when error budget is exhausted",
        ],
      },
    ],
  },

  "HR & Leadership": {
    name: "HR & Leadership",
    description: "Behavioral assessment, STAR methodology, conflict resolution, talent strategy, and culture building.",
    roles: ["HR Specialist", "Talent Acquisition Lead", "Engineering Manager", "People Operations Manager"],
    topCompanies: ["Google", "Microsoft", "Amazon", "Salesforce", "HubSpot"],
    skillCategories: [
      "Behavioral and Situational Leadership",
      "Conflict Resolution and Team Dynamics",
      "Talent Acquisition and Structured Interviewing",
      "Performance Management and Coaching",
      "Organizational Culture and Employee Retention",
    ],
    companyStyles: {
      "Google": {
        focus: "Googleyness, navigating ambiguity, inclusive team culture, and Project Aristotle psychological safety.",
        interviewerPersona: "Thoughtful, checks for self-awareness, intellectual humility, and inclusive leadership.",
        keyQuestionsHard: [
          {
            topic: "Leadership & Psychological Safety",
            subtopic: "Navigating High-Stakes Disagreement",
            questionType: "Behavioral",
            difficulty: "Hard",
            questionText: "Describe a situation where two principal engineers strongly disagreed on a fundamental architectural migration, threatening project timelines. How did you facilitate consensus while maintaining team psychological safety?",
            expectedKeyPoints: [
              "Objective evaluation criteria grounded in business metrics and data",
              "Creating safe space for technical dissent without personal friction",
              "Establishing timeboxed spike prototypes to test hypotheses empirically",
              "Clear decision ownership and team commitment",
            ],
          },
        ],
      },
      "General Tech": {
        focus: "Core behavioral frameworks, STAR method, conflict management, and structured hiring standards.",
        interviewerPersona: "Warm, structured, guides candidate through situation, action, and measurable outcomes.",
      },
    },
    easyQuestions: [
      {
        topic: "Behavioral Fundamentals",
        subtopic: "STAR Method & Accountability",
        questionType: "Behavioral",
        difficulty: "Easy",
        questionText: "Tell me about a time you made a significant mistake at work that affected colleagues or customers. How did you take ownership and resolve it?",
        expectedKeyPoints: [
          "Clear Situation and Task context",
          "Personal Action taken to remediate the issue immediately",
          "Measurable Result and lasting process improvement",
        ],
      },
      {
        topic: "Constructive Feedback",
        subtopic: "Receiving Critical Review",
        questionType: "Behavioral",
        difficulty: "Easy",
        questionText: "Describe a time you received tough, critical feedback about your work. How did you process the feedback and take action?",
        expectedKeyPoints: [
          "Active listening without defensiveness",
          "Clarifying specific examples to understand root causes",
          "Tangible behavioral adjustments and follow-up with the reviewer",
        ],
      },
    ],
    mediumQuestions: [
      {
        topic: "Performance Coaching",
        subtopic: "Continuous Feedback vs Annual Reviews",
        questionType: "Situational",
        difficulty: "Medium",
        questionText: "How do you establish a regular cadence of lightweight, continuous feedback in your team so that formal performance reviews contain zero surprises?",
        expectedKeyPoints: [
          "Bi-weekly 1-on-1s focused on growth goals and immediate feedback",
          "Documenting accomplishments and alignment in shared notes throughout the quarter",
          "Timely course-correction within 48 hours of an issue rather than waiting for annual reviews",
        ],
      },
      {
        topic: "Diversity & Inclusive Hiring",
        subtopic: "Mitigating Interviewer Bias",
        questionType: "Technical",
        difficulty: "Medium",
        questionText: "What concrete mechanisms do you introduce into a technical hiring pipeline to detect and mitigate affinity bias and halo effect during candidate debriefs?",
        expectedKeyPoints: [
          "Blind resume screening and standardized question rubrics",
          "Independent written score submission before opening verbal debrief discussions",
          "Designating a bar raiser / moderator to challenge subjective statements lacking behavioral evidence",
        ],
      },
      {
        topic: "Organizational Scaling",
        subtopic: "Onboarding at Scale",
        questionType: "Conceptual",
        difficulty: "Medium",
        questionText: "How do you design an engineering onboarding program that reduces time-to-first-commit from 3 weeks to 3 days while ensuring cultural assimilation?",
        expectedKeyPoints: [
          "Pre-configured dev environments (devcontainers/codespaces)",
          "Designated onboarding buddy and clear first-week milestone tickets",
          "Structured 30-60-90 day check-ins with explicit expectations",
        ],
      },
    ],
  },
};

/* =========================================================
   SPECIALIZED CODING INTERVIEW CHALLENGES & TEST RUNNERS
========================================================= */
const CODING_PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum (Target Hash Map)",
    topic: "Arrays & Hash Tables",
    difficulty: "Easy",
    questionType: "Coding",
    companyStyle: "Google",
    questionText: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. Aim for O(n) time complexity.",
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n  // Return an array of two indices [i, j]\n  return [];\n}",
      python: "def two_sum(nums, target):\n    # Write your code here\n    # Return a list of two indices [i, j]\n    return []",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}",
      cpp: "#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};",
      sql: "-- Write your SQL query here\nSELECT a.id AS id1, b.id AS id2 FROM Numbers a JOIN Numbers b ON a.id < b.id WHERE (a.val + b.val) = 100;",
    },
    referenceSolution: {
      javascript: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      python: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}",
      cpp: "#include <vector>\n#include <unordered_map>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.find(complement) != map.end()) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};",
      sql: "SELECT a.id AS id1, b.id AS id2 FROM Numbers a JOIN Numbers b ON a.id < b.id AND (a.val + b.val) = 100;",
    },
    hints: [
      "A brute force O(n^2) approach checks every pair of elements. Can you check for the complement in O(1) time?",
      "Use a Hash Map to store each number and its index as you iterate through the array.",
      "For each element nums[i], compute complement = target - nums[i]. Check if complement exists in your map before inserting.",
    ],
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
      { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]" },
    ],
    expectedKeyPoints: [
      "O(n) single-pass hash map approach instead of O(n^2) brute-force nested loop",
      "Handling duplicate values correctly by checking before inserting",
      "Zero-indexed index pairs returned",
    ],
  },
  {
    id: "merge-intervals",
    title: "Merge Overlapping Intervals",
    topic: "Sorting & Array Scanning",
    difficulty: "Medium",
    questionType: "Coding",
    companyStyle: "Meta",
    questionText: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    starterCode: {
      javascript: "function merge(intervals) {\n  // Write your code here\n  // Return an array of merged intervals\n  return [];\n}",
      python: "def merge(intervals):\n    # Write your code here\n    # Return merged list of intervals\n    return []",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your code here\n        return new int[0][0];\n    }\n}",
      cpp: "#include <vector>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {\n        // Write your code here\n        return {};\n    }\n};",
      sql: "-- Write your SQL query here\n",
    },
    referenceSolution: {
      javascript: "function merge(intervals) {\n  if (!intervals.length) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const current = intervals[i];\n    const last = merged[merged.length - 1];\n    if (current[0] <= last[1]) {\n      last[1] = Math.max(last[1], current[1]);\n    } else {\n      merged.push(current);\n    }\n  }\n  return merged;\n}",
      python: "def merge(intervals):\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        last = merged[-1]\n        if current[0] <= last[1]:\n            last[1] = max(last[1], current[1])\n        else:\n            merged.append(current)\n    return merged",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        java.util.Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        java.util.List<int[]> result = new java.util.ArrayList<>();\n        int[] current = intervals[0];\n        result.add(current);\n        for (int[] interval : intervals) {\n            if (interval[0] <= current[1]) {\n                current[1] = Math.max(current[1], interval[1]);\n            } else {\n                current = interval;\n                result.add(current);\n            }\n        }\n        return result.toArray(new int[result.size()][]);\n    }\n}",
      cpp: "#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        std::sort(intervals.begin(), intervals.end());\n        std::vector<std::vector<int>> merged = {intervals[0]};\n        for (size_t i = 1; i < intervals.size(); i++) {\n            if (intervals[i][0] <= merged.back()[1]) {\n                merged.back()[1] = std::max(merged.back()[1], intervals[i][1]);\n            } else {\n                merged.push_back(intervals[i]);\n            }\n        }\n        return merged;\n    }\n};",
      sql: "SELECT user_id, MIN(start_date) AS period_start, MAX(end_date) AS period_end FROM UserSessions GROUP BY user_id;",
    },
    hints: [
      "If the intervals are sorted by their start value, overlapping intervals are guaranteed to be adjacent.",
      "Sort the list of intervals by the first element of each interval in O(n log n).",
      "Traverse through the intervals: if current interval overlaps with the last added interval in your merged list, update last interval end.",
    ],
    testCases: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
      { input: "intervals = [[1,4],[4,5]]", expectedOutput: "[[1,5]]" },
      { input: "intervals = [[1,4],[2,3]]", expectedOutput: "[[1,4]]" },
    ],
    expectedKeyPoints: [
      "Sort intervals by start time in O(n log n)",
      "Linear scan comparing current start time with previous end time",
      "In-place or auxiliary list mutation maintaining interval boundaries",
    ],
  },
  {
    id: "longest-substring-without-repeats",
    title: "Longest Substring Without Repeating Characters",
    topic: "Sliding Window & Hash Sets",
    difficulty: "Medium",
    questionType: "Coding",
    companyStyle: "Amazon",
    questionText: "Given a string s, find the length of the longest substring without repeating characters. Explain time and space complexity with sliding window bounds.",
    starterCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n  // Write your code here\n  // Return the maximum length integer\n  return 0;\n}",
      python: "def length_of_longest_substring(s: str) -> int:\n    # Write your code here\n    # Return maximum length integer\n    return 0",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}",
      cpp: "#include <string>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        // Write your code here\n        return 0;\n    }\n};",
      sql: "-- Write your SQL query here\n",
    },
    referenceSolution: {
      javascript: "function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let left = 0;\n  const charMap = new Map();\n  for (let right = 0; right < s.length; right++) {\n    const char = s[right];\n    if (charMap.has(char) && charMap.get(char) >= left) {\n      left = charMap.get(char) + 1;\n    }\n    charMap.set(char, right);\n    maxLength = Math.max(maxLength, right - left + 1);\n  }\n  return maxLength;\n}",
      python: "def length_of_longest_substring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_length = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_length = max(max_length, right - left + 1)\n    return max_length",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int maxLength = 0, left = 0;\n        java.util.Map<Character, Integer> map = new java.util.HashMap<>();\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (map.containsKey(c) && map.get(c) >= left) {\n                left = map.get(c) + 1;\n            }\n            map.put(c, right);\n            maxLength = Math.max(maxLength, right - left + 1);\n        }\n        return maxLength;\n    }\n}",
      cpp: "#include <string>\n#include <unordered_map>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        std::unordered_map<char, int> map;\n        int left = 0, max_len = 0;\n        for (int right = 0; right < s.length(); right++) {\n            if (map.find(s[right]) != map.end() && map[s[right]] >= left) {\n                left = map[s[right]] + 1;\n            }\n            map[s[right]] = right;\n            max_len = std::max(max_len, right - left + 1);\n        }\n        return max_len;\n    }\n};",
      sql: "SELECT user_id, COUNT(*) AS streak_days FROM (SELECT user_id, login_date, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn FROM Logins) t GROUP BY user_id;",
    },
    hints: [
      "Use two pointers (left and right) to maintain a sliding window of unique characters.",
      "Store the most recent index of each character in a Hash Map to jump the left pointer forward in O(1).",
      "Remember to ensure the jumped left pointer does not move backward when encountering an old occurrence.",
    ],
    testCases: [
      { input: "s = 'abcabcbb'", expectedOutput: "3" },
      { input: "s = 'bbbbb'", expectedOutput: "1" },
      { input: "s = 'pwwkew'", expectedOutput: "3" },
    ],
    expectedKeyPoints: [
      "Sliding window pointers (left, right) achieving O(n) runtime",
      "Character-to-last-index map for instant pointer jumps",
      "Handling empty string and single character edge cases",
    ],
  },
  {
    id: "lru-cache-impl",
    title: "LRU Cache Design & Implementation",
    topic: "System Data Structures & Concurrency",
    difficulty: "Hard",
    questionType: "Coding",
    companyStyle: "Stripe",
    questionText: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement LRUCache class with get(key) and put(key, value) in O(1) average time complexity.",
    starterCode: {
      javascript: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    // Write your data structure initialization here\n  }\n  get(key) {\n    // Return key value or -1 if not found\n    return -1;\n  }\n  put(key, value) {\n    // Insert or update key value and evict LRU item if exceeding capacity\n  }\n}",
      python: "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        # Write your initialization here\n        pass\n    def get(self, key: int) -> int:\n        # Return key value or -1\n        return -1\n    def put(self, key: int, value: int) -> None:\n        # Insert or update\n        pass",
      java: "class LRUCache {\n    private int capacity;\n    public LRUCache(int capacity) {\n        this.capacity = capacity;\n    }\n    public int get(int key) {\n        return -1;\n    }\n    public void put(int key, int value) {\n    }\n}",
      cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) {\n    }\n    int get(int key) {\n        return -1;\n    }\n    void put(int key, int value) {\n    }\n};",
      sql: "-- Write your SQL query here\n",
    },
    referenceSolution: {
      javascript: "class Node {\n  constructor(key = 0, val = 0) {\n    this.key = key;\n    this.val = val;\n    this.prev = null;\n    this.next = null;\n  }\n}\n\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n    this.head = new Node();\n    this.tail = new Node();\n    this.head.next = this.tail;\n    this.tail.prev = this.head;\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const node = this.map.get(key);\n    this._remove(node);\n    this._insert(node);\n    return node.val;\n  }\n  put(key, value) {\n    if (this.map.has(key)) {\n      this._remove(this.map.get(key));\n    }\n    const newNode = new Node(key, value);\n    this.map.set(key, newNode);\n    this._insert(newNode);\n    if (this.map.size > this.capacity) {\n      const lru = this.head.next;\n      this._remove(lru);\n      this.map.delete(lru.key);\n    }\n  }\n  _remove(node) {\n    node.prev.next = node.next;\n    node.next.prev = node.prev;\n  }\n  _insert(node) {\n    node.prev = this.tail.prev;\n    node.next = this.tail;\n    this.tail.prev.next = node;\n    this.tail.prev = node;\n  }\n}",
      python: "class Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n        self.head = Node()\n        self.tail = Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node)\n            self._insert(node)\n            return node.val\n        return -1\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._insert(node)\n        if len(self.cache) > self.capacity:\n            lru = self.head.next\n            self._remove(lru)\n            del self.cache[lru.key]\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n    def _insert(self, node):\n        node.prev = self.tail.prev\n        node.next = self.tail\n        self.tail.prev.next = node\n        self.tail.prev = node",
      java: "class LRUCache {\n    private final int capacity;\n    private final java.util.Map<Integer, Integer> map;\n    public LRUCache(int capacity) {\n        this.capacity = capacity;\n        this.map = new java.util.LinkedHashMap<>(capacity, 0.75f, true) {\n            protected boolean removeEldestEntry(java.util.Map.Entry<Integer, Integer> eldest) {\n                return size() > capacity;\n            }\n        };\n    }\n    public int get(int key) {\n        return map.getOrDefault(key, -1);\n    }\n    public void put(int key, int value) {\n        map.put(key, value);\n    }\n}",
      cpp: "#include <unordered_map>\n#include <list>\n\nclass LRUCache {\n    int cap;\n    std::list<std::pair<int, int>> lru;\n    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> map;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    int get(int key) {\n        if (map.find(key) == map.end()) return -1;\n        lru.splice(lru.begin(), lru, map[key]);\n        return map[key]->second;\n    }\n    void put(int key, int value) {\n        if (map.find(key) != map.end()) {\n            lru.splice(lru.begin(), lru, map[key]);\n            map[key]->second = value;\n            return;\n        }\n        if (map.size() == cap) {\n            map.erase(lru.back().first);\n            lru.pop_back();\n        }\n        lru.emplace_front(key, value);\n        map[key] = lru.begin();\n    }\n};",
      sql: "DELETE FROM CacheStore WHERE key NOT IN (SELECT key FROM CacheStore ORDER BY last_accessed DESC LIMIT 1000);",
    },
    hints: [
      "To achieve O(1) time for both get and put operations, consider pairing a Hash Map with a Doubly Linked List.",
      "The Hash Map allows O(1) access to nodes. The Doubly Linked List allows O(1) removal and re-insertion at head/tail.",
      "Use dummy sentinel head and tail nodes to eliminate edge-case null pointer checks during node splicing.",
    ],
    testCases: [
      { input: "LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);", expectedOutput: "[null, null, null, 1, null, -1]" },
    ],
    expectedKeyPoints: [
      "Doubly linked list combined with hash map for O(1) lookup, deletion, and insertion",
      "Sentinel head and tail nodes to avoid edge-case null pointer checks",
      "Proper eviction of least recently accessed node when capacity is exceeded",
    ],
  },
  {
    id: "sql-department-top-earners",
    title: "SQL Window Functions: Department Top Earners",
    topic: "Database Queries & Window Analytics",
    difficulty: "Hard",
    questionType: "Coding",
    companyStyle: "Apple",
    questionText: "Write a high-performance SQL query to find employees who have the highest salary in each of the departments. Compare DENSE_RANK() vs ROW_NUMBER() when handling tied salaries.",
    starterCode: {
      sql: "-- Write your SQL window query below\nSELECT Department, Employee, Salary FROM (\n  -- Subquery or CTE\n) ranked WHERE ranking = 1;",
      javascript: "function topEarnersByDept(employees, departments) {\n  // Write your ranking simulation in JavaScript\n  return [];\n}",
      python: "def top_earners(employees, departments):\n    # Write your ranking simulation in Python\n    return []",
      java: "// Write your Java stream simulation",
      cpp: "// Write your C++ ranking simulation",
    },
    referenceSolution: {
      sql: "WITH RankedSalaries AS (\n  SELECT\n    d.name AS Department,\n    e.name AS Employee,\n    e.salary AS Salary,\n    DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS ranking\n  FROM Employee e\n  JOIN Department d ON e.departmentId = d.id\n)\nSELECT Department, Employee, Salary\nFROM RankedSalaries\nWHERE ranking <= 3;",
      javascript: "function topEarnersByDept(employees, departments) {\n  const deptMap = new Map(departments.map(d => [d.id, d.name]));\n  const grouped = {};\n  employees.forEach(e => {\n    if (!grouped[e.departmentId]) grouped[e.departmentId] = [];\n    grouped[e.departmentId].push(e);\n  });\n  const result = [];\n  Object.keys(grouped).forEach(deptId => {\n    const sorted = grouped[deptId].sort((a, b) => b.salary - a.salary).slice(0, 3);\n    sorted.forEach(e => result.push({ Department: deptMap.get(Number(deptId)), Employee: e.name, Salary: e.salary }));\n  });\n  return result;\n}",
      python: "from collections import defaultdict\ndef top_earners(employees, departments):\n    dept_map = {d['id']: d['name'] for d in departments}\n    grouped = defaultdict(list)\n    for e in employees:\n        grouped[e['departmentId']].append(e)\n    result = []\n    for dept_id, staff in grouped.items():\n        staff.sort(key=lambda x: x['salary'], reverse=True)\n        for e in staff[:3]:\n            result.append({'Department': dept_map[dept_id], 'Employee': e['name'], 'Salary': e['salary']})\n    return result",
      java: "// Java Stream API partition grouping simulation",
      cpp: "// C++ hash map grouping with partial_sort",
    },
    hints: [
      "Use the DENSE_RANK() window function partitioned by departmentId and ordered by salary DESC.",
      "Wrap the window ranking inside a Common Table Expression (CTE) or subquery so you can filter by ranking <= 1.",
      "Understand the difference: DENSE_RANK() assigns the same rank to ties without skipping subsequent ranks.",
    ],
    testCases: [
      { input: "Employee: [{id:1, name:'Joe', salary:85000, departmentId:1}, {id:2, name:'Henry', salary:80000, departmentId:2}, {id:3, name:'Sam', salary:60000, departmentId:2}, {id:4, name:'Max', salary:90000, departmentId:1}]", expectedOutput: "Department Top Earners by ranking" },
    ],
    expectedKeyPoints: [
      "DENSE_RANK() partition by departmentId ordered by salary descending",
      "Distinction between RANK(), DENSE_RANK(), and ROW_NUMBER() during salary ties",
      "Common Table Expression (CTE) readability and indexing requirements on (departmentId, salary)",
    ],
  },
];

/* =========================================================
   APTITUDE & REASONING QUESTION BANK (MCQS + DERIVATIONS)
========================================================= */
const APTITUDE_QUESTIONS = [
  {
    id: "apt-quant-1",
    topic: "Quantitative Aptitude",
    subtopic: "Time and Work Rates",
    difficulty: "Medium",
    questionType: "Aptitude",
    companyStyle: "General Tech",
    questionText: "Worker A can finish a software module in 10 days, while Worker B can complete the same module in 15 days. If both work together on the module, in how many days will the module be completed?",
    aptitudeOptions: [
      "A. 6 days",
      "B. 7.5 days",
      "C. 8 days",
      "D. 12.5 days",
    ],
    correctOptionIndex: 0,
    explanation: "Step 1: Calculate daily work rate for Worker A: 1/10 per day.\nStep 2: Calculate daily work rate for Worker B: 1/15 per day.\nStep 3: Combined daily rate = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6 per day.\nStep 4: Total days required = 1 / (1/6) = 6 days. Option A is correct.",
    expectedKeyPoints: ["Work rate summation formula: 1/A + 1/B = 1/Total", "6 days"],
  },
  {
    id: "apt-logic-1",
    topic: "Logical Reasoning",
    subtopic: "Syllogisms & Set Deductions",
    difficulty: "Medium",
    questionType: "Aptitude",
    companyStyle: "General Tech",
    questionText: "Statements:\n1. All microservices are scalable architectures.\n2. Some scalable architectures are event-driven systems.\n\nConclusions:\nI. Some microservices are event-driven systems.\nII. Some event-driven systems are scalable architectures.\n\nWhich conclusion(s) logically follow?",
    aptitudeOptions: [
      "A. Only conclusion I follows",
      "B. Only conclusion II follows",
      "C. Both conclusion I and II follow",
      "D. Neither conclusion I nor II follows",
    ],
    correctOptionIndex: 1,
    explanation: "Statement 2 asserts that 'Some scalable architectures are event-driven systems'. By direct converse conversion of particular affirmative statements (I-type), 'Some event-driven systems are scalable architectures' is unconditionally valid (Conclusion II follows). However, there is no direct middle term connection ensuring microservices overlap with the event-driven portion of scalable architectures, so Conclusion I does not necessarily follow. Option B is correct.",
    expectedKeyPoints: ["Converse relationship of particular affirmatives", "Only Conclusion II follows"],
  },
  {
    id: "apt-quant-2",
    topic: "Quantitative Aptitude",
    subtopic: "Probability & Permutations",
    difficulty: "Hard",
    questionType: "Aptitude",
    companyStyle: "General Tech",
    questionText: "Two fair 6-sided dice are rolled simultaneously in a network packet simulation. What is the exact probability that the sum of the numbers rolled is a prime number greater than 6?",
    aptitudeOptions: [
      "A. 1/6",
      "B. 2/9",
      "C. 5/36",
      "D. 7/36",
    ],
    correctOptionIndex: 1,
    explanation: "Prime numbers greater than 6 achievable with two dice are 7 and 11.\nFavorable outcomes for sum = 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) -> 6 pairs.\nFavorable outcomes for sum = 11: (5,6), (6,5) -> 2 pairs.\nTotal favorable pairs = 6 + 2 = 8 pairs.\nTotal sample space with two dice = 6 * 6 = 36.\nProbability = 8 / 36 = 2 / 9. Option B is correct.",
    expectedKeyPoints: ["Sample space of 36 pairs", "Sum of 7 (6 pairs) + sum of 11 (2 pairs) = 8/36 = 2/9"],
  },
  {
    id: "apt-data-1",
    topic: "Data Interpretation",
    subtopic: "Latency Ratios & Percentiles",
    difficulty: "Medium",
    questionType: "Aptitude",
    companyStyle: "General Tech",
    questionText: "A distributed database handles 40,000 requests per minute. Region X processes 45% of all traffic with an average latency of 20ms, while Region Y processes the remaining 55% of traffic with an average latency of 40ms. What is the weighted average request latency across the entire system?",
    aptitudeOptions: [
      "A. 28.5 ms",
      "B. 30.0 ms",
      "C. 31.0 ms",
      "D. 33.5 ms",
    ],
    correctOptionIndex: 2,
    explanation: "Weighted average latency = (Percentage X * Latency X) + (Percentage Y * Latency Y)\n= (0.45 * 20ms) + (0.55 * 40ms)\n= 9.0ms + 22.0ms = 31.0 ms. Option C is correct.",
    expectedKeyPoints: ["Weighted average calculation", "31.0 ms"],
  },
  {
    id: "apt-num-1",
    topic: "Quantitative Aptitude",
    subtopic: "Geometric Sequences",
    difficulty: "Easy",
    questionType: "Aptitude",
    companyStyle: "General Tech",
    questionText: "Find the missing term in the sequence representing memory buffer allocations: 3, 6, 12, 24, 48, ?",
    aptitudeOptions: [
      "A. 72",
      "B. 84",
      "C. 96",
      "D. 128",
    ],
    correctOptionIndex: 2,
    explanation: "Each subsequent term is multiplied by a common ratio of 2 (geometric progression): 3 * 2 = 6; 6 * 2 = 12; 12 * 2 = 24; 24 * 2 = 48; 48 * 2 = 96. Option C is correct.",
    expectedKeyPoints: ["Geometric sequence with ratio r=2", "96"],
  },
];

/* =========================================================
   LANGUAGE-SPECIFIC TECHNICAL DEEP DIVES
========================================================= */
const LANGUAGE_QUESTIONS = {
  javascript: [
    {
      topic: "JavaScript Runtime & Event Loop",
      subtopic: "Microtasks vs Macrotasks Execution Order",
      difficulty: "Hard",
      questionType: "Technical",
      companyStyle: "Meta",
      questionText: "Explain the exact execution order of Promise.then(), setTimeout(), queueMicrotask(), and process.nextTick() in Node.js / V8. What happens if a microtask recursively enqueues another microtask?",
      expectedKeyPoints: [
        "Call stack execution to completion before checking microtask queue",
        "Microtasks (Promises, queueMicrotask) execute before macrotasks (setTimeout, setInterval)",
        "process.nextTick queue has priority in Node.js before other microtasks",
        "Recursive microtasks starve the event loop and prevent I/O or rendering timers from executing",
      ],
    },
    {
      topic: "JavaScript Memory & Garbage Collection",
      subtopic: "WeakMap vs Map & Closures",
      difficulty: "Medium",
      questionType: "Technical",
      companyStyle: "Google",
      questionText: "How does WeakMap differ from Map in JavaScript regarding garbage collection? How do unintended closure references cause memory leaks in long-running single-page applications?",
      expectedKeyPoints: [
        "WeakMap holds weakly referenced keys allowing garbage collector to reclaim unreachable object keys",
        "WeakMap keys must be objects and are non-enumerable",
        "Closures retaining outer scope variables prevent referenced DOM nodes or large objects from being GCed",
      ],
    },
  ],
  python: [
    {
      topic: "Python Concurrency & Memory",
      subtopic: "GIL (Global Interpreter Lock) & Multiprocessing",
      difficulty: "Hard",
      questionType: "Technical",
      companyStyle: "Uber",
      questionText: "How does CPython's Global Interpreter Lock (GIL) impact CPU-bound vs I/O-bound multithreaded programs? When should you use asyncio versus multiprocessing or concurrent.futures?",
      expectedKeyPoints: [
        "GIL allows only one native thread to execute Python bytecode at a time",
        "I/O bound tasks release GIL during socket/disk operations making threading or asyncio highly effective",
        "CPU bound tasks require multiprocessing (ProcessPoolExecutor) to bypass GIL and utilize multiple CPU cores",
      ],
    },
    {
      topic: "Python Generators & Metaprogramming",
      subtopic: "Generators, Iterators, and Decorator Wrappers",
      difficulty: "Medium",
      questionType: "Technical",
      companyStyle: "Netflix",
      questionText: "Explain the internal mechanism of yield in Python generators. How do generators achieve lazy evaluation with O(1) space, and how do functools.wraps preserve decorator introspection?",
      expectedKeyPoints: [
        "Generators suspend frame state and local variables upon yield and resume with next()",
        "Constant O(1) memory consumption without allocating full lists",
        "functools.wraps copies __name__, __doc__, and annotations to the wrapper function",
      ],
    },
  ],
  java: [
    {
      topic: "Java Virtual Machine & Memory",
      subtopic: "JVM Memory Model & Garbage Collectors (G1 vs ZGC)",
      difficulty: "Hard",
      questionType: "Technical",
      companyStyle: "Amazon",
      questionText: "Walk through the JVM memory layout (Eden, Survivor, Tenured, Metaspace). How does the G1 collector balance pause times compared to ultra-low latency ZGC?",
      expectedKeyPoints: [
        "Young generation (Eden + Survivor spaces S0/S1) with minor GC and object aging promotion",
        "Tenured / Old generation collected during major GC cycles",
        "G1 partitions heap into regions prioritizing highest garbage collection yield",
        "ZGC uses colored pointers and load barriers for sub-millisecond concurrent collection",
      ],
    },
    {
      topic: "Java Concurrency & Project Loom",
      subtopic: "Virtual Threads vs Platform Threads",
      difficulty: "Hard",
      questionType: "Technical",
      companyStyle: "Netflix",
      questionText: "How do Java 21 Virtual Threads (Project Loom) differ from OS platform threads? How does carrier thread unmounting operate during blocking I/O operations?",
      expectedKeyPoints: [
        "Virtual threads are lightweight user-mode threads managed by the JVM rather than OS kernel",
        "JVM unmounts virtual thread from carrier thread upon blocking I/O (e.g. socket read)",
        "Enables millions of concurrent threads without memory footprint of OS stack frames",
      ],
    },
  ],
  typescript: [
    {
      topic: "TypeScript Type System Internals",
      subtopic: "Conditional Types & Type Narrowing with infer",
      difficulty: "Hard",
      questionType: "Technical",
      companyStyle: "Stripe",
      questionText: "How do conditional types and the infer keyword operate in TypeScript? Walk through how you would construct a generic type UnpackPromise<T> that unwraps nested Promise return types.",
      expectedKeyPoints: [
        "Conditional types syntax T extends U ? X : Y enabling distributive type operations over unions",
        "infer keyword introduces a type variable within the true branch of a conditional type",
        "Type narrowing using discriminated unions, in operator, and custom type predicates (x is Type)",
      ],
    },
  ],
  cpp: [
    {
      topic: "C++ Memory Model & Modern Idioms",
      subtopic: "RAII, Move Semantics & Smart Pointers",
      difficulty: "Hard",
      companyStyle: "Google",
      questionText: "Explain how Move Semantics (std::move and rvalue references &&) eliminate expensive deep copies in modern C++. How do std::unique_ptr and std::shared_ptr manage resource lifecycles through RAII?",
      expectedKeyPoints: [
        "rvalue references allow transferring ownership of heap allocated memory by swapping internal pointers",
        "std::unique_ptr enforces zero-overhead single ownership with deleted copy constructor",
        "std::shared_ptr utilizes an atomic reference-counted control block to manage shared lifetime",
        "std::weak_ptr prevents cyclical reference memory leaks",
      ],
    },
  ],
  c: [
    {
      topic: "C Memory Management & Pointers",
      subtopic: "Manual Heap Allocation & Pointer Arithmetic",
      difficulty: "Hard",
      companyStyle: "Apple",
      questionText: "Walk through the memory layout of a C program (text, data, BSS, heap, stack). How does pointer arithmetic interact with array indexing, and how do you prevent buffer overflows and dangling pointers?",
      expectedKeyPoints: [
        "Stack grows downward for local stack frames while heap grows upward via malloc/brk",
        "Pointer arithmetic scales increments automatically by sizeof(type)",
        "Dangling pointer mitigation: zeroing pointers post free() and strict bounds checking",
      ],
    },
  ],
  go: [
    {
      topic: "Go Concurrency & Runtime",
      subtopic: "Goroutines, GMP Scheduler, and Channels",
      difficulty: "Hard",
      companyStyle: "Uber",
      questionText: "How does the Go runtime scheduler (GMP model: Goroutines, Machines, Processors) achieve work-stealing and cooperative preemption? How do buffered vs unbuffered channels synchronize memory without explicit mutexes?",
      expectedKeyPoints: [
        "GMP model maps M OS threads to P logical processors executing G goroutines with small initial 2KB stacks",
        "Work stealing: idle P steals runnable goroutines from local run queues of other processors",
        "Unbuffered channels perform synchronous handoff between sender and receiver goroutines",
        "CSP (Communicating Sequential Processes) memory synchronization principles",
      ],
    },
  ],
  rust: [
    {
      topic: "Rust Ownership & Concurrency",
      subtopic: "Borrow Checker, Lifetimes & Zero-Cost Concurrency",
      difficulty: "Hard",
      companyStyle: "Microsoft",
      questionText: "Explain how Rust's borrow checker enforces memory safety and prevents data races at compile time without a garbage collector. How do lifetimes ('a) guarantee reference validity?",
      expectedKeyPoints: [
        "Ownership rules: each value has a single owner, and values are dropped when owner goes out of scope",
        "Aliasing XOR mutability: either one mutable reference (&mut T) or multiple immutable references (&T)",
        "Lifetimes ensure references never outlive the data they point to, preventing dangling pointers",
        "Send and Sync traits govern thread-safe ownership transfer and immutable sharing across threads",
      ],
    },
  ],
  sql: [
    {
      topic: "SQL Indexing & Execution Plans",
      subtopic: "B-Tree Indexes vs Table Scans & Composite Index Order",
      difficulty: "Hard",
      questionType: "Technical",
      companyStyle: "Uber",
      questionText: "Explain how B-tree indexes speed up range queries. Why does column ordering in a composite index (A, B) matter, and when will the database engine fall back to an index skip scan or full table scan?",
      expectedKeyPoints: [
        "Leftmost prefix rule for composite indexes (queries filtering on B without A cannot perform normal seek)",
        "B-Tree logarithmic search and sequential leaf node traversal for range bounds",
        "High selectivity vs low cardinality trade-offs when optimizer chooses table scan",
      ],
    },
  ],
};

/* =========================================================
   DOMAIN & ROLE VALIDATOR
========================================================= */
function validateDomainAndRole(domain, role) {
  if (!domain || typeof domain !== "string" || !domain.trim()) {
    return {
      isValid: false,
      message: "Target domain/discipline is required.",
    };
  }

  if (!role || typeof role !== "string" || !role.trim()) {
    return {
      isValid: false,
      message: "Target role persona is required.",
    };
  }

  const dName = domain.trim();
  const rName = role.trim();

  if (rName.length < 2) {
    return {
      isValid: false,
      message: "Please specify a valid role title (e.g. Backend Developer, ML Engineer).",
    };
  }

  const domainConfig = getDomainConfig(dName);
  if (domainConfig && Array.isArray(domainConfig.roles)) {
    const isExactPredefined = domainConfig.roles.some((r) => r.toLowerCase() === rName.toLowerCase());
    if (isExactPredefined) {
      return { isValid: true, domain: domainConfig.name, role: rName };
    }
  }

  const rLower = rName.toLowerCase();
  const dLower = dName.toLowerCase();

  const incompatibleRoles = [
    "plumber", "carpenter", "electrician", "mechanic", "chef", "cook", "driver", "trucker",
    "pilot", "doctor", "surgeon", "dentist", "nurse", "pharmacist", "janitor", "cleaner",
    "cashier", "waiter", "waitress", "barista", "farmer", "gardener", "florist", "tailor",
    "actor", "actress", "singer", "dancer", "athlete", "coach", "painter", "sculptor",
  ];

  for (const badRole of incompatibleRoles) {
    if (rLower === badRole || rLower.startsWith(badRole + " ") || rLower.endsWith(" " + badRole)) {
      const suggested = domainConfig?.roles?.slice(0, 4).join(", ") || "Software Engineer, Backend Developer, Systems Architect";
      return {
        isValid: false,
        message: `The role "${rName}" is not compatible with the "${dName}" domain. Suggested roles for ${dName}: ${suggested}.`,
        suggestedRoles: domainConfig?.roles || [],
      };
    }
  }

  return { isValid: true, domain: domainConfig?.name || dName, role: rName };
}

/* =========================================================
   DOMAIN RESOLVER & EXPORTS
========================================================= */
function getDomainConfig(domainName) {
  if (!domainName) return DOMAINS["Software Engineering"];
  
  if (DOMAINS[domainName]) return DOMAINS[domainName];

  const lower = domainName.toLowerCase();
  for (const key of Object.keys(DOMAINS)) {
    if (key.toLowerCase() === lower || key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return DOMAINS[key];
    }
  }

  if (lower.includes("software") || lower.includes("swe") || lower.includes("engineer") || lower.includes("developer")) {
    return DOMAINS["Software Engineering"];
  }
  if (lower.includes("data") || lower.includes("ml") || lower.includes("machine learning") || lower.includes("ai")) {
    return DOMAINS["Data Science & ML"];
  }
  if (lower.includes("product") || lower.includes("pm")) {
    return DOMAINS["Product Management"];
  }
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) {
    return DOMAINS["UI/UX Design"];
  }
  if (lower.includes("devops") || lower.includes("cloud") || lower.includes("sre") || lower.includes("infra")) {
    return DOMAINS["DevOps & Cloud"];
  }
  if (lower.includes("hr") || lower.includes("lead") || lower.includes("manager") || lower.includes("behavioral")) {
    return DOMAINS["HR & Leadership"];
  }

  return DOMAINS["Software Engineering"];
}

function getTopCompaniesForDomain(domainName) {
  const config = getDomainConfig(domainName);
  return config.topCompanies || ["Google", "Amazon", "Meta", "Microsoft", "Apple"];
}

function getCompanyStyleProfile(domainName, companyName) {
  const domainConfig = getDomainConfig(domainName);
  if (companyName && domainConfig.companyStyles && domainConfig.companyStyles[companyName]) {
    return domainConfig.companyStyles[companyName];
  }
  if (companyName && domainConfig.companyStyles) {
    const cLower = companyName.toLowerCase();
    for (const key of Object.keys(domainConfig.companyStyles)) {
      if (key.toLowerCase() === cLower || key.toLowerCase().includes(cLower) || cLower.includes(key.toLowerCase())) {
        return domainConfig.companyStyles[key];
      }
    }
  }
  return domainConfig.companyStyles?.["General Tech"] || {
    focus: "Core domain fundamentals, scalable design, and structured communication.",
    interviewerPersona: "Analytical, checks core domain depth, and probes edge-case handling.",
  };
}

module.exports = {
  DOMAINS,
  CODING_PROBLEMS,
  APTITUDE_QUESTIONS,
  LANGUAGE_QUESTIONS,
  getDomainConfig,
  getTopCompaniesForDomain,
  getCompanyStyleProfile,
  validateDomainAndRole,
};
