# Enterprise Email to PDF Converter - Java Spring Boot Web Application

## Overview

This enterprise-grade Java Spring Boot web application converts Microsoft Office 365 emails to PDF files, inspired by the "Automatic Email Manager" desktop application. It offers a modern, web-based solution accessible from any browser, integrating with Microsoft Graph API for email fetching and PDFBox for PDF generation. Key capabilities include multi-format export, automated email actions (mark as read, move, delete), auto-reply/forward, and notifications via Slack, Microsoft Teams, and Telegram. The project aims to provide a comprehensive, web-based email processing and automation platform with a focus on enterprise needs and an intuitive user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend Framework**: React 18 with TypeScript for a modern, responsive single-page application.
- **UI Components**: Shadcn UI with Tailwind CSS for a consistent and customizable design.
- **State Management**: TanStack Query (React Query) for efficient server state management.
- **Forms**: React Hook Form with Zod validation for robust form handling.
- **Routing**: Wouter for lightweight client-side routing.

### Technical Implementations
- **Backend Framework**: Spring Boot 3.2.0 with Java 17, adhering to a Hexagonal architecture and SOLID principles.
- **API Design**: RESTful API with comprehensive validation and error handling.
- **Thread Safety**: ReentrantLock ensures one-task-per-mailbox for synchronized processing.
- **Scheduling**: Dynamic cron-based scheduling per mailbox.
- **Processing**: Asynchronous job processing with monitoring.
- **Domain Layer**: JPA-annotated entities, services for email processing and PDF generation, value objects for settings, and JPA repositories.
- **Application Layer**: Services for Microsoft Graph integration, PDF generation, multi-format email export (EML, MSG, TXT, XML), email actions (move, delete, copy, mark as read), notification integrations, mailbox locking, and file naming.

### Feature Specifications
- **Email Processing**: Converts emails and attachments to PDF with precise filename format. Supports saving emails as EML, MSG, TXT, XML.
- **Email Actions**: Mark as read, move to folder, copy to folder, delete after processing.
- **Automation**: Auto-reply and auto-forward capabilities.
- **Notifications**: Integrations with Slack, Microsoft Teams, and Telegram.
- **Web-Based Dashboard**: React UI for real-time monitoring, configuration management, and file management.
- **Scenarios & Conditions**: Rule-based email filtering (subject, from, to, body, attachments) with AND/OR logic, and configurable actions for matching emails.

### System Design Choices
- **Database**: H2 in-memory database for development, with PostgreSQL as an optional production database.
- **File Storage**: Local filesystem with configurable paths.
- **Security**: Configurable OAuth2 JWT authentication.
- **Configuration**: Environment-aware with type-safe properties and external configuration flexibility. Demo mode included for testing without Office 365 credentials.

## External Dependencies

- **Microsoft Graph API**: For accessing Office 365 emails and attachments.
- **Azure Identity**: For OAuth2 authentication and token management.
- **Apache PDFBox**: For PDF generation and manipulation.
- **Apache Tika**: (Future enhancement) Multi-format document parsing.
- **Apache POI**: (Future enhancement) Microsoft Office document processing.
- **Spring Data JPA**: Data access layer.
- **Hibernate**: ORM for database operations.
- **Spring WebFlux**: Reactive HTTP client for webhooks.
- **H2 Database**: In-memory database.
- **PostgreSQL**: Production database option.
- **React**: Frontend UI library.
- **TypeScript**: For type-safe frontend development.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: React component library.
- **TanStack Query**: Data synchronization.
- **React Hook Form**: Form validation.
- **Wouter**: Routing library.