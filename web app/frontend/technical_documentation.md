# Email Form System - Technical Documentation

## System Architecture

The Email Form System is built using a modern HTML, CSS, and JavaScript frontend with a Flask backend API. This document provides technical details about the system architecture, components, and implementation.

## Frontend Architecture

### Core Components

The frontend is built using vanilla HTML, CSS, and JavaScript with a modular architecture:

#### HTML Structure
- `index.html` - Main entry point containing all page templates
- HTML templates are embedded within the main HTML file using `<script type="text/html">` tags

#### CSS Organization
- `base.css` - Core styles, variables, and utility classes
- `layout.css` - Layout structures and responsive design
- `components.css` - Component-specific styles

#### JavaScript Modules
- **Core Modules**
  - `app.js` - Application initialization and core functionality
  - `router.js` - Client-side routing and navigation
  - `api.js` - API communication with the backend
  - `auth.js` - Authentication and authorization
  - `store.js` - Simple state management
  - `ui.js` - UI utilities and components
  - `templates.js` - HTML template rendering

- **Implementation Modules**
  - `auth-implementation.js` - Authentication implementation
  - Page-specific modules in the `pages/` directory

### Client-Side Routing

The application uses a custom client-side router that:
- Handles navigation without page reloads
- Updates browser history
- Renders the appropriate page template
- Initializes page-specific functionality

### State Management

The application uses a simple state management system that:
- Stores application state in a central store
- Allows components to subscribe to state changes
- Persists relevant state to localStorage
- Provides methods for updating state

### Authentication

The authentication system:
- Uses JWT tokens for secure authentication
- Stores tokens in localStorage
- Automatically redirects unauthenticated users to the login page
- Provides login, registration, and logout functionality

## Backend Architecture

### API Endpoints

The backend provides RESTful API endpoints for all application functionality:

#### Authentication
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/register` - Register a new user
- `GET /api/auth/user` - Get current user information

#### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary data

#### Forms
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get a specific form
- `POST /api/forms` - Create a new form
- `DELETE /api/forms/:id` - Delete a form
- `POST /api/forms/:id/send` - Send a form to recipients

#### Recipients
- `GET /api/recipients` - Get all recipients
- `POST /api/recipients` - Create a new recipient
- `PUT /api/recipients/:id` - Update a recipient
- `DELETE /api/recipients/:id` - Delete a recipient
- `POST /api/recipients/import` - Import recipients from file

#### Tracking
- `GET /api/tracking` - Get all tracking records
- `POST /api/tracking/check-returns` - Check for returned forms
- `POST /api/tracking/report` - Generate tracking report

#### Data Extraction
- `GET /api/extraction` - Get all extraction records
- `POST /api/extraction/extract` - Extract data from forms
- `GET /api/extraction/data` - Get extracted data
- `POST /api/extraction/export` - Export data to Excel

#### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/test-integration` - Test integration settings
- `POST /api/settings/backup` - Create backup

### Security

The backend implements several security measures:
- JWT-based authentication
- Password hashing using werkzeug.security
- CORS protection
- Input validation

## Integration with Original Scripts

The HTML/JS application integrates with the original Python scripts:

- `email_sender.py` - Sends emails with form attachments
- `tracking_database.py` - Manages the tracking database
- `pdf_extractor.py` - Extracts data from PDF forms
- `excel_transfer.py` - Transfers data to Excel
- `sharepoint_onedrive.py` - Integrates with SharePoint/OneDrive

## Deployment

### Requirements

- Web server (Nginx recommended)
- Python 3.8 or newer
- Flask and required Python packages
- Systemd (for service management)

### Deployment Process

1. Copy frontend files to web server directory
2. Copy backend files to server
3. Install required Python packages
4. Configure Nginx to serve static files and proxy API requests
5. Set up systemd service for the backend
6. Start the service and verify installation

### Configuration

The application can be configured through several files:
- `.env` file for backend configuration
- `config.json` for application settings
- Nginx configuration for web server settings
- Systemd service file for service management

## Development

### Adding New Features

To add new features to the application:

1. **Frontend**:
   - Add new HTML template to `index.html`
   - Add CSS styles to appropriate CSS file
   - Create new JavaScript module in `js/pages/`
   - Update router to handle new page

2. **Backend**:
   - Add new API endpoint to `app.py`
   - Implement endpoint functionality
   - Update API documentation

### Testing

The application includes a test script (`test_application.js`) that tests:
- Backend API endpoints
- Frontend file existence
- Core functionality

Run the test script to verify the application is working correctly:
```
node test_application.js
```

## Maintenance

### Backup and Restore

To backup the application data:
```bash
sudo tar -czvf email-form-system-backup.tar.gz /var/www/email-form-system/data
```

To restore from backup:
```bash
sudo tar -xzvf email-form-system-backup.tar.gz -C /
```

### Updating

To update the application:
1. Backup the current installation
2. Deploy the new version using the deployment script
3. Verify the update was successful

### Troubleshooting

Common issues and solutions:
- **Backend not starting**: Check systemd logs with `journalctl -u email-form-system`
- **API errors**: Check Flask logs for details
- **Frontend issues**: Check browser console for JavaScript errors
- **Authentication problems**: Verify JWT secret key is consistent

## Performance Considerations

The HTML/JS application offers several performance advantages:
- Smaller JavaScript payload compared to React
- No build step required
- Faster initial load time
- Reduced memory usage

## Security Considerations

Important security considerations:
- Change default admin password immediately
- Use HTTPS in production
- Keep JWT secret keys secure
- Regularly update dependencies
- Implement proper input validation
- Use secure headers in Nginx configuration

---

© 2025 Email Form System. All rights reserved.
