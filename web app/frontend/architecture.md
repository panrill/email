# Email Form System - Web Application Architecture

## Overview
This document outlines the architecture for the Email Form System web application, including the frontend design, backend API structure, and integration with existing functionality.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│   Flask Backend │────▶│ Existing Python │
│                 │     │                 │     │     Scripts     │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │    Database     │     │  Microsoft 365  │
                        │                 │     │      API        │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## Frontend Architecture

### Component Structure
```
App
├── Auth
│   ├── Login
│   ├── Register
│   └── ForgotPassword
├── Dashboard
│   ├── Summary
│   ├── Statistics
│   └── RecentActivity
├── Forms
│   ├── FormList
│   ├── FormUpload
│   ├── FormTemplates
│   └── FormDetails
├── Recipients
│   ├── RecipientList
│   ├── RecipientGroups
│   └── RecipientDetails
├── Tracking
│   ├── TrackingTable
│   ├── StatusFilters
│   └── ExportOptions
├── Data
│   ├── ExtractedDataView
│   ├── DataExport
│   └── DataVisualization
├── Settings
│   ├── UserProfile
│   ├── EmailTemplates
│   ├── IntegrationSettings
│   └── SystemSettings
└── Shared
    ├── Navigation
    ├── Header
    ├── Footer
    ├── Notifications
    └── UIComponents
```

### Page Layouts

#### Dashboard
- Header with navigation and user info
- Summary cards (forms sent, returned, processed)
- Recent activity timeline
- Status distribution chart
- Quick action buttons

#### Form Management
- Form upload interface
- Form template library
- Form preview and edit options
- Form distribution options

#### Recipient Management
- Recipient list with search and filter
- Add/edit recipient interface
- Import recipients from CSV/Excel
- Group management

#### Tracking
- Interactive tracking table with filters
- Status indicators and color coding
- Action buttons for each entry
- Batch operations

#### Data Extraction
- View extracted data from forms
- Data validation interface
- Export options (Excel, CSV)
- Data visualization

## Backend Architecture

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/ms-auth` - Microsoft 365 authentication

#### Forms
- `GET /api/forms` - List all forms
- `POST /api/forms` - Upload new form
- `GET /api/forms/{id}` - Get form details
- `PUT /api/forms/{id}` - Update form
- `DELETE /api/forms/{id}` - Delete form
- `GET /api/forms/templates` - List form templates

#### Recipients
- `GET /api/recipients` - List all recipients
- `POST /api/recipients` - Add new recipient
- `GET /api/recipients/{id}` - Get recipient details
- `PUT /api/recipients/{id}` - Update recipient
- `DELETE /api/recipients/{id}` - Delete recipient
- `POST /api/recipients/import` - Import recipients from file

#### Emails
- `POST /api/emails/send` - Send emails with forms
- `GET /api/emails/status` - Check email status
- `GET /api/emails/check` - Check for returned forms

#### Tracking
- `GET /api/tracking` - Get tracking data
- `PUT /api/tracking/{id}` - Update tracking entry
- `GET /api/tracking/report` - Generate status report

#### Data
- `GET /api/data/extracted` - Get extracted form data
- `POST /api/data/extract` - Extract data from form
- `POST /api/data/export` - Export data to Excel
- `GET /api/data/visualize` - Get data for visualization

#### Storage
- `POST /api/storage/upload` - Upload file to cloud storage
- `GET /api/storage/download/{id}` - Download file from cloud storage
- `POST /api/storage/backup` - Create backup

### Database Schema

#### Users
```
users
├── id (PK)
├── username
├── email
├── password_hash
├── first_name
├── last_name
├── role
├── created_at
└── last_login
```

#### Forms
```
forms
├── id (PK)
├── name
├── description
├── file_path
├── created_by (FK: users.id)
├── created_at
└── updated_at
```

#### Recipients
```
recipients
├── id (PK)
├── name
├── email
├── phone
├── created_by (FK: users.id)
├── created_at
└── updated_at
```

#### Tracking
```
tracking
├── id (PK)
├── form_id (FK: forms.id)
├── recipient_id (FK: recipients.id)
├── date_sent
├── email_status
├── date_received
├── form_status
├── form_path
├── processing_status
├── created_at
└── updated_at
```

#### ExtractedData
```
extracted_data
├── id (PK)
├── tracking_id (FK: tracking.id)
├── data_json
├── extraction_method
├── created_at
└── updated_at
```

## Integration with Existing Functionality

### Script Integration
- Email sender module will be wrapped with API endpoints
- Tracking database module will be integrated with the database schema
- PDF extractor module will be called via API endpoints
- Excel transfer module will be used for data export
- SharePoint/OneDrive integration will be used for cloud storage

### Authentication Flow
1. User logs in to web application
2. Web application authenticates with Microsoft 365
3. Microsoft 365 tokens are stored securely
4. Backend uses tokens to access Microsoft 365 services

## Deployment Architecture

### Production Environment
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Web Browser   │────▶│   Nginx Server  │────▶│  Flask App      │
│                 │     │                 │     │  (Gunicorn)     │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │   PostgreSQL    │
                                               │   Database      │
                                               │                 │
                                               └─────────────────┘
```

### Containerization
- Docker containers for frontend, backend, and database
- Docker Compose for local development
- Kubernetes for production deployment (optional)

### CI/CD Pipeline
1. Code pushed to repository
2. Automated tests run
3. Build Docker images
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production environment

## Security Considerations

### Authentication and Authorization
- JWT-based authentication
- Role-based access control
- Secure password storage with hashing
- OAuth 2.0 for Microsoft 365 integration

### Data Protection
- HTTPS for all communications
- Encryption of sensitive data
- Secure handling of Microsoft 365 credentials
- Regular security audits

## Monitoring and Maintenance

### Logging
- Application logs
- Access logs
- Error logs
- Audit logs

### Monitoring
- Health checks
- Performance metrics
- Error tracking
- Usage statistics

### Backup and Recovery
- Regular database backups
- File storage backups
- Disaster recovery plan
