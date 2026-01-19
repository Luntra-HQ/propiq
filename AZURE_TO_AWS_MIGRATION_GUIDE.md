# Prop IQ: Azure Services Inventory & AWS Replacement Guide

This document catalogs all **Azure services** used in Prop IQ and maps them to **acceptable AWS replacements**, with implementation notes for removal/migration.

---

## Easiest & Most Impactful (Checklist)

In-repo, no-deployment tasks. They reduce cutover risk and turn the eventual switch into config changes instead of a scramble.

| # | Task | File(s) | Why it matters |
|---|------|---------|----------------|
| 1 | Netlify: drop "Azure Static Web Apps" from comment | `netlify.toml`, `frontend/netlify.toml.backup` | Avoids confusion; frontend is on Netlify |
| 2 | Revenue model: provider-agnostic LLM cost keys | `revenue_model_v3.py` | Cost model works for Bedrock; no rework at cutover |
| 3 | sync-env-to-convex: commented AWS Bedrock block | `sync-env-to-convex.sh` | Ready when Convex switches to Bedrock |
| 4 | README: migration pointer + Architecture (Netlify) | `README.md` | Points to this guide; corrects "Azure Static Web Apps" |
| 5 | Production API URL from `VITE_API_URL` | `frontend/src/config/api.ts` | At cutover: set `VITE_API_URL` in Netlify; no code change |
| 6 | .env: AWS placeholder vars | `backend/.env.template`, `backend/.env.example` | Single source for `BEDROCK_*`, `LLM_PROVIDER` (apply manually if gitignored) |
| 7 | Backend: LLM abstraction module | `backend/utils/llm_client.py` | One place to add Bedrock; routers can migrate over time |
| 8 | Convex: `LLM_PROVIDER` + Bedrock stub | `convex/propiq.ts`, `convex/analytics.ts` | One env flip when Bedrock gateway exists |
| 9 | env_validator: optional AWS vars | `backend/config/env_validator.py` | Validates `BEDROCK_*` when switching |
| 10 | Deploy-aws example workflow | `.github/workflows/deploy-aws.example.yml` | Reference for ECR + App Runner when ready |

**Status:** 1–5, 7–9, 10 are done. **#6:** apply the .env snippet manually if `backend/.env.template` is gitignored.

**Note:** Routers (`propiq`, `support_chat`, etc.) still use `AzureOpenAI` directly. `utils/llm_client` is the abstraction to use when adding Bedrock; migrate routers when ready.

**.env snippet for #6** (paste into `backend/.env.template` when you can):

```bash
# -----------------------------------------------------------------------------
# AWS Bedrock (when migrating from Azure OpenAI)
# -----------------------------------------------------------------------------
# LLM_PROVIDER=azure|bedrock
# AWS_REGION=us-east-1
# BEDROCK_GATEWAY_URL=https://your-api-gateway.execute-api.region.amazonaws.com/bedrock
# BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

---

## 1. Azure Services Inventory

### 1.1 Azure OpenAI (AI / LLM) — **ACTIVELY USED**

**Purpose:** GPT-4o-mini for property analysis, support chat, weekly analytics, and multi-agent flows.

| Location | File(s) | Usage |
|----------|---------|--------|
| **Convex** | `convex/propiq.ts` | `generateAIAnalysis()` — property analysis (primary path via `propiq:analyzeProperty`) |
| **Convex** | `convex/analytics.ts` | Weekly intel email — AI-generated insights from MRR/churn/B2B metrics |
| **Backend (FastAPI)** | `backend/routers/propiq.py` | Property analysis (`/api/v1/propiq/analyze`), health check |
| **Backend** | `backend/routers/support_chat.py` | Support chat (`/support/chat`) — `AzureOpenAI` client |
| **Backend** | `backend/routers/support_chat_enhanced.py` | Enhanced support with function calling |
| **Backend** | `backend/routers/property_advisor_multiagent.py` | Multi-agent property advisor |

**Environment variables (Convex + Backend):**

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_DEPLOYMENT` (e.g. `gpt-4o-mini`)

**Other references:** `sync-env-to-convex.sh`, `backend/.env.template`, `backend/.env.example`, `backend/config/env_validator.py`, docs (PROJECT_BRIEF, README, etc.)

---

### 1.2 Azure Web App (App Service for Containers) — **ACTIVELY USED**

**Purpose:** Hosts the FastAPI backend (`luntra-outreach-app.azurewebsites.net`).

| Location | File(s) | Usage |
|----------|---------|--------|
| **GitHub Actions** | `.github/workflows/deploy.yml` | `deploy-backend` job: `azure/webapps-deploy@v2`, `app-name: luntra-outreach-app` |
| **Frontend** | `frontend/src/config/api.ts` | Production `API_BASE_URL`: `https://luntra-outreach-app.azurewebsites.net/api/v1` |
| **Backend** | `backend/api.py` | OpenAPI `servers` with `luntra-outreach-app.azurewebsites.net` |
| **Simulations** | `backend/simulations/run_simulation.sh` | `BACKEND_URL="https://luntra-outreach-app.azurewebsites.net"` |
| **Tests / Docs** | Various | `backend/test_stripe_webhook.py`, `frontend/tests/`, `IntegrationExample.tsx`, `TALLY_FEEDBACK_SETUP.md`, `SENTRY_SETUP_GUIDE.md`, etc. |

---

### 1.3 Azure Container Registry (ACR) — **ACTIVELY USED**

**Purpose:** Stores Docker images for the FastAPI backend; used by Azure Web App deploy.

| Location | File(s) | Usage |
|----------|---------|--------|
| **GitHub Actions** | `.github/workflows/deploy.yml` | `AZURE_REGISTRY: luntraacr.azurecr.io`, `azure/docker-login@v1`, build/push to ACR, `images` in `webapps-deploy` |

**Secrets:** `AZURE_ACR_USERNAME`, `AZURE_ACR_PASSWORD`, `AZURE_CREDENTIALS`

---

### 1.4 Azure Static Web Apps — **NOT USED**

**Purpose:** Mentioned as “planned” or “alternative” to Netlify; frontend actually uses **Netlify**.

**References:** `netlify.toml`, `frontend/netlify.toml.backup`, `claude.md`, `README.md`, `SELF_SERVICE_SUPPORT_DEPLOYMENT.md` — **no code or CI depends on it.** Safe to ignore for removal.

---

### 1.5 Azure Application Insights — **OPTIONAL / TEMPLATE ONLY**

**Purpose:** Monitoring. Only in `.env.template`; no implementation found in code.

**Action:** Update or remove from `.env.template` when cleaning Azure references.

---

### 1.6 Azure Key Vault — **NOT IMPLEMENTED**

**Purpose:** Referenced in `SECURITY_AUDIT_REPORT.md` as a recommendation for secret storage. Not used in application or CI.

**Action:** If moving to AWS, use **AWS Secrets Manager** or **SSM Parameter Store** instead; no Azure removal needed.

---

## 2. AWS Replacements

### 2.1 Azure OpenAI → **AWS Bedrock** (or OpenAI via API Gateway)

**Recommended: AWS Bedrock**

- **Closest fit:** Bedrock’s **InvokeModel** / **Converse** (and newer **Responses API**, OpenAI-compatible) for chat completions.
- **Models:** Claude 3 Haiku (cost close to GPT-4o-mini), Claude 3 Sonnet, or other Bedrock models. For near–drop-in behavior, use Bedrock’s **OpenAI-compatible Responses API** where available.
- **Auth:** IAM roles + `aws-sdk` or `@aws-sdk/client-bedrock-runtime`; no `AZURE_OPENAI_KEY` / `api-key` header.
- **Pricing:** Per-model; Claude 3 Haiku is in a similar range to GPT-4o-mini for many workloads.

**Alternative: OpenAI API + AWS**

- Keep OpenAI models but run through **AWS** only for hosting/infra: e.g., API key in **Secrets Manager**, backend on ECS/App Runner. This removes **Azure** dependency but not **OpenAI**; you’re only replacing Azure as the cloud, not the model.

**Implementation notes:**

- **Convex** (`propiq.ts`, `analytics.ts`):  
  - Replace `fetch` to Azure OpenAI with calls to **Bedrock** (e.g. `InvokeModel`/`Converse` or Bedrock Responses API).  
  - Convex runs in Convex’s environment; use **HTTP action** to an **AWS Lambda** or **API Gateway** that calls Bedrock, **or** call Bedrock from Convex if you can use `@aws-sdk` and provide AWS creds (Convex env). The usual pattern is: Convex → your AWS API (Lambda/API Gateway) → Bedrock.
- **Backend (FastAPI):**  
  - Replace `AzureOpenAI` in `propiq.py`, `support_chat.py`, `support_chat_enhanced.py`, `property_advisor_multiagent.py` with `boto3` / `@aws-sdk/client-bedrock-runtime` and Bedrock `InvokeModel`/`Converse` (or Responses API).  
  - Adjust request/response shapes (Bedrock JSON differs from Azure; a thin adapter helps).  
  - Env: remove `AZURE_OPENAI_*`; add e.g. `AWS_REGION`, `BEDROCK_MODEL_ID`; use IAM role for the service (no key in env).
- **Env / scripts:**  
  - `sync-env-to-convex.sh`: remove Azure OpenAI vars; add any needed for your Bedrock gateway (e.g. `BEDROCK_GATEWAY_URL` if via Lambda/API Gateway).  
  - `.env.template`, `env_validator.py`: swap Azure OpenAI for Bedrock (or gateway) vars.

**Useful Bedrock APIs:**

- [Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) — messages-based, similar to chat completions.
- [InvokeModel](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html) — lower-level.
- [Bedrock Responses API (OpenAI-compatible)](https://docs.aws.amazon.com/bedrock/latest/userguide/openai-compatibility.html) — if you want minimal request-format changes.

---

### 2.2 Azure Web App → **AWS App Runner** or **ECS on Fargate**

**AWS App Runner**

- **Use when:** Simple container API, moderate traffic, want minimal ops (similar to Web App for Containers).
- **Features:** Deploy from **Amazon ECR**, autoscaling, HTTPS, built-in LB.
- **Gaps vs Azure:** No deployment slots; use blue/green via separate services or custom pipeline.

**ECS on Fargate**

- **Use when:** Need more control (VPC, IAM, multi-service, batch).
- **Setup:** ECR image → ECS Task Definition → Fargate Service → ALB (or NLB) + optional API Gateway.

**Implementation notes:**

- **CI (`.github/workflows/deploy.yml`):**
  - Remove `azure/login@v1`, `azure/docker-login@v1`, `azure/webapps-deploy@v2`.
  - Add: **ECR** as image registry (`*.dkr.ecr.<region>.amazonaws.com/<repo>`) and **App Runner** or **ECS** deploy.
  - For **App Runner:** `aws-apprunner-deploy` or `aws` CLI (`create-service`/`update-service`).
  - For **ECS:** `aws ecs update-service` (or CodeDeploy) after `docker build` + `docker push` to ECR.
- **URL:** Replace `https://luntra-outreach-app.azurewebsites.net` with the new base URL (e.g. App Runner default `https://<id>.<region>.awsapprunner.com` or custom domain via CNAME).
- **Places to update (examples):**
  - `frontend/src/config/api.ts` — production `API_BASE_URL`
  - `backend/api.py` — OpenAPI `servers`
  - `backend/simulations/run_simulation.sh` — `BACKEND_URL`
  - `frontend/tests` (`smoke.spec.ts`, `api-v1-migration.spec.ts`, `pagination.spec.ts`, etc.) — `API_BASE` / `VITE_API_URL`
  - `IntegrationExample.tsx`, `TALLY_FEEDBACK_SETUP.md`, `SENTRY_SETUP_GUIDE.md`, `README.md`, and any other hardcoded `luntra-outreach-app.azurewebsites.net` or `AZURE_WEBAPP_NAME.azurewebsites.net`.

**Secrets / env in CI:** Replace `AZURE_CREDENTIALS`, `AZURE_ACR_*` with `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (or OIDC with `aws-actions/configure-aws-credentials`) and, if needed, `AWS_REGION`.

---

### 2.3 Azure Container Registry (ACR) → **Amazon ECR**

**Purpose:** Store Docker images for the backend.

**Implementation notes:**

- Create an **ECR repository** (e.g. `propiq-backend`).
- In **GitHub Actions:**
  - `aws ecr get-login-password` and `docker login` to ECR (or use `aws-actions/amazon-ecr-login`).
  - `docker build` + `docker tag` + `docker push` to `*.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>`.
- Remove all `luntraacr.azurecr.io` and `azure/docker-login@v1` usage.
- **App Runner** and **ECS** both pull from ECR natively.

---

## 3. Replacement Summary Table

| Azure Service | AWS Replacement | Effort (rough) | Notes |
|---------------|-----------------|----------------|-------|
| **Azure OpenAI** | **AWS Bedrock** (or OpenAI via AWS-hosted backend) | Medium–High | Convex + 4 FastAPI routers; need adapter for request/response and (if using Convex→Bedrock) a small AWS-side proxy or Convex-compatible SDK. |
| **Azure Web App** | **AWS App Runner** or **ECS Fargate** | Medium | Swap deploy job and base URL in ~15+ files; ensure health paths and env (e.g. `VITE_API_URL`) are correct. |
| **Azure Container Registry** | **Amazon ECR** | Low | CI only; straightforward once ECR repo and IAM/CI creds exist. |
| **Azure Static Web Apps** | — | None | Not used; frontend on Netlify. |
| **Azure Application Insights** | **Amazon CloudWatch** / **X-Ray** | Low | Only in env template; replace with `AWS_REGION`, CloudWatch log group, etc. |
| **Azure Key Vault** | **AWS Secrets Manager** / **SSM** | N/A | Not implemented; use AWS options for new secrets. |

---

## 4. Files to Touch for Removal / Migration

### 4.1 Azure OpenAI

- `convex/propiq.ts` — `generateAIAnalysis()`
- `convex/analytics.ts` — weekly intel AI block
- `propiq/sync-env-to-convex.sh`
- `backend/routers/propiq.py`
- `backend/routers/support_chat.py`
- `backend/routers/support_chat_enhanced.py`
- `backend/routers/property_advisor_multiagent.py`
- `backend/config/env_validator.py`
- `backend/.env.template`, `backend/.env.example`, `backend/.env.test.template`
- Docs: `PROJECT_BRIEF.md`, `README.md`, `CONVEX_DEPLOYMENT_STATUS.md`, `IMAGE_UPLOAD_TESTING_GUIDE.md`, `IMAGE_UPLOAD_AWS_IMPLEMENTATION.md`, `KNOWN_ISSUES.md`, `MARKETING_STRATEGY.md`, `PRODUCTION_READINESS_REPORT.md`, `SECURITY_AUDIT_REPORT.md`, `backend/INTEGRATION_SUMMARY.md`, `backend/README_INTEGRATIONS.md`, `backend/CUSTOM_SUPPORT_CHAT_GUIDE.md`, `backend/TESTING_GUIDE.md`, `backend/QUICK_START.md`, `backend/DEPLOYMENT_COMPLETE.md`, simulation docs, etc.
- `revenue_model_v3.py` (Azure OpenAI cost assumptions)

### 4.2 Azure Web App + ACR + deploy

- `.github/workflows/deploy.yml`
- `frontend/src/config/api.ts`
- `backend/api.py`
- `backend/simulations/run_simulation.sh`
- `backend/test_stripe_webhook.py`
- `frontend/tests/*.spec.ts`, `frontend/tests/README.md`
- `frontend/src/components/IntegrationExample.tsx`
- `frontend/TALLY_FEEDBACK_SETUP.md`, `SENTRY_SETUP_GUIDE.md`, `SENTRY_QUICK_START.md`
- `README.md`, `claude.md`, `EXTERNAL_NETWORK_AUDIT.md`, and any other references to `luntra-outreach-app.azurewebsites.net` or `AZURE_WEBAPP_NAME.azurewebsites.net`

### 4.3 Azure misc (optional)

- `.gitignore` — `.azure/`, `*.azurePubxml` (can keep for local tooling or remove)
- `backend/.env.template` — Application Insights / Azure monitoring placeholders

---

## 5. Suggested Order of Operations

1. **Add AWS and keep Azure (parallel run)**  
   - Implement Bedrock (or Bedrock proxy) and ECR + App Runner/ECS in CI, with a new base URL (e.g. `propiq-api.<your-domain>.com`).  
   - Switch feature flags or env to the new backend and Convex→Bedrock path in staging.

2. **Cut over**  
   - Point production `API_BASE_URL` and Convex to AWS.  
   - Verify property analysis, support chat, and weekly analytics.

3. **Remove Azure**  
   - Delete or disable Azure Web App, ACR, and Azure OpenAI resource.  
   - Remove `AZURE_*` from Convex and backend env, and strip Azure from `deploy.yml` and docs.

4. **Docs and cleanup**  
   - Update README, PROJECT_BRIEF, runbooks, and revenue/cost models (`revenue_model_v3.py`, simulation docs) to reflect AWS-only.

---

## 6. Cost and Behavior Considerations

- **Bedrock vs Azure OpenAI:** Model behavior and pricing differ. Claude 3 Haiku is a common stand-in for GPT-4o-mini; run a small batch of real analyses to compare quality and cost before full cutover.
- **App Runner vs ECS Fargate:** App Runner is simpler and can be cheaper at low/ bursty traffic; Fargate offers more control and can be cheaper at high, steady load. Choose based on traffic and ops preference.
- **Convex → Bedrock:** If Convex cannot call Bedrock directly (SDK or IAM), a small **Lambda + API Gateway** in front of Bedrock keeps all AI on AWS and simplifies IAM and networking.

---

## 7. Quick Reference: Env and Secrets

**Remove (Azure):**

- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_CREDENTIALS`, `AZURE_ACR_USERNAME`, `AZURE_ACR_PASSWORD`
- Any `APPLICATIONINSIGHTS_*` if you add it later on Azure

**Add (AWS, examples):**

- `AWS_REGION` (or rely on default)
- `BEDROCK_MODEL_ID` or `BEDROCK_GATEWAY_URL` (if using a proxy)
- For CI: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` or OIDC with `aws-actions/configure-aws-credentials`
- For Backend: IAM role for ECS/App Runner to access Bedrock (no keys in env for Bedrock)

---

*Last updated from codebase scan. Adjust file paths and env names to match your repo and deployment.*
