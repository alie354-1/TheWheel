# Company Management Functionality – Implementation Plan

## Overview

This document details the plan for implementing advanced company management functionality, including:
- Company profile management (view, edit, media, permissions)
- Company deletion and archiving
- User management with roles, invitations, and permissions
- Access control system
- Bug fixes for current issues

---

## User Stories

### 1. Company Profile Management
- **As a company admin, I want to edit the company profile, including logo, banner, and metadata, so that our public presence is accurate.**
- **As a user, I want to view a company profile page with all relevant information and media.**
- **As a company admin, I want to restrict who can edit the profile based on roles.**

### 2. Company Deletion & Archiving
- **As a company owner, I want to delete or archive the company, with clear warnings and the ability to export data.**
- **As an admin, I want to see the impact of deletion before confirming.**

### 3. User Management with Roles
- **As a company admin, I want to add, remove, and manage users with specific roles (admin, member, guest, custom).**
- **As a user, I want to see my role and permissions within the company.**
- **As an admin, I want to invite users by email and track invitation status.**
- **As an owner/admin, I want to transfer ownership to another member.**

### 4. Access Control
- **As a developer, I want a permission system that enforces role-based access at both the API and database level.**
- **As an admin, I want to define custom roles and permissions for my company.**

---

## Acceptance Criteria

- Company profile page supports all metadata fields, logo/banner upload, and permission checks.
- Only users with the correct role can edit or delete the company.
- Deletion/archiving flows include confirmation, impact analysis, and optional data export.
- User management supports adding/removing users, role assignment, invitations, and ownership transfer.
- Custom roles and permissions can be defined and enforced.
- All API and DB operations are protected by access control.
- Bug in company member query is fixed (no more 400 errors).
- All changes are covered by tests and documented.

---

## Technical Tasks

### Database
- [ ] Add/modify `company_members` table: support for roles, title, department, invitation status.
- [ ] Create `company_roles` and `company_permissions` tables for custom roles.
- [ ] Add RLS policies for all company-related tables.
- [ ] Add triggers for audit logging.
- [ ] Write migration SQL (see attached file).

### Backend/Services
- [ ] Update `company.service.ts` for enhanced role/invitation management.
- [ ] Add `company-access.service.ts` for permission checks.
- [ ] Add `company-invitations.service.ts` for invitation flows.
- [ ] Update all service methods to enforce permissions.

### Frontend/UI
- [ ] Fix bug in `CompanyMembersPage.tsx` (use `.eq("company_id", ...)`).
- [ ] Enhance `TeamManagement` for role selection, invitations, and bulk actions.
- [ ] Add `RoleManager` component for custom roles.
- [ ] Update `CompanyProfileForm` for media upload and validation.
- [ ] Add UI for deletion/archiving with impact analysis and export.
- [ ] Add permission-based conditional rendering throughout.

### Testing & Documentation
- [ ] Add unit/integration tests for all new features.
- [ ] Update documentation for company management flows.

---

## Notes

- All changes must be backward compatible where possible.
- Migration must be idempotent and safe to run in production.
- RLS policies must be tested for all edge cases.
- Invitations should use transactional email (future enhancement).
- Data export can be CSV/JSON download of company data.

---

## SQL Migration

See `supabase/migrations/20250517_company_management_enhancements.sql` for the full migration script.

---

## References

- [COMPANY_MANAGEMENT_IMPLEMENTATION_PLAN.md](COMPANY_MANAGEMENT_IMPLEMENTATION_PLAN.md)
- [COMPANY_MANAGEMENT_ENHANCEMENTS.sql](../supabase/migrations/20250517_company_management_enhancements.sql)
