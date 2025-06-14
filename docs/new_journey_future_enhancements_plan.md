# New Journey System: Future Enhancements & Long-Term Vision Plan

This document addresses the remaining "Nice to Have" (P2) and future-facing requirements from the MRD. It provides a high-level technical strategy for these features, ensuring a complete vision for the Journey System beyond the initial 8-week MVP.

## 1. Non-Functional Requirements (NFR) Strategy

While the initial build will be performant, meeting the strict NFRs from the MRD requires a dedicated strategy.

### 1.1. Performance & Caching (Redis)
- **Requirement**: Dashboard loads < 2s, API responses < 500ms.
- **Strategy**:
    1.  **Introduce a Redis Cache**: A Redis instance will be added to the architecture, sitting between the API/service layer and the PostgreSQL database.
    2.  **Cache Service**: A new service, `src/lib/services/cache.service.ts`, will be created to abstract all interactions with Redis.
    3.  **Cache-Aside Pattern**:
        - When a service (e.g., `new_journey_features.service.ts`) requests data, it will first check the Redis cache.
        - If the data is present (cache hit), it's returned immediately.
        - If the data is not present (cache miss), the service fetches it from PostgreSQL, stores it in Redis with a specific TTL (Time To Live), and then returns it.
    4.  **Targeted Caching**: We will initially cache heavily-read, slowly-changing data:
        - Canonical framework steps, phases, and domains.
        - Aggregated community insights.
        - Pre-calculated portfolio insights for VCs.

### 1.2. Security & Privacy
- **Requirement**: SOC 2 Type II, GDPR, CCPA compliance.
- **Strategy**:
    1.  **Comprehensive RLS**: Expand Supabase Row-Level Security policies on all `_new` tables to ensure a user can only ever access data belonging to their own company.
    2.  **Data Encryption**: Ensure all data is encrypted at rest and in transit, leveraging Supabase's built-in capabilities.
    3.  **PII Audit**: Conduct an audit of all tables to identify and flag any Personally Identifiable Information (PII). Access to this data will be restricted via RLS to the highest privilege levels.
    4.  **GDPR/CCPA Service**: Create methods within `new_company_journey.service.ts` to handle data access and deletion requests, such as `exportUserData(userId)` and `deleteUserData(userId)`.

### 1.3. Scalability
- **Requirement**: Horizontal scaling, support for 10K+ concurrent users.
- **Strategy**:
    1.  **Stateless Services**: Ensure all backend services are stateless, allowing for horizontal scaling of the API layer using serverless functions (e.g., Supabase Edge Functions) or containerized services.
    2.  **Database Read Replicas**: As load increases, implement PostgreSQL read replicas. All read-heavy operations (fetching steps, insights) will be directed to the replicas, while write operations go to the primary database.
    3.  **Asynchronous Jobs**: For heavy operations like `generatePortfolioInsights`, use a background job queue (e.g., Supabase PG Cron) to avoid blocking user-facing requests.

---

## 2. Public API Architecture

- **Requirement**: API access for "Scale" tier customers.
- **Strategy**:
    1.  **API Gateway**: Introduce an API Gateway (e.g., Amazon API Gateway, or built on the existing infrastructure) as the single entry point for all public API requests.
    2.  **Authentication**: API requests will be authenticated using unique, revocable API keys assigned to each "Scale" customer.
    3.  **Dedicated API Service**: A new service, `src/lib/services/public_api.service.ts`, will be created. It will contain methods that correspond to the public API endpoints. This service will enforce permissions and rate limiting before calling the internal services.
    4.  **Initial Endpoints**:
        - `GET /v1/journey/steps`: Fetch company journey steps.
        - `POST /v1/journey/steps/:id/complete`: Mark a step as complete.
        - `GET /v1/journey/outcomes`: Fetch outcome data for completed steps.

---

## 3. White-Labeling & Theming Strategy

- **Requirement**: White-label options for "Scale" tier customers.
- **Strategy**:
    1.  **Theming Service & Context**:
        - A new table, `company_themes`, will store theme information (e.g., `primary_color`, `logo_url`, `font_family`) for each company.
        - A `useTheme()` hook will provide the theme data throughout the application via a React Context.
    2.  **CSS Variables**: The application's CSS will be refactored to use CSS variables for all key themeable elements.
        ```css
        :root {
          --primary-color: #007bff; /* Default */
          --font-family: 'Inter', sans-serif; /* Default */
        }
        .button-primary {
          background-color: var(--primary-color);
        }
        ```
    3.  **Dynamic Theme Loading**: When the application loads, the `useTheme()` hook will fetch the company's theme and inject the overrides as a `<style>` block in the document head, setting the CSS variables.
        ```html
        <style>
          :root {
            --primary-color: #ff6600; /* Customer's color */
            --font-family: 'Georgia', serif; /* Customer's font */
          }
        </style>
        ```

---

## 4. Advanced AI Provider Strategy

- **Requirement**: Flexibility to use multiple AI models and define fallbacks.
- **Strategy**:
    1.  **Refactor AI Service**: The `new_journey_ai.service.ts` will be refactored to support multiple providers.
    2.  **Provider-Specific Implementations**: Create separate classes for each provider, all implementing a common `IAIProvider` interface.
        - `OpenAIProvider.ts`
        - `AnthropicProvider.ts`
    3.  **Dynamic Provider Selection**: The main AI service will instantiate the appropriate provider based on configuration or even on a per-request basis.
    4.  **Fallback Logic**: The main service's methods will include try-catch blocks to implement a fallback strategy.
        ```typescript
        async generateAdaptiveSuggestions(outcome) {
          try {
            // Attempt with primary provider (e.g., Anthropic)
            return await this.primaryProvider.generate(prompt);
          } catch (error) {
            console.warn('Primary AI provider failed. Falling back to secondary.');
            // Fallback to secondary provider (e.g., OpenAI)
            return await this.secondaryProvider.generate(prompt);
          }
        }
        ```

This document provides the strategic roadmap for the long-term evolution of the Journey System, ensuring that all aspects of the MRD are accounted for, either in the initial build or in planned future enhancements.
