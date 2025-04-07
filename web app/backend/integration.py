import os
import sys
import json
from datetime import datetime

# Add parent directory to path to import existing scripts
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import existing functionality
from scripts.email_sender import EmailFormSender
from scripts.tracking_database import TrackingDatabase
from scripts.pdf_extractor import PDFDataExtractor, process_pdf_batch
from scripts.excel_transfer import process_extracted_data
from scripts.sharepoint_onedrive import SharePointOneDriveIntegration

class EmailFormSystemIntegration:
    """
    Integration class that connects the existing email form system functionality
    with the web application backend.
    """
    
    def __init__(self, config_path=None):
        """
        Initialize the integration with configuration.
        
        Args:
            config_path (str, optional): Path to configuration file
        """
        # Define paths
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.forms_dir = os.path.join(self.base_dir, 'forms')
        self.returned_forms_dir = os.path.join(self.data_dir, 'returned_forms')
        self.extracted_dir = os.path.join(self.data_dir, 'extracted')
        self.results_dir = os.path.join(self.data_dir, 'results')
        
        # Ensure directories exist
        for directory in [self.data_dir, self.forms_dir, self.returned_forms_dir, 
                         self.extracted_dir, self.results_dir]:
            os.makedirs(directory, exist_ok=True)
        
        # Load configuration
        self.config_path = config_path or os.path.join(self.data_dir, 'config.json')
        self.config = self.load_config()
        
        # Initialize components
        self.email_sender = None
        self.tracking_db = None
        self.sharepoint_onedrive = None
    
    def load_config(self):
        """
        Load configuration from file or create default.
        
        Returns:
            dict: Configuration dictionary
        """
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                return json.load(f)
        else:
            default_config = {
                'client_id': '',
                'client_secret': '',
                'sharepoint_site': '',
                'token_path': os.path.join(self.data_dir, 'o365_token'),
                'email_templates': {
                    'default_subject': 'Please complete the attached form',
                    'default_body': 'Hello {Name},\n\nPlease complete the attached form and return it at your earliest convenience.\n\nThank you.',
                    'signature': 'Best regards,\nAdmin User\nEmail Form System'
                }
            }
            with open(self.config_path, 'w') as f:
                json.dump(default_config, f, indent=4)
            return default_config
    
    def save_config(self):
        """Save configuration to file."""
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=4)
    
    def initialize_email_sender(self):
        """
        Initialize the email sender with Microsoft 365 credentials.
        
        Returns:
            bool: True if initialization successful, False otherwise
        """
        if not self.config.get('client_id') or not self.config.get('client_secret'):
            return False
        
        try:
            self.email_sender = EmailFormSender(
                self.config['client_id'], 
                self.config['client_secret']
            )
            return self.email_sender.authenticate()
        except Exception as e:
            print(f"Error initializing email sender: {e}")
            return False
    
    def initialize_tracking_db(self, tracking_file=None):
        """
        Initialize the tracking database.
        
        Args:
            tracking_file (str, optional): Path to tracking file
            
        Returns:
            bool: True if initialization successful, False otherwise
        """
        if not tracking_file:
            tracking_file = os.path.join(self.data_dir, 'tracking.xlsx')
        
        try:
            # Create tracking file if it doesn't exist
            if not os.path.exists(tracking_file):
                from scripts.create_sample_tracking import create_sample_tracking_spreadsheet
                create_sample_tracking_spreadsheet(tracking_file)
            
            self.tracking_db = TrackingDatabase(tracking_file)
            return True
        except Exception as e:
            print(f"Error initializing tracking database: {e}")
            return False
    
    def initialize_sharepoint_onedrive(self):
        """
        Initialize SharePoint/OneDrive integration.
        
        Returns:
            bool: True if initialization successful, False otherwise
        """
        if not self.config.get('client_id') or not self.config.get('client_secret'):
            return False
        
        try:
            self.sharepoint_onedrive = SharePointOneDriveIntegration(
                self.config['client_id'], 
                self.config['client_secret']
            )
            return self.sharepoint_onedrive.authenticate()
        except Exception as e:
            print(f"Error initializing SharePoint/OneDrive integration: {e}")
            return False
    
    def get_forms(self):
        """
        Get list of available forms.
        
        Returns:
            list: List of form dictionaries
        """
        forms = []
        for filename in os.listdir(self.forms_dir):
            if filename.endswith('.pdf'):
                form_path = os.path.join(self.forms_dir, filename)
                form_stat = os.stat(form_path)
                forms.append({
                    'id': len(forms) + 1,
                    'name': os.path.splitext(filename)[0],
                    'description': f"Form {len(forms) + 1}",
                    'createdAt': datetime.fromtimestamp(form_stat.st_ctime).strftime('%Y-%m-%d'),
                    'status': 'active',
                    'sentCount': 0,
                    'returnedCount': 0,
                    'path': form_path
                })
        
        return forms
    
    def get_recipients(self):
        """
        Get list of recipients from tracking database.
        
        Returns:
            list: List of recipient dictionaries
        """
        if not self.tracking_db:
            self.initialize_tracking_db()
        
        if self.tracking_db:
            try:
                return self.tracking_db.get_recipients()
            except Exception as e:
                print(f"Error getting recipients: {e}")
        
        # Return empty list if tracking database not available
        return []
    
    def add_recipient(self, name, email, phone=None):
        """
        Add a recipient to the tracking database.
        
        Args:
            name (str): Recipient name
            email (str): Recipient email
            phone (str, optional): Recipient phone number
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.tracking_db:
            self.initialize_tracking_db()
        
        if self.tracking_db:
            try:
                self.tracking_db.add_recipients([{
                    'Name': name,
                    'Email': email,
                    'Phone': phone or ''
                }])
                return True
            except Exception as e:
                print(f"Error adding recipient: {e}")
        
        return False
    
    def import_recipients(self, file_path):
        """
        Import recipients from file.
        
        Args:
            file_path (str): Path to import file (Excel or CSV)
            
        Returns:
            int: Number of recipients imported, -1 if error
        """
        if not self.tracking_db:
            self.initialize_tracking_db()
        
        if self.tracking_db:
            try:
                return self.tracking_db.import_recipients(file_path)
            except Exception as e:
                print(f"Error importing recipients: {e}")
        
        return -1
    
    def send_form_emails(self, form_id, recipient_ids, subject=None, body=None):
        """
        Send form emails to selected recipients.
        
        Args:
            form_id (int): Form ID
            recipient_ids (list): List of recipient IDs
            subject (str, optional): Email subject
            body (str, optional): Email body
            
        Returns:
            dict: Result dictionary with sent and failed counts
        """
        if not self.email_sender:
            if not self.initialize_email_sender():
                return {'sent': 0, 'failed': len(recipient_ids), 'error': 'Email sender not initialized'}
        
        if not self.tracking_db:
            self.initialize_tracking_db()
        
        # Get form path
        forms = self.get_forms()
        form_path = None
        for form in forms:
            if form['id'] == form_id:
                form_path = form['path']
                break
        
        if not form_path:
            return {'sent': 0, 'failed': len(recipient_ids), 'error': 'Form not found'}
        
        # Get recipients
        all_recipients = self.get_recipients()
        selected_recipients = []
        for recipient in all_recipients:
            if recipient['id'] in recipient_ids:
                selected_recipients.append(recipient)
        
        if not selected_recipients:
            return {'sent': 0, 'failed': len(recipient_ids), 'error': 'No recipients found'}
        
        # Use default templates if not provided
        if not subject:
            subject = self.config['email_templates']['default_subject']
        
        if not body:
            body = self.config['email_templates']['default_body']
        
        # Add signature
        if self.config['email_templates'].get('signature'):
            body += f"\n\n{self.config['email_templates']['signature']}"
        
        # Send emails
        try:
            tracking_file = os.path.join(self.data_dir, 'tracking.xlsx')
            result = self.email_sender.send_form_emails_to_recipients(
                selected_recipients,
                subject,
                body,
                form_path,
                tracking_file
            )
            return result
        except Exception as e:
            print(f"Error sending emails: {e}")
            return {'sent': 0, 'failed': len(recipient_ids), 'error': str(e)}
    
    def check_for_returned_forms(self):
        """
        Check for returned forms in email.
        
        Returns:
            dict: Result dictionary with found forms
        """
        if not self.email_sender:
            if not self.initialize_email_sender():
                return {'found': 0, 'forms': [], 'error': 'Email sender not initialized'}
        
        try:
            tracking_file = os.path.join(self.data_dir, 'tracking.xlsx')
            result = self.email_sender.check_for_responses(tracking_file, self.returned_forms_dir)
            return result
        except Exception as e:
            print(f"Error checking for returned forms: {e}")
            return {'found': 0, 'forms': [], 'error': str(e)}
    
    def get_tracking_data(self):
        """
        Get tracking data.
        
        Returns:
            list: List of tracking data dictionaries
        """
        if not self.tracking_db:
            self.initialize_tracking_db()
        
        if self.tracking_db:
            try:
                return self.tracking_db.get_tracking_data()
            except Exception as e:
                print(f"Error getting tracking data: {e}")
        
        # Return empty list if tracking database not available
        return []
    
    def generate_tracking_report(self, output_path=None):
        """
        Generate tracking report.
        
        Args:
            output_path (str, optional): Path to save report
            
        Returns:
            str: Report content, None if error
        """
        if not self.tracking_db:
            self.initialize_tracking_db()
        
        if not output_path:
            output_path = os.path.join(self.data_dir, 'tracking_report.md')
        
        if self.tracking_db:
            try:
                self.tracking_db.generate_status_report(output_path)
                
                if os.path.exists(output_path):
                    with open(output_path, 'r') as f:
                        return f.read()
            except Exception as e:
                print(f"Error generating tracking report: {e}")
        
        return None
    
    def extract_data_from_forms(self, form_ids=None):
        """
        Extract data from returned forms.
        
        Args:
            form_ids (list, optional): List of form IDs to process
            
        Returns:
            dict: Result dictionary with processed, success, and failed counts
        """
        try:
            # Make sure directories exist
            os.makedirs(self.returned_forms_dir, exist_ok=True)
            os.makedirs(self.extracted_dir, exist_ok=True)
            
            if not form_ids:
                # Process all PDFs in the returned forms directory
                result = process_pdf_batch(self.returned_forms_dir, self.extracted_dir)
                return result
            else:
                # Process specific forms
                if not self.tracking_db:
                    self.initialize_tracking_db()
                
                tracking_data = self.get_tracking_data()
                
                # Filter forms by ID
                forms_to_process = []
                for item in tracking_data:
                    if item.get('id') in form_ids and item.get('formPath'):
                        forms_to_process.append(item.get('formPath'))
                
                # Process each form
                processed = 0
                success = 0
                failed = 0
                
                for form_path in forms_to_process:
                    if os.path.exists(form_path):
                        try:
                            extractor = PDFDataExtractor(form_path)
                            data = extractor.extract_all_data()
                            
                            # Save extracted data
                            filename = os.path.splitext(os.path.basename(form_path))[0]
                            output_path = os.path.join(self.extracted_dir, f"{filename}_data.json")
                            extractor.save_extracted_data(output_path, data)
                            
                            processed += 1
                            success += 1
                            
                            # Update tracking database
                            self.tracking_db.update_processing_status(form_path, 'Completed')
                        except Exception as e:
                            print(f"Error processing {form_path}: {e}")
                            failed += 1
                            # Update tracking database
                            self.tracking_db.update_processing_status(form_path, 'Error')
                
                return {
                    'processed': processed,
                    'success': success,
                    'failed': failed
                }
        except Exception as e:
            print(f"Error extracting data: {e}")
            return {
                'processed': 0,
                'success': 0,
                'failed': 0,
                'error': str(e)
            }
    
    def get_extracted_data(self):
        """
        Get extracted data from files.
        
        Returns:
            list: List of extracted data dictionaries
        """
        extracted_data = []
        if os.path.exists(self.extracted_dir):
            for filename in os.listdir(self.extracted_dir):
                if filename.endswith('.json'):
                    try:
                        with open(os.path.join(self.extracted_dir, filename), 'r') as f:
                            data = json.load(f)
                            extracted_data.append({
                                'id': len(extracted_data) + 1,
                                'formName': os.path.splitext(os.path.basename(data.get('metadata', {}).get('filename', 'Unknown')))[0],
                                'recipient': data.get('extracted_data', {}).get('name', 'Unknown'),
                                'email': data.get('extracted_data', {}).get('email', 'unknown@example.com'),
                                'extractionDate': datetime.fromtimestamp(os.path.getmtime(os.path.join(self.extracted_dir, filename))).strftime('%Y-%m-%d %H:%M:%S'),
                                'extractionMethod': ','.join(data.get('metadata', {}).get('extraction_methods', [])),
                                'fields': data.get('extracted_data', {})
                            })
                    except Exception as e:
                        print(f"Error loading extracted data from {filename}: {e}")
        
        return extracted_data
    
    def export_data_to_excel(self, data_ids=None, output_file=None):
        """
        Export extracted data to Excel.
        
        Args:
            data_ids (list, optional): List of data IDs to export
            output_file (str, optional): Path to save Excel file
            
        Returns:
            str: Path to exported file, None if error
        """
        try:
            # Create output directory
            os.makedirs(self.results_dir, exist_ok=True)
            
            # Generate timestamp for filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            if not output_file:
                output_file = os.path.join(self.results_dir, f"form_data_{timestamp}.xlsx")
            
            tracking_file = os.path.join(self.data_dir, 'tracking.xlsx')
            
            if not data_ids:
                # Export all extracted data
                if os.path.exists(self.extracted_dir):
                    # Process all JSON files in the extracted directory
                    result_file = process_extracted_data(self.extracted_dir, output_file, tracking_file)
                    return result_file
                else:
                    return None
            else:
                # Export specific data files
                # Get extracted data
                extracted_data = self.get_extracted_data()
                
                # Filter by ID
                files_to_export = []
                for data in extracted_data:
                    if data['id'] in data_ids:
                        # Find the corresponding file
                        for filename in os.listdir(self.extracted_dir):
                            if filename.endswith('.json'):
                                with open(os.path.join(self.extracted_dir, filename), 'r') as f:
                                    file_data = json.load(f)
                                    if (file_data.get('extracted_data', {}).get('name') == data['recipient'] and
                                        file_data.get('extracted_data', {}).get('email') == data['email']):
                                        files_to_export.append(os.path.join(self.extracted_dir, filename))
                                        break
                
                if files_to_export:
                    # Create a temporary directory for selected files
                    import tempfile
                    import shutil
                    
                    temp_dir = tempfile.mkdtemp()
                    try:
                        # Copy selected files to temp directory
                        for file_path in files_to_export:
                            shutil.copy(file_path, temp_dir)
                        
                        # Process the files
                        result_file = process_extracted_data(temp_dir, output_file, tracking_file)
                        
                        # Clean up
                        shutil.rmtree(temp_dir)
                        
                        return result_file
                    except Exception as e:
                        # Clean up
                        shutil.rmtree(temp_dir)
                        raise e
                else:
                    return None
        except Exception as e:
            print(f"Error exporting data: {e}")
            return None
    
    def upload_to_cloud_storage(self, file_path, destination='onedrive', folder='EmailFormSystem'):
        """
        Upload file to cloud storage.
        
        Args:
            file_path (str): Path to file
            destination (str, optional): 'onedrive' or 'sharepoint'
            folder (str, optional): Folder path in destination
            
        Returns:
            str: URL to uploaded file, None if error
        """
        if not self.sharepoint_onedrive:
            if not self.initialize_sharepoint_onedrive():
                return None
        
        try:
            if destination.lower() == 'sharepoint':
                if self.sharepoint_onedrive.connect_to_sharepoint(self.config['sharepoint_site']):
                    url = self.sharepoint_onedrive.upload_file_to_sharepoint(file_path, folder)
                    return url
                else:
                    return None
            else:  # onedrive
                if self.sharepoint_onedrive.connect_to_onedrive():
                    url = self.sharepoint_onedrive.upload_file_to_onedrive(file_path, folder)
                    return url
                else:
                    return None
        except Exception as e:
            print(f"Error uploading to cloud storage: {e}")
            return None
    
    def create_backup(self, destination='onedrive', folder='EmailFormBackup'):
        """
        Create backup of data directory.
        
        Args:
            destination (str, optional): 'onedrive' or 'sharepoint'
            folder (str, optional): Folder path in destination
            
        Returns:
            dict: Result dictionary with uploaded files and total size
        """
        if not self.sharepoint_onedrive:
            if not self.initialize_sharepoint_onedrive():
                return {'uploaded_files': 0, 'total_size': 0, 'error': 'SharePoint/OneDrive not initialized'}
        
        try:
            if destination.lower() == 'sharepoint':
                if self.sharepoint_onedrive.connect_to_sharepoint(self.config['sharepoint_site']):
                    result = self.sharepoint_onedrive.create_backup(self.data_dir, destination='sharepoint', folder=folder)
                    return result
                else:
                    return {'uploaded_files': 0, 'total_size': 0, 'error': 'Failed to connect to SharePoint'}
            else:  # onedrive
                if self.sharepoint_onedrive.connect_to_onedrive():
                    result = self.sharepoint_onedrive.create_backup(self.data_dir, destination='onedrive', folder=folder)
                    return result
                else:
                    return {'uploaded_files': 0, 'total_size': 0, 'error': 'Failed to connect to OneDrive'}
        except Exception as e:
            print(f"Error creating backup: {e}")
            return {'uploaded_files': 0, 'total_size': 0, 'error': str(e)}
