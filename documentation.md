# Email Form Tracking and Data Extraction System

## User Guide and Documentation

### Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation and Setup](#installation-and-setup)
4. [System Components](#system-components)
5. [Usage Instructions](#usage-instructions)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Technical Reference](#technical-reference)

## Introduction

The Email Form Tracking and Data Extraction System is a comprehensive solution designed to streamline the process of distributing forms via email, tracking their status, extracting data from returned PDF forms, and transferring that data to Excel spreadsheets. The system integrates with Microsoft 365 (SharePoint and OneDrive) for secure storage and collaboration.

### Key Features

- **Email Automation**: Send forms to multiple recipients and track email status
- **Form Tracking**: Monitor which forms have been returned and which are still pending
- **PDF Data Extraction**: Automatically extract data from returned PDF forms
- **Excel Integration**: Transfer extracted data to structured Excel spreadsheets
- **Cloud Storage**: Store forms and data securely in SharePoint or OneDrive
- **Comprehensive Reporting**: Generate status reports on form completion

## System Requirements

### Software Requirements

- Python 3.6 or higher
- Microsoft 365 account with appropriate permissions
- Required Python libraries:
  - O365 (for Microsoft 365 integration)
  - pandas and openpyxl (for Excel operations)
  - PyPDF/poppler-utils (for PDF processing)
  - msal (for Microsoft authentication)

### Microsoft 365 Requirements

- Microsoft 365 account with email and SharePoint/OneDrive access
- Application registration in Azure AD with appropriate permissions:
  - `offline_access`
  - `mail.readwrite`
  - `mail.send`
  - `files.readwrite.all`
  - `sites.readwrite.all`

## Installation and Setup

### 1. Clone or Download the System

Download the email form system files to your local machine.

### 2. Install Required Dependencies

```bash
pip install O365 pandas openpyxl pypdf msal
```

For PDF text extraction, install poppler-utils:

```bash
# On Ubuntu/Debian
sudo apt-get install poppler-utils

# On macOS
brew install poppler

# On Windows
# Download and install from https://github.com/oschwartz10612/poppler-windows/releases
```

### 3. Set Up Microsoft 365 Application

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter a name for your application
5. Set the redirect URI to `http://localhost`
6. Click "Register"
7. Note the "Application (client) ID" for later use
8. Navigate to "Certificates & secrets"
9. Create a new client secret and note its value
10. Navigate to "API permissions" and add the required permissions:
    - Microsoft Graph > Delegated permissions:
      - Mail.Read
      - Mail.ReadWrite
      - Mail.Send
      - Files.ReadWrite.All
      - Sites.ReadWrite.All
      - offline_access
11. Click "Grant admin consent"

### 4. Configure the System

Create a configuration file at `email_form_system/data/config.json`:

```json
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "sharepoint_site": "YOUR_SHAREPOINT_SITE_NAME",
  "token_path": "email_form_system/data/o365_token"
}
```

### 5. Initialize the System

Run the setup script to initialize the system:

```bash
cd email_form_system/scripts
python main.py setup --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET --sample
```

This will:
- Set up Microsoft 365 authentication
- Create a sample tracking spreadsheet
- Create the necessary directory structure

## System Components

The system consists of several key components:

### 1. Email Sender Module

The `email_sender.py` script handles sending emails with form attachments and checking for responses.

Key features:
- Send emails with PDF form attachments to multiple recipients
- Track email sending status
- Check for returned forms in email responses
- Download form attachments from responses

### 2. Tracking Database Module

The `tracking_database.py` script manages the tracking database for email and form status.

Key features:
- Create and maintain a tracking spreadsheet
- Update email and form status
- Generate status reports

### 3. PDF Extractor Module

The `pdf_extractor.py` script extracts data from returned PDF forms.

Key features:
- Extract form fields from fillable PDFs
- Extract text content using multiple methods
- Process batches of PDF files
- Save extracted data in JSON format

### 4. Excel Transfer Module

The `excel_transfer.py` script transfers extracted data to Excel spreadsheets.

Key features:
- Process JSON data from PDF extraction
- Create formatted Excel spreadsheets
- Update tracking database with processing status

### 5. SharePoint/OneDrive Integration Module

The `sharepoint_onedrive.py` script integrates with SharePoint and OneDrive for cloud storage.

Key features:
- Upload files to SharePoint or OneDrive
- Download files from cloud storage
- Synchronize local directories with cloud storage
- Create backups of local data

### 6. Main Script

The `main.py` script provides a command-line interface for the system.

Key features:
- Set up the system
- Send forms to recipients
- Check for returned forms
- Generate status reports

## Usage Instructions

### Setting Up the System

```bash
python main.py setup --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

### Creating a Sample Form

```bash
python create_sample_form.py
```

### Sending Forms to Recipients

1. Prepare a tracking spreadsheet with recipient information (Name, Email)
2. Run the send command:

```bash
python main.py send --form /path/to/form.pdf --tracking /path/to/tracking.xlsx --subject "Please complete this form" --body "Hello {Name},\n\nPlease complete the attached form and return it at your earliest convenience.\n\nThank you."
```

### Checking for Returned Forms

```bash
python main.py check --tracking /path/to/tracking.xlsx
```

### Extracting Data from Returned Forms

```bash
python pdf_extractor.py /path/to/returned_forms /path/to/extracted_data
```

### Transferring Data to Excel

```bash
python excel_transfer.py /path/to/extracted_data /path/to/output.xlsx /path/to/tracking.xlsx
```

### Uploading Data to SharePoint/OneDrive

```bash
python sharepoint_onedrive.py YOUR_CLIENT_ID YOUR_CLIENT_SECRET sync /path/to/data EmailFormSystem
```

### Generating Status Reports

```bash
python main.py report --tracking /path/to/tracking.xlsx
```

## Workflow Example

Here's a complete workflow example:

1. **Setup the system**:
   ```bash
   python main.py setup --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
   ```

2. **Create a form** (or use an existing one):
   ```bash
   python create_sample_form.py
   ```

3. **Send forms to recipients**:
   ```bash
   python main.py send --form forms/sample_form.pdf --tracking data/tracking.xlsx
   ```

4. **Check for returned forms**:
   ```bash
   python main.py check --tracking data/tracking.xlsx
   ```

5. **Extract data from returned forms**:
   ```bash
   python pdf_extractor.py data/returned_forms data/extracted
   ```

6. **Transfer data to Excel**:
   ```bash
   python excel_transfer.py data/extracted data/form_data.xlsx data/tracking.xlsx
   ```

7. **Upload data to SharePoint/OneDrive**:
   ```bash
   python sharepoint_onedrive.py YOUR_CLIENT_ID YOUR_CLIENT_SECRET backup data EmailFormBackup
   ```

8. **Generate a status report**:
   ```bash
   python main.py report --tracking data/tracking.xlsx
   ```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues with Microsoft 365:

1. Check that your client ID and client secret are correct
2. Ensure your application has the required permissions
3. Delete the token file and re-authenticate
4. Check if your Microsoft 365 account has the necessary licenses

### PDF Extraction Issues

If PDF data extraction is not working correctly:

1. Check if the PDF is a fillable form or a scanned document
2. Try different extraction methods (form fields, text extraction)
3. Ensure poppler-utils is installed correctly
4. For scanned PDFs, consider using OCR tools before extraction

### Email Sending Issues

If emails are not being sent:

1. Check your Microsoft 365 authentication
2. Verify that your account has permission to send emails
3. Check for rate limiting or spam prevention measures
4. Ensure the email addresses are valid

## Best Practices

### Form Design

- Create fillable PDF forms for better data extraction
- Use clear field names that match your data schema
- Include instructions for recipients on how to complete and return the form
- Test the form with the extraction system before sending to recipients

### Email Management

- Send forms in batches to avoid rate limiting
- Use personalized email templates with recipient names
- Include clear instructions in the email body
- Set up a dedicated email account for form processing

### Data Management

- Regularly back up your tracking spreadsheet and extracted data
- Use consistent naming conventions for files and folders
- Store sensitive data securely and in compliance with relevant regulations
- Implement version control for your forms and data

### System Maintenance

- Regularly update the system dependencies
- Monitor disk space for storing returned forms and extracted data
- Implement error logging and monitoring
- Schedule regular checks for returned forms

## Technical Reference

### Script Reference

#### main.py

```
Usage: python main.py [command] [options]

Commands:
  setup       - Set up Microsoft 365 authentication and create tracking database
  send        - Send forms to recipients in tracking spreadsheet
  check       - Check for returned forms and update tracking
  report      - Generate status report
  help        - Show this help message
```

#### email_sender.py

```python
from email_sender import EmailFormSender
sender = EmailFormSender('your_client_id', 'your_client_secret')
sender.authenticate()
sender.send_form_emails('recipients.xlsx', 'Form Request', 'Please fill out the attached form', 'form.pdf')
sender.check_for_responses('tracking.xlsx', 'returned_forms', 'form')
```

#### tracking_database.py

```python
from tracking_database import TrackingDatabase
db = TrackingDatabase('tracking.xlsx')
db.add_recipients([{'Name': 'John Doe', 'Email': 'john@example.com'}])
db.update_email_status('john@example.com', 'Sent')
db.update_form_status('john@example.com', 'Returned', 'path/to/form.pdf')
db.generate_status_report('report.md')
```

#### pdf_extractor.py

```python
from pdf_extractor import PDFDataExtractor
extractor = PDFDataExtractor('form.pdf')
data = extractor.extract_all_data()
extractor.save_extracted_data('extracted_data.json', data)
```

#### excel_transfer.py

```python
from excel_transfer import process_extracted_data
process_extracted_data('extracted_data.json', 'output.xlsx', 'tracking.xlsx')
```

#### sharepoint_onedrive.py

```python
from sharepoint_onedrive import SharePointOneDriveIntegration
integration = SharePointOneDriveIntegration('your_client_id', 'your_client_secret')
integration.authenticate()
integration.upload_file_to_onedrive('local_file.xlsx', 'remote_folder')
integration.create_backup('local_directory')
```

### Data Structures

#### Tracking Spreadsheet

The tracking spreadsheet contains the following columns:

- **Name**: Recipient's name
- **Email**: Recipient's email address
- **Date Sent**: Date when the email was sent
- **Email Status**: Status of the email (Not Sent, Sent, Failed, Error)
- **Date Received**: Date when the form was received
- **Form Status**: Status of the form (Not Returned, Returned)
- **Form Path**: Path to the returned form file
- **Processing Status**: Status of data processing (Not Started, In Progress, Completed, Error)

#### Extracted Data JSON

The extracted data JSON file has the following structure:

```json
{
  "metadata": {
    "filename": "form.pdf",
    "path": "/path/to/form.pdf",
    "extraction_methods": ["form_fields", "pdftotext"]
  },
  "form_fields": {
    "field1": "value1",
    "field2": "value2"
  },
  "text_content": "Full text content of the PDF",
  "extracted_data": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "table_data": [
    {"column1": "row1value1", "column2": "row1value2"},
    {"column1": "row2value1", "column2": "row2value2"}
  ]
}
```

## Conclusion

The Email Form Tracking and Data Extraction System provides a comprehensive solution for managing the distribution, tracking, and processing of PDF forms via email. By automating these tasks, the system saves time, reduces errors, and improves the efficiency of form-based workflows.

For additional support or customization, please refer to the technical reference section or contact your system administrator.
