# Advanced Tool Selection & Evaluation Flow

## Overview

This document describes the advanced flow for tool selection and evaluation in The Wheel, including company tool integration, custom scorecards, document uploads, and evaluation history.

---

## 1. Tool Selection & Company Integration

- When a user selects a tool as their final choice, it is pushed to the company’s tool list (`company_tools` or `company_journey_step_tools`).
- This ensures the tool is officially tracked for the company and step.

---

## 2. Custom Evaluation Scorecards

- Users can define a custom scorecard (criteria/fields) for each evaluation session.
- Each tool in the comparison is rated using this scorecard.
- Scorecards and evaluations are saved per user/tool in `company_tool_evaluations` or a new table for structured scorecards.

---

## 3. Documents & Notes

- Users can upload and attach documents (PDFs, screenshots, spreadsheets, etc.) to each tool evaluation.
- Each individual can save private notes and their scorecard for each tool.
- All documents and notes are accessible in the tool’s evaluation history for the company.

---

## 4. Component Structure

- `ToolSelector` (main modal/drawer/page)
  - `ToolRecommendationList`
  - `ToolList`
  - `CustomToolForm`
  - `ToolComparisonTable`
  - `ScorecardBuilder`
  - `ToolEvaluationForm`
  - `DocumentUploader`
  - `EvaluationHistory`
- All components are modular and follow the project’s style.

---

## 5. Data Model

- `company_tools`/`company_journey_step_tools`: for chosen tools
- `company_tool_evaluations`: for ratings, comments, and scorecard results
- `company_tool_scorecards`: for structured scorecard definitions and responses (new)
- `company_tool_documents`: for uploaded files (new)

---

## 6. SQL Migration Example

```sql
-- Add table for structured scorecards
CREATE TABLE company_tool_scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL,
  step_id UUID REFERENCES journey_steps(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL, -- e.g. [{label: "Ease of Use", type: "number"}, ...]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table for scorecard responses
CREATE TABLE company_tool_scorecard_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scorecard_id UUID NOT NULL REFERENCES company_tool_scorecards(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- e.g. { "Ease of Use": 4, "Support": 5 }
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table for tool evaluation documents
CREATE TABLE company_tool_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quick lookup
CREATE INDEX idx_company_tool_scorecards_company_id ON company_tool_scorecards(company_id);
CREATE INDEX idx_company_tool_scorecard_responses_scorecard_id ON company_tool_scorecard_responses(scorecard_id);
CREATE INDEX idx_company_tool_documents_tool_id ON company_tool_documents(tool_id);
```

---

## 7. Flow Summary

1. User investigates tools, adds up to 5 (any can be custom).
2. User defines a scorecard for evaluation (or uses a template).
3. Each tool is rated using the scorecard; individuals can upload documents and notes.
4. All evaluations, scorecards, and documents are saved and accessible in the tool’s evaluation history.
5. When a tool is chosen, it is pushed to the company’s tool list for the step.
