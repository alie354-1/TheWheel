# Hugging Face Spaces Triple LLM Implementation

## Overview

This document outlines our strategy for transitioning from OpenAI to a Hugging Face Spaces-based triple LLM implementation. This approach leverages Hugging Face's managed infrastructure while providing the flexibility to train and deploy custom models on company data and abstracted patterns.

## Why Hugging Face Spaces?

- **Cost Optimization**: Predictable pricing model with potentially lower costs than OpenAI
- **Data Sovereignty**: Full control over model training data and processes
- **Customization**: Models specifically trained for company needs and use cases
- **Flexibility**: Access to a wide range of open-source models and architectures
- **Scalability**: Hugging Face Spaces provides managed infrastructure without self-hosting

## Triple LLM Architecture

The implementation consists of three specialized LLM tiers:

1. **Base Model**: General-purpose LLM for non-company-specific queries
2. **Company Model**: LLM fine-tuned with company-specific data and context
3. **Abstraction Model**: LLM trained on abstracted patterns across similar businesses

This tiered approach allows us to balance general knowledge with company-specific expertise and higher-level business pattern recognition.

## Key Components

- **Feature Flag System**: Easy toggling between OpenAI and Hugging Face Spaces during development
- **Hugging Face Client**: Adapter for interacting with Hugging Face Spaces API
- **Tiered LLM Service**: Implementation of the GeneralLLMService interface for Hugging Face
- **Logging Integration**: Comprehensive logging of model usage and feedback
- **Admin Interface**: UI for toggling between LLM providers and model tiers

## Documentation Structure

This documentation is organized into several sections:

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md): Detailed system design and data flow
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md): Step-by-step implementation instructions
- [Space Setup Guide](./SPACE_SETUP_GUIDE.md): Guide for setting up Hugging Face Spaces
- [Testing and Deployment](./TESTING_AND_DEPLOYMENT.md): Testing strategy and deployment plan

## Getting Started

1. Review the [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) document
2. Follow the [Space Setup Guide](./SPACE_SETUP_GUIDE.md) to set up your Hugging Face Spaces
3. Implement the client-side code following the [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
4. Test and deploy according to the [Testing and Deployment](./TESTING_AND_DEPLOYMENT.md) guide

## Environment Variables

The following environment variables are required:

```
# Hugging Face Configuration
VITE_HUGGINGFACE_API_KEY=your-huggingface-key
VITE_HUGGINGFACE_ORG=your-company-name

# Space names (optional - defaults are defined in the client)
VITE_HF_BASE_SPACE=company-base-llm
VITE_HF_COMPANY_SPACE=company-specific-llm
VITE_HF_ABSTRACTION_SPACE=company-abstraction-llm
