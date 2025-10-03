# Enterprise Email to PDF Converter - Java Spring Boot Web Application

## Overview

This is an enterprise-grade Java Spring Boot **web application** that converts Microsoft Office 365 emails to PDF files, inspired by the "Automatic Email Manager" desktop application from namtuk.com. Unlike the original Windows desktop application, this is a modern web-based solution accessible from any browser.

The application integrates with Microsoft Graph API to fetch emails, uses PDFBox for PDF generation, and features comprehensive email processing automation including multi-format export, email actions, auto-reply/forward capabilities, and notification integrations with Teams, Slack, and Telegram.

## User Preferences

Preferred communication style: Simple, everyday language.

## Key Features (Inspired by Automatic Email Manager)

### ✅ Email Processing
- **Convert emails and attachments to PDF format** with precise filename format: `{to_email}.{from_email}.{date}.{time}.{emailID@account.company.com}.pdf`
- **Multi-format email export**: Save emails as EML, MSG, TXT, XML formats
- **Attachment handling**: Process and list attachments in generated PDFs
- **Scheduled processing**: Configurable per-mailbox cron-based scheduling
- **Thread-safe operation**: One-task-per-mailbox guarantee with ReentrantLock synchronization

### ✅ Email Actions (Organize Mailbox)
- **Mark as read**: Automatically mark processed emails as read
- **Move to folder**: Move processed emails to specified folders
- **Copy to folder**: Create copies in designated folders
- **Delete after processing**: Optional deletion (use with caution)

### ✅ Automation
- **Auto-reply**: Send automatic replies to processed emails
- **Auto-forward**: Forward processed emails to another address
- **Configurable rules**: Set up processing rules per mailbox

### ✅ Notifications
- **Slack integration**: Send notifications to Slack channels via webhooks
- **Microsoft Teams integration**: Post updates to Teams channels
- **Telegram integration**: Receive notifications via Telegram bot

### ✅ Web-Based Dashboard
- **Modern React UI**: Responsive single-page application
- **Real-time monitoring**: Track processing jobs in real-time
- **Configuration management**: Web-based settings for all features
- **File management**: View, download, and manage generated PDFs

## System Architecture

### Backend Architecture (Java Spring Boot)
- **Framework**: Spring Boot 3.2.0 with Java 17
- **Architecture**: Hexagonal architecture following SOLID principles
- **API Design**: RESTful API with comprehensive validation and error handling
- **Thread Safety**: One-task-per-mailbox guarantee with ReentrantLock synchronization
- **Scheduling**: Dynamic cron-based scheduling with configurable expressions per mailbox
- **Processing**: Asynchronous job processing with comprehensive monitoring

### Frontend Architecture (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Shadcn UI with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

### Domain Layer (Java)
- **Domain Entities**: MailboxSchedule with JPA annotations and business logic
- **Domain Services**: Email processing orchestration and PDF generation
- **Value Objects**: ProcessingSettings, ScheduleSettings, ExecutionContext
- **Repositories**: JPA repositories with custom queries for scheduling operations

### Application Layer (Java)
- **Service Implementations**: 
  - MicrosoftGraphEmailService: Office 365 email fetching
  - PdfGenerationService: Email to PDF conversion
  - EmailExportService: Multi-format email saving (EML, MSG, TXT, XML)
  - EmailActionService: Email operations (move, delete, copy, mark as read)
  - NotificationService: Integration with Slack, Teams, Telegram
  - MailboxLockingService: Thread-safe mailbox access control
  - FileNamingService: Precise filename generation

### Infrastructure Layer
- **Database**: H2 in-memory database (can be switched to PostgreSQL)
- **Microsoft Graph**: REST API integration for Office 365 email access (demo mode available)
- **PDF Generation**: Apache PDFBox for professional PDF creation
- **File Storage**: Local filesystem with configurable paths and naming conventions
- **HTTP Client**: Spring WebFlux WebClient for notification webhooks
- **Security**: Configurable OAuth2 JWT authentication

## Feature Comparison with Automatic Email Manager

| Feature | Automatic Email Manager (Desktop) | Our Application (Web) |
|---------|-----------------------------------|------------------------|
| Platform | Windows Desktop | Web Browser (Any OS) |
| Email to PDF Conversion | ✅ | ✅ |
| Save as EML, MSG, TXT, XML | ✅ | ✅ |
| Auto-reply & Forward | ✅ | ✅ |
| Slack/Teams/Telegram Notifications | ✅ | ✅ |
| Move/Delete/Copy Emails | ✅ | ✅ |
| Scheduled Processing | ✅ Windows Service | ✅ Cron Expressions |
| Web-based UI | ❌ | ✅ |
| Multi-user Access | ❌ | ✅ |
| Cloud Deployment | ❌ | ✅ |
| Real-time Monitoring Dashboard | ❌ | ✅ |

## External Dependencies

### Microsoft Services
- **Microsoft Graph API**: For accessing Office 365 emails and attachments (REST API)
- **Azure Identity**: For OAuth2 authentication and token management
- **MSAL Integration**: Secure token storage and refresh capabilities

### Database & Persistence
- **H2 Database**: In-memory database for development and testing
- **PostgreSQL**: Optional production database
- **Spring Data JPA**: Data access layer with repository pattern
- **Hibernate**: ORM for database operations and schema management

### PDF Generation & Document Processing
- **Apache PDFBox**: PDF generation and manipulation
- **Apache Tika**: Multi-format document parsing (ready for future enhancements)
- **Apache POI**: Microsoft Office document processing (ready for attachments)

### Enterprise Framework
- **Spring Boot**: Application framework with auto-configuration
- **Spring Web**: RESTful web services
- **Spring Scheduling**: Cron-based task scheduling with thread pools
- **Spring Validation**: Request validation with Bean Validation API
- **Spring WebFlux**: Reactive HTTP client for webhooks

### Frontend Stack
- **React**: UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality React component library
- **TanStack Query**: Powerful data synchronization
- **React Hook Form**: Performant form validation
- **Wouter**: Minimalist routing library

### Development & Testing Tools
- **Maven**: Build tool and dependency management
- **JUnit 5**: Unit testing framework
- **Mockito**: Mocking framework for isolated testing
- **Spring Boot Test**: Integration testing with embedded server
- **Vite**: Frontend build tool and development server
- **ESBuild**: Fast JavaScript/TypeScript bundler

## Configuration Management

### Java Backend Configuration
- **Environment-aware**: Supports development and production profiles
- **Type-safe Properties**: Validated configuration classes with Spring Boot
- **External Configuration**: Environment variables for deployment flexibility
- **Microsoft Credentials**: MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID

### Frontend Configuration
- **Environment Variables**: Vite-based env vars (VITE_ prefix)
- **API Base URL**: Configurable backend endpoint
- **Build Optimization**: Production builds with code splitting

## Running the Application

### Development Mode
The application runs both Java backend (port 8080) and React frontend (port 5000) simultaneously:

```bash
# Frontend (automatically started)
npm run dev

# Java Backend
./run-java-app.sh
# or
mvn spring-boot:run
```

### Production Build
```bash
# Build Java application
mvn clean package

# Run standalone JAR
java -jar target/email-to-pdf-converter-1.0.0.jar

# Frontend is built and served by Vite
```

## API Endpoints (Java Backend - Port 8080)

### Email Processing
- `POST /api/processing/start` - Start email processing job
- `GET /api/processing/status/{jobId}` - Get job status
- `POST /api/mailbox/schedule` - Configure mailbox schedule

### File Management
- `GET /api/files/recent` - List recent PDF files
- `GET /api/files/download/{filename}` - Download PDF file
- `DELETE /api/files/{id}` - Delete PDF file

### Configuration
- `GET /api/settings` - Get current settings
- `POST /api/settings` - Update settings
- `GET /api/office365/test` - Test Office 365 connection

### Monitoring
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/activity` - Get recent activity log
- `GET /health` - Health check endpoint

## Web Dashboard Pages (React - Port 5000)

1. **Dashboard** (`/`) - Overview with stats, recent activity, and quick actions
2. **Email Processing** (`/email-processing`) - Configure and trigger processing jobs
3. **PDF Files** (`/pdf-files`) - Browse, download, and manage generated PDFs
4. **Settings** (`/settings`) - Comprehensive configuration with tabs:
   - General: Basic processing settings
   - Export Formats: EML, MSG, TXT, XML options
   - Email Actions: Mark as read, move, delete options
   - Automation: Auto-reply and auto-forward
   - Notifications: Slack, Teams, Telegram webhooks
   - Office 365: Microsoft Graph API configuration

## Demo Mode

The application includes a demo mode that works without Microsoft Office 365 credentials:
- Generates sample emails for testing
- Converts sample emails to PDF
- Tests all export formats (EML, MSG, TXT, XML)
- Demonstrates notification integrations
- Allows UI/UX testing without real mailbox access

To use demo mode, simply run the application without configuring Microsoft credentials.

## Recent Changes (October 2025)

### Major Feature Implementation
- ✅ Implemented all "Automatic Email Manager" features as web application
- ✅ Created 5 new Java services (Microsoft Graph, PDF Generation, Export, Actions, Notifications)
- ✅ Built comprehensive React settings page with 6 configuration tabs
- ✅ Added multi-format email export (EML, MSG, TXT, XML)
- ✅ Implemented email actions (mark as read, move, delete, copy)
- ✅ Added automation features (auto-reply, auto-forward)
- ✅ Integrated notifications (Slack, Teams, Telegram)
- ✅ Enhanced ProcessingSettings with 18+ configuration options
- ✅ Created demo mode for testing without Office 365 credentials

### Testing
- 92 comprehensive unit tests covering all components (100% pass rate)
- Test coverage includes: services, domain logic, repositories, controllers, integration scenarios
- Both positive and negative test cases implemented

## Next Steps

1. **Test with Real Office 365 Account**: Configure Microsoft Graph API credentials and test with actual mailbox
2. **Enhanced PDF Generation**: Add support for embedded attachments in PDFs
3. **Scheduling UI**: Create web interface for managing mailbox schedules
4. **User Authentication**: Add login system for multi-user support
5. **Activity History**: Implement detailed processing history and logs
6. **Email Filters**: Add rules engine for selective email processing
7. **Batch Operations**: Support processing multiple mailboxes in parallel
