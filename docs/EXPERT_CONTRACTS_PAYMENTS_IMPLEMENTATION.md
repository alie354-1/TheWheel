# Expert Contracts and Payments System

This document outlines the implementation of the expert contracts and payments system for The Wheel platform. This system enables experts and users to create and manage service agreements and handle payments for expert sessions.

## Overview

The expert contracts and payments system extends the expert connect functionality by adding:

1. **Contract Management**: Allows experts to create contract templates, send contracts to users, and track contract status.
2. **Payment Processing**: Enables users to pay for expert sessions and experts to track payments.
3. **Financial Record Keeping**: Maintains records of all financial transactions between experts and users.

## Database Schema

The system adds the following tables to the database:

### Expert Contract Templates

Stores reusable contract templates that experts can use when creating new contracts.

```sql
CREATE TABLE expert_contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Contracts

Stores the actual contracts between experts and users.

```sql
CREATE TABLE expert_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connect_request_id UUID REFERENCES expert_connect_requests(id) ON DELETE SET NULL,
  template_id UUID REFERENCES expert_contract_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'terminated')),
  expert_signed BOOLEAN NOT NULL DEFAULT FALSE,
  user_signed BOOLEAN NOT NULL DEFAULT FALSE,
  expert_signed_at TIMESTAMPTZ,
  user_signed_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  hourly_rate DECIMAL(10,2),
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expert Payments

Stores payment records for expert sessions.

```sql
CREATE TABLE expert_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES expert_sessions(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES expert_contracts(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  notes TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Additionally, the system adds columns to existing tables:

- `expert_profiles`: Adds `hourly_rate`, `payment_methods`, and `contract_template_id` columns.
- `expert_sessions`: Adds `contract_id` and `payment_status` columns.

## Service Layer

The contract service (`src/lib/services/contract.service.ts`) provides methods for interacting with the contracts and payments system:

### Contract Templates

- `createContractTemplate`: Creates a new contract template
- `getContractTemplates`: Gets all contract templates for an expert
- `getContractTemplateById`: Gets a specific contract template
- `updateContractTemplate`: Updates a contract template
- `deleteContractTemplate`: Deletes a contract template

### Contracts

- `createContract`: Creates a new contract
- `getContractsByExpert`: Gets all contracts for an expert
- `getContractsByUser`: Gets all contracts for a user
- `getContractById`: Gets a specific contract
- `updateContract`: Updates a contract
- `signContractAsExpert`: Signs a contract as an expert
- `signContractAsUser`: Signs a contract as a user
- `rejectContract`: Rejects a contract

### Payments

- `createPayment`: Creates a new payment
- `getPaymentsByExpert`: Gets all payments for an expert
- `getPaymentsByUser`: Gets all payments for a user
- `getPaymentById`: Gets a specific payment
- `updatePayment`: Updates a payment
- `updatePaymentStatus`: Updates a payment status

## UI Components

The system includes the following UI components:

### ContractModal

A modal component for creating, viewing, and signing contracts. It supports three modes:

1. **Create Mode**: Allows experts to create a new contract
2. **Sign Mode**: Allows users to review and sign a contract
3. **View Mode**: Allows both experts and users to view a contract

Usage:

```tsx
<ContractModal
  expertId="expert-id"
  userId="user-id"
  connectRequestId="connect-request-id"
  mode="create"
  onClose={() => {}}
  onSigned={(contract) => {}}
/>
```

### PaymentModal

A modal component for processing payments for expert sessions. It supports multiple payment methods:

1. **Credit Card**: Allows users to pay with a credit card
2. **PayPal**: Allows users to pay with PayPal
3. **Bank Transfer**: Allows users to pay with a bank transfer

Usage:

```tsx
<PaymentModal
  expertId="expert-id"
  userId="user-id"
  sessionId="session-id"
  contractId="contract-id"
  amount={150}
  onClose={() => {}}
  onPaymentComplete={(payment) => {}}
/>
```

## Integration with Expert Connect System

The contracts and payments system integrates with the existing expert connect system:

1. After a connection request is accepted, the expert can create a contract for the user.
2. Once the contract is signed by both parties, sessions can be scheduled.
3. Users can pay for sessions using the payment system.
4. Payment status is tracked for each session.

## Row Level Security (RLS) Policies

The system includes RLS policies to ensure that users can only access their own data:

- Experts can view and manage their own contract templates
- Users can view contracts they're involved in
- Experts can create and update contracts
- Users can update contracts to sign them
- Users can view payments they're involved in
- Users can create payments
- Experts can update payment status

## Future Enhancements

Potential future enhancements to the system include:

1. **Payment Gateway Integration**: Integrate with a real payment gateway like Stripe or PayPal
2. **Automated Invoicing**: Generate and send invoices automatically
3. **Subscription Billing**: Support for recurring payments and subscription models
4. **Tax Calculation**: Automatic tax calculation based on location
5. **Dispute Resolution**: Tools for handling payment disputes
6. **Escrow Services**: Hold payments in escrow until services are delivered
7. **Multi-Currency Support**: Support for multiple currencies
8. **Reporting**: Financial reporting tools for experts and administrators

## Implementation Notes

- The current implementation is a placeholder that demonstrates the UI and data flow.
- In a production environment, you would need to integrate with a secure payment processor.
- Contract templates should be reviewed by legal experts before use.
- The system should be extended to handle tax implications and financial regulations.
