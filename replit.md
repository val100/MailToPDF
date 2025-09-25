# Enterprise Email to PDF Converter - Java Spring Boot

## Overview

This is an enterprise-grade Java Spring Boot application that converts Microsoft Office 365 emails to PDF files with advanced scheduling capabilities. The application integrates with Microsoft Graph API to fetch emails and uses iText7 to generate PDFs with precise filename formatting. It features configurable per-mailbox scheduling, thread-safe processing, and comprehensive monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture (Java Spring Boot)
- **Framework**: Spring Boot 3.2.0 with Java 17
- **Architecture**: Hexagonal architecture following SOLID principles
- **API Design**: RESTful API with comprehensive validation and error handling
- **Thread Safety**: One-task-per-mailbox guarantee with ReentrantLock synchronization
- **Scheduling**: Dynamic cron-based scheduling with configurable expressions per mailbox
- **Processing**: Asynchronous job processing with comprehensive monitoring

### Domain Layer
- **Domain Entities**: MailboxSchedule with JPA annotations and business logic
- **Domain Services**: Email processing orchestration and PDF generation
- **Value Objects**: Processing settings, schedule settings, and execution contexts
- **Repositories**: JPA repositories with custom queries for scheduling operations

### Application Layer
- **Service Ports**: Clean interfaces for scheduling, task execution, and email processing
- **Use Cases**: Schedule management, task execution, and monitoring operations
- **DTOs**: Request/response objects with validation annotations
- **Configuration**: Type-safe configuration properties with validation

### Infrastructure Layer
- **Database**: PostgreSQL with JPA/Hibernate for persistence
- **Microsoft Graph**: SDK integration for Office 365 email access
- **PDF Generation**: iText7 for professional PDF creation with custom formatting
- **File Storage**: Local filesystem with configurable paths and naming conventions
- **Security**: OAuth2 JWT authentication with role-based authorization

### Key Features
- **Precise Filename Format**: `{to_email}.{from_email}.{date}.{time}.{emailID@account.company.com}.pdf`
- **Dynamic Scheduling**: Per-mailbox cron expressions with runtime management
- **Thread Safety**: Mailbox locking service prevents concurrent processing
- **Attachment Processing**: Multi-format support for documents (Word, Excel, PowerPoint, PDF, text) and images (PNG, JPG, GIF, BMP)
- **Comprehensive Testing**: Unit tests with JUnit 5, Mockito, and Spring Boot Test
- **Enterprise Monitoring**: Health checks, execution tracking, and performance metrics

## External Dependencies

### Microsoft Services
- **Microsoft Graph SDK**: For accessing Office 365 emails and attachments
- **Azure Identity**: For OAuth2 authentication and token management
- **MSAL Integration**: Secure token storage and refresh capabilities

### Database & Persistence
- **PostgreSQL**: Primary database for application data
- **Spring Data JPA**: Data access layer with repository pattern
- **Hibernate**: ORM for database operations and schema management
- **H2 Database**: In-memory database for testing

### PDF Generation & Document Processing
- **iText7**: Professional PDF generation with advanced features
- **Apache Tika**: Multi-format document parsing and content extraction
- **Apache POI**: Microsoft Office document processing (Word, Excel, PowerPoint)

### Enterprise Framework
- **Spring Boot**: Application framework with auto-configuration
- **Spring Security**: OAuth2 resource server with JWT authentication
- **Spring Scheduling**: Cron-based task scheduling with thread pools
- **Spring Validation**: Request validation with Bean Validation API

### Development & Testing Tools
- **Maven**: Build tool and dependency management
- **JUnit 5**: Unit testing framework
- **Mockito**: Mocking framework for isolated testing
- **Spring Boot Test**: Integration testing with embedded server
- **JaCoCo**: Code coverage analysis

## Configuration Management
- **Environment-aware**: Supports development and production profiles
- **Type-safe Properties**: Validated configuration classes with Spring Boot
- **External Configuration**: Environment variables for deployment flexibility
- **Security Configuration**: OAuth2 settings and role-based access control