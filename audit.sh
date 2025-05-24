#!/usr/bin/env bash
echo "Requirement | Implemented"
echo "---|---"
while IFS='|' read -r desc pattern; do
  if grep -R -E "\$pattern" . >/dev/null 2>&1; then
    echo "\$desc | ✅"
  else
    echo "\$desc | ❌"
  fi
done <<PATTERNS
Mode switching UI/component|ModeSelector|setMode|activeMode
Mode endpoint|/api/user/mode|userMode
Registration endpoint|/api/auth/(register|signup)
Login/OAuth|OAuth|NextAuth|passport|signInWith
2FA setup|speakeasy|twoFactor|2fa
Password reset endpoint|/api/auth/(password-reset|forgotPassword|resetPassword)
Idea creation|createIdea|Idea\\.create|post.*idea
Idea update|updateIdea|moveIdea|stage
Kanban UI|react[-]?kanban|dnd|drag
Library API|/api/library|libraryController|Resource
Search functionality|Elasticsearch|search\\(
Resource upload|uploadResource|fileUpload|multer|S3
Checklist API|/api/companies/.*/checklist|checklistController
Task API|/api/tasks|taskController
Metrics GraphQL|metrics\\(|getMetrics
Charts|recharts|Chart\\(
AI API|/api/ai/|OpenAI|chatCompletion
GitHub integration|/api/integrations/github|octokit|GitHubService
Health API|/api/tech/health|healthCheck
Forum API|/api/community|forumController|discourse
Marketplace API|/api/marketplace|listingController
Accessibility|aria-
Responsive CSS|@media|responsive
Admin API|/api/admin|adminController
Audit logs|audit|AuditService|log\\(
PATTERNS
