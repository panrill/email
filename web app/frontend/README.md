# Email Form System - README

## Overview

The Email Form System is a comprehensive web application that allows you to:
- Send PDF forms to multiple recipients via email
- Track when forms are sent and returned
- Extract data from returned PDF forms
- Transfer extracted data to Excel spreadsheets
- Store forms and data in SharePoint/OneDrive

This version of the application is built using pure HTML, CSS, and JavaScript for the frontend with a Flask backend API, making it lightweight, fast, and easy to deploy.

## Features

- **Form Management**: Upload, view, and manage PDF forms
- **Recipient Management**: Add, import, and manage form recipients
- **Email Tracking**: Track sent forms and monitor returns
- **Data Extraction**: Extract data from returned PDF forms
- **Excel Integration**: Transfer extracted data to Excel spreadsheets
- **SharePoint/OneDrive Integration**: Store forms and data securely
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices

## Directory Structure

```
email_form_system/
├── web_app/
│   ├── frontend/
│   │   ├── css/
│   │   │   ├── base.css
│   │   │   ├── layout.css
│   │   │   └── components.css
│   │   ├── js/
│   │   │   ├── core/
│   │   │   │   ├── app.js
│   │   │   │   ├── router.js
│   │   │   │   ├── api.js
│   │   │   │   ├── auth.js
│   │   │   │   ├── store.js
│   │   │   │   ├── ui.js
│   │   │   │   └── templates.js
│   │   │   ├── pages/
│   │   │   │   ├── dashboard.js
│   │   │   │   ├── forms.js
│   │   │   │   ├── recipients.js
│   │   │   │   ├── tracking.js
│   │   │   │   ├── extraction.js
│   │   │   │   └── settings.js
│   │   │   └── auth-implementation.js
│   │   ├── index.html
│   │   ├── user_guide.md
│   │   ├── technical_documentation.md
│   │   ├── test_application.js
│   │   └── deploy.sh
│   ├── backend/
│   │   ├── app.py
│   │   └── integration.py
├── scripts/
│   ├── email_sender.py
│   ├── tracking_database.py
│   ├── pdf_extractor.py
│   ├── excel_transfer.py
│   └── sharepoint_onedrive.py
├── forms/
├── data/
└── documentation.md
```

## Installation

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/email-form-system.git
cd email-form-system
```

2. Run the deployment script:
```bash
cd web_app/frontend
chmod +x deploy.sh
./deploy.sh
```

3. Access the application at http://localhost:5000

### Manual Installation

1. Install required Python packages:
```bash
pip install flask flask-cors flask-jwt-extended python-dotenv gunicorn
```

2. Start the backend server:
```bash
cd web_app/backend
python app.py
```

3. Open index.html in your browser or serve it with a web server.

## Usage

See the [User Guide](web_app/frontend/user_guide.md) for detailed usage instructions.

## Development

See the [Technical Documentation](web_app/frontend/technical_documentation.md) for development information.

## Deployment

To deploy the application to a production environment:

1. Run the deployment script:
```bash
cd web_app/frontend
./deploy.sh
```

2. Follow the instructions in the deployment package README.

## Testing

To test the application:

```bash
cd web_app/frontend
node test_application.js
```

## Default Credentials

- Email: admin@example.com
- Password: admin123

**Important**: Change the default password after first login!

## License

© 2025 Email Form System. All rights reserved.
