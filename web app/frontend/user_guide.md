# Email Form System Web Application - User Guide

## Introduction

The Email Form System Web Application is a comprehensive solution for managing the process of sending forms to multiple recipients via email, tracking their status, extracting data from returned PDF forms, and transferring this data to Excel. This web-based system provides an intuitive interface to streamline your form management workflow.

## Getting Started

### Accessing the Application

1. Open your web browser and navigate to the application URL (e.g., http://your-server-ip:5000)
2. Log in with your credentials:
   - Default admin account: admin@example.com (password: admin123)
   - If you don't have an account, contact your administrator or use the registration page if enabled

### Dashboard Overview

The dashboard provides a quick overview of your form management system:

- **Forms**: Total number of forms available in the system
- **Recipients**: Total number of recipients in your database
- **Emails Sent**: Total number of form emails sent
- **Forms Returned**: Number of forms that have been returned
- **Recent Activity**: Timeline of recent actions in the system

## Managing Forms

### Uploading Forms

1. Navigate to **Forms** in the sidebar menu
2. Click the **Upload Form** button
3. Fill in the form details:
   - **Name**: A descriptive name for the form
   - **Description**: Optional description of the form's purpose
   - **File**: Select the PDF form file from your computer
4. Click **Upload** to add the form to the system

### Managing Existing Forms

From the Forms page, you can:

- **View** form details by clicking on a form name
- **Download** a form by clicking the download icon
- **Delete** a form by clicking the delete icon (caution: this cannot be undone)
- **Send** a form by clicking the send icon, which will take you to the email sending interface

## Managing Recipients

### Adding Recipients

1. Navigate to **Recipients** in the sidebar menu
2. Click the **Add Recipient** button
3. Fill in the recipient details:
   - **Name**: Full name of the recipient
   - **Email**: Email address of the recipient
   - **Phone**: Optional phone number
   - **Company**: Optional company or organization name
4. Click **Save** to add the recipient to the database

### Importing Recipients

1. From the Recipients page, click **Import Recipients**
2. Select an Excel (.xlsx) or CSV file containing recipient information
   - The file should have columns for Name, Email, and optionally Phone and Company
3. Click **Upload** to import the recipients
4. Review the import results and confirm the addition

### Managing Existing Recipients

From the Recipients page, you can:

- **Edit** recipient details by clicking the edit icon
- **Delete** a recipient by clicking the delete icon
- **View** a recipient's form history by clicking on their name

## Sending Forms

### Sending a Form to Recipients

1. Navigate to **Forms** and click the send icon next to the form you want to send
2. Alternatively, go to the **Tracking** page and click **Send New Form**
3. Select the form to send (if not already selected)
4. Select recipients from the list or use the search function to find specific recipients
5. Customize the email subject and body if needed
   - Use placeholders like {Name} to personalize the email
6. Click **Send** to send the form to all selected recipients

### Email Templates

You can create and manage email templates in the Settings section:

1. Navigate to **Settings** in the sidebar menu
2. Select the **Email Templates** tab
3. Customize the default subject, body, and signature
4. Click **Save Changes** to update the templates

## Tracking Forms

### Viewing Form Status

1. Navigate to **Tracking** in the sidebar menu
2. View the status of all sent forms, including:
   - Recipient information
   - Form name
   - Date sent
   - Email status (Sent, Failed)
   - Date received (if applicable)
   - Form status (Not Returned, Returned)
   - Processing status (Not Started, In Progress, Completed, Error)

### Checking for Returned Forms

1. From the Tracking page, click **Check for Returned Forms**
2. The system will connect to the email account and look for responses with attached forms
3. Any found forms will be downloaded and marked as returned in the tracking system
4. You'll see a summary of newly returned forms

### Generating Reports

1. From the Tracking page, click **Generate Report**
2. Select the report type and date range
3. Click **Generate** to create the report
4. Download or view the generated report

## Data Extraction

### Extracting Data from Returned Forms

1. Navigate to **Data Extraction** in the sidebar menu
2. You'll see a list of returned forms that are ready for data extraction
3. Select the forms you want to process or click **Extract All** to process all pending forms
4. Click **Start Extraction** to begin the process
5. The system will extract data from the selected PDF forms using various methods
6. Once complete, you'll see the extraction results and any errors that occurred

### Viewing Extracted Data

1. From the Data Extraction page, click the **Extracted Data** tab
2. View the list of forms with extracted data
3. Click on a form to view the detailed extracted information
4. You can edit any incorrect data manually if needed

### Exporting Data to Excel

1. From the Extracted Data tab, select the forms whose data you want to export
2. Click **Export to Excel**
3. Choose export options if prompted
4. Click **Export** to generate the Excel file
5. Download the Excel file when processing is complete

## SharePoint and OneDrive Integration

### Configuring Integration

1. Navigate to **Settings** in the sidebar menu
2. Select the **Integration** tab
3. Enter your Microsoft 365 credentials:
   - **Client ID**: Your Azure AD application client ID
   - **Client Secret**: Your Azure AD application client secret
   - **SharePoint Site**: Your SharePoint site URL (for SharePoint integration)
4. Click **Save Changes** to update the integration settings
5. Click **Test Connection** to verify the settings

### Uploading Files to SharePoint/OneDrive

1. From various pages in the application, you'll find options to upload files to SharePoint or OneDrive
2. Select the destination (SharePoint or OneDrive)
3. Choose the folder where you want to store the file
4. Click **Upload** to transfer the file

### Creating Backups

1. Navigate to **Settings** in the sidebar menu
2. Select the **Backup** tab
3. Click **Create Backup** to manually create a backup
4. Select the destination (SharePoint or OneDrive)
5. Choose the backup folder
6. Click **Start Backup** to begin the backup process
7. You can also enable automatic daily backups from this page

## User Management

### Managing Your Account

1. Click on your username in the top-right corner
2. Select **Profile** to view and edit your account information
3. You can change your name, email, phone number, and profile picture

### Changing Your Password

1. Navigate to **Settings** in the sidebar menu
2. Select the **Security** tab
3. Enter your current password
4. Enter and confirm your new password
5. Click **Change Password** to update your credentials

### Managing Users (Admin Only)

1. Navigate to **Settings** in the sidebar menu
2. Select the **Users** tab
3. View the list of all users in the system
4. Click **Add User** to create a new user account
5. Click the edit icon next to a user to modify their details or permissions
6. Click the delete icon to remove a user from the system

## Troubleshooting

### Common Issues and Solutions

1. **Login Issues**:
   - Ensure you're using the correct email and password
   - Check if your account has been locked or disabled
   - Try resetting your password

2. **Email Sending Failures**:
   - Verify Microsoft 365 integration settings
   - Check that recipient email addresses are valid
   - Ensure the form file exists and is accessible

3. **Data Extraction Problems**:
   - Make sure the PDF form is not password-protected
   - Check that the form is properly filled out
   - Try different extraction methods in the settings

4. **Integration Issues**:
   - Verify your Microsoft 365 credentials
   - Ensure your account has appropriate permissions
   - Check network connectivity to Microsoft services

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs (accessible to administrators)
2. Contact your system administrator
3. Refer to the technical documentation for advanced troubleshooting

## Best Practices

1. **Regular Backups**: Create regular backups of your data, especially before making significant changes
2. **Form Design**: Design forms with clear field labels to improve data extraction accuracy
3. **Recipient Management**: Keep your recipient database up-to-date to minimize email delivery issues
4. **Security**: Change default passwords immediately and use strong passwords
5. **Testing**: Test new forms with a small group before sending to all recipients

## Glossary

- **Form**: A PDF document that is sent to recipients for completion
- **Recipient**: A person who receives forms via email
- **Tracking**: The process of monitoring the status of sent forms
- **Data Extraction**: The process of extracting information from returned PDF forms
- **Integration**: Connection with external services like Microsoft 365, SharePoint, and OneDrive
