# Expert Onboarding Complete Guide

This document provides a comprehensive guide to the expert onboarding system in the community module.

## Table of Contents

1. [Overview](#overview)
2. [Expert Profile Structure](#expert-profile-structure)
3. [Onboarding Flow](#onboarding-flow)
4. [Components](#components)
5. [Services](#services)
6. [Database Schema](#database-schema)
7. [Known Issues and Fixes](#known-issues-and-fixes)
8. [Future Enhancements](#future-enhancements)

## Overview

The expert onboarding system allows users to create expert profiles, share their expertise, and connect with other community members. Experts can specify their areas of expertise, industry experience, functional experience, success stories, and mentorship capacity.

## Expert Profile Structure

An expert profile consists of the following information:

- **User Information**: Name, avatar, and other basic user details
- **Primary Expertise Areas**: Main areas of expertise (e.g., Product Strategy, Marketing)
- **Secondary Expertise Areas**: Additional areas of expertise
- **Industry Experience**: Experience in specific industries, including years of experience
- **Functional Experience**: Experience in specific functional areas, including years of experience
- **Success Stories**: Notable achievements and success stories
- **Mentorship Capacity**: Availability for mentorship and maximum number of mentees
- **Motivation**: Reason for becoming an expert in the community

## Onboarding Flow

The expert onboarding process follows these steps:

1. **Initiation**: User clicks "Join as Expert" button on the community experts page
2. **Motivation**: User explains their motivation for becoming an expert
3. **Expertise Areas**: User selects primary and secondary expertise areas
4. **Experience**: User adds industry and functional experience
5. **Success Stories**: User adds success stories
6. **Mentorship**: User sets mentorship capacity
7. **Review**: User reviews their profile before submission
8. **Submission**: User submits their profile

## Components

The expert onboarding system includes the following key components:

- **JoinAsExpertCTA**: Call-to-action component to encourage users to join as experts
- **ExpertSignUpModal**: Modal that contains the expert onboarding wizard
- **ExpertProfileWizard**: Multi-step wizard for the onboarding process
- **Wizard Steps**:
  - ExpertMotivationStep
  - ExpertiseAreasStep
  - ExperienceStep
  - SuccessStoriesStep
  - MentorshipStep
  - ProfileReviewStep
- **ExpertProfilePreview**: Component to preview how the expert profile will look
- **ViewExpertProfileButton**: Button to view the user's own expert profile
- **EditExpertProfileButton**: Button to edit the user's expert profile
- **ConnectWithExpertButton**: Button for other users to connect with an expert

## Services

The expert onboarding system relies on the following services:

- **expertService**: Handles expert profile CRUD operations
- **connectService**: Manages connections between users and experts
- **contractService**: Handles contracts between users and experts
- **sessionService**: Manages mentorship sessions
- **availabilityService**: Manages expert availability

## Database Schema

The expert onboarding system uses the following database tables:

- **expert_profiles**: Stores expert profile information
- **expert_endorsements**: Stores endorsements for experts
- **expert_connections**: Tracks connections between users and experts
- **expert_contracts**: Stores contract information
- **expert_sessions**: Tracks mentorship sessions
- **expert_availability**: Stores expert availability information

## Known Issues and Fixes

### 1. Foreign Key Constraints

**Issue**: Foreign key constraints were not properly set up in the expert_profiles table.

**Fix**: Applied in `supabase/apply_expert_foreign_key_fix.sh`

**Documentation**: [EXPERT_FOREIGN_KEY_FIX.md](EXPERT_FOREIGN_KEY_FIX.md)

### 2. Expert Profile Query Issues

**Issue**: The expert service was experiencing 406 Not Acceptable errors when querying expert profiles.

**Fix**: Applied in `supabase/apply_expert_service_v3_fix.sh`

**Documentation**: [EXPERT_PROFILE_QUERY_FIX.md](EXPERT_PROFILE_QUERY_FIX.md)

### 3. Expert Profile View Issues

**Issue**: When clicking on "View Profile" for an expert in the experts list, the system was trying to fetch the expert profile using the expert profile's ID, but the `getExpertProfile` method was designed to fetch profiles by user ID, not by profile ID.

**Fix**: Applied in `supabase/apply_expert_profile_view_fix.sh`

**Documentation**: [EXPERT_PROFILE_VIEW_FIX.md](EXPERT_PROFILE_VIEW_FIX.md)

## Future Enhancements

1. **Expert Verification**: Add a verification process for experts to ensure quality
2. **Expert Ratings**: Allow users to rate experts based on their interactions
3. **Expert Search**: Improve search functionality to find experts by specific criteria
4. **Expert Recommendations**: Recommend experts to users based on their needs and interests
5. **Expert Analytics**: Provide analytics for experts to track their impact and engagement
