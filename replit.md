# Email to PDF Converter Application

## Overview

This is a full-stack web application that converts Microsoft Office 365 emails to PDF files. The application integrates with Microsoft Graph API to fetch emails and uses Puppeteer to generate PDFs from email content. It features a modern React frontend with a dashboard for monitoring conversion jobs, file management, and activity tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Component Structure**: Modular component design with reusable UI components and page-specific components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Background Processing**: Asynchronous job processing for email conversion
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Vite middleware integration for hot reloading in development

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Design**: Normalized schema with tables for users, email processing jobs, converted emails, Office 365 tokens, and activity logs
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication & External Services
- **Microsoft Graph Integration**: MSAL (Microsoft Authentication Library) for OAuth authentication with Office 365
- **Token Management**: Secure storage and refresh of Office 365 access tokens
- **Email Access**: Microsoft Graph Client for fetching emails with configurable date ranges and limits

### File Processing & Storage
- **PDF Generation**: Puppeteer for converting HTML email content to PDF format
- **File Management**: Local file system storage with organized directory structure
- **File Operations**: Support for file download, preview, and deletion operations

### Development & Build System
- **Build Tool**: Vite for fast development and optimized production builds
- **TypeScript Configuration**: Strict type checking with path aliases for clean imports
- **Code Quality**: ESLint and Prettier integration through Vite plugins
- **Development Tools**: Runtime error overlay and hot module replacement

## External Dependencies

### Microsoft Services
- **Microsoft Graph API**: For accessing Office 365 emails and user data
- **Azure Active Directory**: For OAuth authentication and authorization
- **MSAL Node**: Microsoft Authentication Library for secure token management

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **PostgreSQL**: Primary database for application data storage

### PDF Generation & Processing
- **Puppeteer**: Headless Chrome for PDF generation from HTML content
- **Node.js File System**: Local file storage and management

### UI & Frontend Libraries
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack React Query**: Data fetching and caching library
- **Wouter**: Lightweight client-side routing
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Replit Integration**: Development environment optimizations for Replit platform