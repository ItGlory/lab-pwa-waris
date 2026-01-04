# /one

The Master Orchestrator for WARIS Platform Development.

## Description
**ONE** is the Director agent that orchestrates all aspects of the WARIS project. It coordinates specialized agents, manages workflows, and ensures cohesive development of the water loss analysis platform.

## Usage
```
/one [command] [target]
```

## Commands

### Project Management
```
/one status                    # Overall project status
/one plan [feature]            # Plan feature implementation
/one review                    # Review current progress
/one deploy [environment]      # Orchestrate deployment
```

### Agent Orchestration
```
/one delegate [task]           # Delegate task to appropriate agent
/one coordinate [agents...]    # Coordinate multiple agents
/one assemble [team]           # Assemble team for complex task
```

### Development Workflows
```
/one build [component]         # Build system component
/one test [scope]              # Run comprehensive tests
/one analyze [dma_id]          # Full water loss analysis
/one report [type]             # Generate reports
```

### AI/ML Operations
```
/one train [model]             # Orchestrate model training
/one evaluate [model]          # Evaluate model performance
/one deploy-model [model]      # Deploy model to production
```

### Data Operations
```
/one sync                      # Sync all data sources
/one pipeline [action]         # Manage data pipelines
/one backup                    # Orchestrate backup procedures
```

### Developer Experience (DevEx)
```
/one dx setup                  # Setup local development environment
/one dx check                  # Health check all services
/one dx doctor                 # Diagnose and fix issues
/one dx clean                  # Clean caches and artifacts
/one dx optimize               # Optimize build performance
/one dx format                 # Format all code
/one dx lint                   # Lint and fix all code
```

## Director Capabilities

### 1. Intelligent Task Delegation
ONE analyzes incoming requests and delegates to the most appropriate agent:

| Task Type | Delegated Agent |
|-----------|-----------------|
| ETL/Data Quality | data-engineer |
| ML Models | ml-engineer |
| LLM/RAG | llm-specialist |
| Web UI | frontend-developer |
| APIs | backend-developer |
| Infrastructure | devops-engineer |
| Security | security-specialist |
| Database | database-architect |
| Testing | qa-engineer |
| Documentation | documentation-specialist |

### 2. Multi-Agent Coordination
For complex tasks, ONE coordinates multiple agents:

```
/one build dashboard
→ Coordinates: frontend-developer + backend-developer + database-architect

/one analyze water-loss
→ Coordinates: data-engineer + ml-engineer + llm-specialist

/one deploy production
→ Coordinates: devops-engineer + security-specialist + qa-engineer
```

### 3. Workflow Management
ONE manages end-to-end workflows:

**Feature Development Flow:**
1. Requirements analysis
2. Architecture design
3. Implementation
4. Testing
5. Documentation
6. Deployment

**AI Model Development Flow:**
1. Data preparation (data-engineer)
2. Model training (ml-engineer)
3. Evaluation (qa-engineer)
4. Deployment (devops-engineer)
5. Monitoring (ml-engineer)

### 4. Quality Assurance
ONE ensures:
- Code quality standards
- TOR compliance
- Security requirements (OWASP, PDPA)
- Thai language support
- ISO/IEC 42001 alignment

## Examples

### Full Feature Development
```
/one build notification-system

ONE will:
1. Analyze requirements from TOR 4.5.3
2. Delegate database schema to database-architect
3. Delegate API development to backend-developer
4. Delegate UI components to frontend-developer
5. Coordinate integration testing with qa-engineer
6. Generate documentation with documentation-specialist
```

### Complete Analysis Pipeline
```
/one analyze --dma=BKK-001 --period=monthly

ONE will:
1. Trigger data-pipeline sync
2. Run anomaly detection (ml-engineer)
3. Generate predictions (ml-engineer)
4. Create visualizations (frontend-developer)
5. Generate Thai report (llm-specialist)
6. Send notifications (alert-notification)
```

### Production Deployment
```
/one deploy production

ONE will:
1. Run full test suite (qa-engineer)
2. Security scan (security-specialist)
3. Build containers (devops-engineer)
4. Deploy to on-premise server (devops-engineer)
5. Sync to G-Cloud backup (devops-engineer)
6. Update documentation (documentation-specialist)
```

## TOR Compliance Checklist

ONE monitors compliance with all TOR sections:

- [ ] 4.1 Project Management
- [ ] 4.2 Hybrid Architecture
- [ ] 4.3 DMAMA Integration
- [ ] 4.4 Data Warehouse
- [ ] 4.5.1 AI Shadowing (4 models)
- [ ] 4.5.2 LLM 70B+ Thai
- [ ] 4.5.3 Notification System
- [ ] 4.5.4 Dashboard & Q&A
- [ ] 4.5.5 ISO/IEC 42001
- [ ] 4.5.6 AI Guardrails
- [ ] 4.6 System Testing
- [ ] 4.7 Training

## Integration Points

ONE integrates with all MCP servers:
- waris-database
- waris-dmama
- waris-vector-db
- waris-ai-models
- waris-llm
- waris-gis
- waris-notifications
- waris-reports

## Output
ONE provides:
- Progress reports
- Task delegation summaries
- Quality metrics
- TOR compliance status
- Next steps recommendations
