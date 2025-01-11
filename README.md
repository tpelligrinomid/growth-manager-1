# Growth Manager

A comprehensive account management system designed to help track and optimize client relationships and business growth metrics.

## Overview

Growth Manager is a business tool that enables account managers to track client accounts, review goals, monitor progress, and maintain client relationships. The system provides a centralized platform for managing account details, performance metrics, and client communications.

## Core Features

### Account Management
- Track comprehensive account details including:
  - Basic Information (Account Name, Business Unit, Engagement Type, Priority)
  - Management Structure (Account Manager, Team Manager)
  - Timeline Data (Relationship Start Date, Contract Dates)
  - Service Delivery Metrics (Points Purchased, Delivered, Balance)
  - Performance Indicators (Striking Distance, Delivery Status)

### Financial Metrics
- Monitor key business metrics:
  - MRR (Monthly Recurring Revenue)
  - Growth in MRR
  - Potential MRR
  - Recurring points per month    

### Goal Tracking
- Set and monitor account-specific goals
- Track progress and due dates
- Maintain status updates

### Client Contact Information
- Store and manage client contacts
- Track essential contact details:
  - First Name
  - Last Name
  - Title
  - Email

### Client Company Information
  - Website
  - LinkedIn Profile
  - Industry
  - Annual Revenue
  - Employee Count

### Notes System
- Create and maintain account-specific notes
- Track note creation and authorship
- Document important account interactions and decisions

## Dashboard View
The Growth Manager dashboard provides a comprehensive view of account performance, including:
- Account status overview
- Points tracking (Purchased, Delivered, Balance)
- Delivery status
- Goal completion rates
- Key performance metrics

## Target Users (required to login to access the application)
- Account Managers
- Growth Teams
- Client Success Managers
- Agency Leadership Team

## Purpose
This application streamlines account management processes by providing a single source of truth for client relationships, helping teams maintain organized records and make data-driven decisions to optimize growth strategies.

## Project Structure

Key files in the project:

### Client-side
- `client/.gitignore` - Specifies which files Git should ignore
- `client/src/App.tsx` - Main React application component with account table and modal
- `client/tsconfig.app.json` - TypeScript configuration for the client
- `client/src/components/AccountDetails.tsx` - Account details modal component
- `client/package.json` - Client dependencies and scripts

### Server-side
- `server/src/types/index.ts` - TypeScript type definitions for the API
- `server/prisma/seed.ts` - Database seeding script
- `server/package.json` - Server dependencies and scripts

### Setup and Configuration
- `cleanup.ps1` - PowerShell setup script
- `cleanup.sh` - Bash setup script

Each file serves a specific purpose in the application:
- The client-side files handle the UI and user interactions
- The server-side files manage data and API endpoints
- Setup scripts help initialize the project and maintain consistency