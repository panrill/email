#!/usr/bin/env python3
"""
Email Form System - Main Script

This script integrates all components of the email form system:
- Email sending and tracking
- Form status monitoring
- SharePoint/OneDrive integration

Usage:
    python main.py [command] [options]

Commands:
    setup       - Set up Microsoft 365 authentication and create tracking database
    send        - Send forms to recipients in tracking spreadsheet
    check       - Check for returned forms and update tracking
    report      - Generate status report
    help        - Show this help message
"""

import os
import sys
import argparse
import datetime
from email_sender import EmailFormSender
from tracking_database import TrackingDatabase
from create_sample_tracking import create_sample_tracking_spreadsheet

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
LOGS_DIR = os.path.join(os.path.dirname(BASE_DIR), 'logs')
FORMS_DIR = os.path.join(os.path.dirname(BASE_DIR), 'forms')
RETURNED_FORMS_DIR = os.path.join(DATA_DIR, 'returned_forms')

# Ensure directories exist
for directory in [DATA_DIR, LOGS_DIR, FORMS_DIR, RETURNED_FORMS_DIR]:
    os.makedirs(directory, exist_ok=True)

# Default tracking file
DEFAULT_TRACKING_FILE = os.path.join(DATA_DIR, 'tracking.xlsx')

def setup_authentication(args):
    """
    Set up Microsoft 365 authentication and create tracking database.
    """
    print("Setting up Microsoft 365 authentication...")
    
    # Get client credentials
    client_id = args.client_id or input("Enter your Microsoft 365 application client ID: ")
    client_secret = args.client_secret or input("Enter your Microsoft 365 application client secret: ")
    
    # Initialize the email sender
    sender = EmailFormSender(client_id, client_secret, token_path=os.path.join(DATA_DIR, 'o365_token'))
    
    # Authenticate
    if sender.authenticate():
        print("Authentication successful!")
    else:
        print("Authentication failed. Please check your credentials and try again.")
        return False
    
    # Create tracking database
    if args.sample:
        print("Creating sample tracking spreadsheet...")
        create_sample_tracking_spreadsheet(DEFAULT_TRACKING_FILE)
    else:
        print("Creating tracking database...")
        db = TrackingDatabase(DEFAULT_TRACKING_FILE)
    
    print(f"Setup complete. Tracking database created at {DEFAULT_TRACKING_FILE}")
    return True

def send_forms(args):
    """
    Send forms to recipients in tracking spreadsheet.
    """
    print("Sending forms to recipients...")
    
    # Validate form file
    form_path = args.form
    if not os.path.exists(form_path):
        print(f"Error: Form file not found: {form_path}")
        return False
    
    # Get tracking file
    tracking_file = args.tracking or DEFAULT_TRACKING_FILE
    if not os.path.exists(tracking_file):
        print(f"Error: Tracking file not found: {tracking_file}")
        return False
    
    # Get client credentials
    client_id = args.client_id or input("Enter your Microsoft 365 application client ID: ")
    client_secret = args.client_secret or input("Enter your Microsoft 365 application client secret: ")
    
    # Initialize the email sender
    sender = EmailFormSender(client_id, client_secret, token_path=os.path.join(DATA_DIR, 'o365_token'))
    
    # Authenticate
    if not sender.authenticate():
        print("Authentication failed. Please check your credentials and try again.")
        return False
    
    # Get email content
    subject = args.subject or "Please complete the attached form"
    body = args.body or "Hello {Name},\n\nPlease complete the attached form and return it at your earliest convenience.\n\nThank you."
    
    # Send forms
    try:
        updated_df = sender.send_form_emails(tracking_file, subject, body, form_path)
        print(f"Emails sent. Tracking file updated: {tracking_file}")
        
        # Generate log
        log_file = os.path.join(LOGS_DIR, f"send_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        with open(log_file, 'w') as f:
            f.write(f"Email sending log - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Form: {form_path}\n")
            f.write(f"Subject: {subject}\n\n")
            
            sent_count = len(updated_df[updated_df['Email Status'] == 'Sent'])
            failed_count = len(updated_df[updated_df['Email Status'] == 'Failed'])
            error_count = len(updated_df[updated_df['Email Status'] == 'Error'])
            
            f.write(f"Total recipients: {len(updated_df)}\n")
            f.write(f"Sent: {sent_count}\n")
            f.write(f"Failed: {failed_count}\n")
            f.write(f"Errors: {error_count}\n")
        
        print(f"Log file created: {log_file}")
        return True
    
    except Exception as e:
        print(f"Error sending forms: {e}")
        return False

def check_responses(args):
    """
    Check for returned forms and update tracking.
    """
    print("Checking for returned forms...")
    
    # Get tracking file
    tracking_file = args.tracking or DEFAULT_TRACKING_FILE
    if not os.path.exists(tracking_file):
        print(f"Error: Tracking file not found: {tracking_file}")
        return False
    
    # Get client credentials
    client_id = args.client_id or input("Enter your Microsoft 365 application client ID: ")
    client_secret = args.client_secret or input("Enter your Microsoft 365 application client secret: ")
    
    # Initialize the email sender
    sender = EmailFormSender(client_id, client_secret, token_path=os.path.join(DATA_DIR, 'o365_token'))
    
    # Authenticate
    if not sender.authenticate():
        print("Authentication failed. Please check your credentials and try again.")
        return False
    
    # Check for responses
    try:
        form_keyword = args.keyword or "form"
        updated_df = sender.check_for_responses(tracking_file, RETURNED_FORMS_DIR, form_keyword)
        
        # Count returned forms
        returned_count = len(updated_df[updated_df['Form Status'] == 'Returned'])
        new_returns = len(updated_df[(updated_df['Form Status'] == 'Returned') & 
                                     (updated_df['Processing Status'] == 'Not Started')])
        
        print(f"Check complete. {returned_count} forms returned, {new_returns} new returns.")
        
        # Generate log
        log_file = os.path.join(LOGS_DIR, f"check_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        with open(log_file, 'w') as f:
            f.write(f"Form check log - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"Total recipients: {len(updated_df)}\n")
            f.write(f"Forms returned: {returned_count}\n")
            f.write(f"New returns: {new_returns}\n")
            
            if new_returns > 0:
                f.write("\nNew returned forms:\n")
                new_returns_df = updated_df[(updated_df['Form Status'] == 'Returned') & 
                                           (updated_df['Processing Status'] == 'Not Started')]
                for _, row in new_returns_df.iterrows():
                    f.write(f"- {row['Name']} ({row['Email']}): {row['Form Path']}\n")
        
        print(f"Log file created: {log_file}")
        return True
    
    except Exception as e:
        print(f"Error checking responses: {e}")
        return False

def generate_report(args):
    """
    Generate status report.
    """
    print("Generating status report...")
    
    # Get tracking file
    tracking_file = args.tracking or DEFAULT_TRACKING_FILE
    if not os.path.exists(tracking_file):
        print(f"Error: Tracking file not found: {tracking_file}")
        return False
    
    # Initialize tracking database
    db = TrackingDatabase(tracking_file)
    
    # Generate report
    report_file = os.path.join(LOGS_DIR, f"status_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
    report = db.generate_status_report(report_file)
    
    # Print report summary
    print("\nStatus Report Summary:")
    for key, value in report.items():
        print(f"  {key}: {value}")
    
    print(f"\nDetailed report saved to: {report_file}")
    return True

def main():
    """
    Main entry point for the script.
    """
    # Create argument parser
    parser = argparse.ArgumentParser(description="Email Form System")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Setup command
    setup_parser = subparsers.add_parser("setup", help="Set up Microsoft 365 authentication and create tracking database")
    setup_parser.add_argument("--client-id", help="Microsoft 365 application client ID")
    setup_parser.add_argument("--client-secret", help="Microsoft 365 application client secret")
    setup_parser.add_argument("--sample", action="store_true", help="Create sample tracking spreadsheet")
    
    # Send command
    send_parser = subparsers.add_parser("send", help="Send forms to recipients in tracking spreadsheet")
    send_parser.add_argument("--tracking", help="Path to tracking spreadsheet")
    send_parser.add_argument("--form", required=True, help="Path to form PDF file")
    send_parser.add_argument("--subject", help="Email subject")
    send_parser.add_argument("--body", help="Email body text")
    send_parser.add_argument("--client-id", help="Microsoft 365 application client ID")
    send_parser.add_argument("--client-secret", help="Microsoft 365 application client secret")
    
    # Check command
    check_parser = subparsers.add_parser("check", help="Check for returned forms and update tracking")
    check_parser.add_argument("--tracking", help="Path to tracking spreadsheet")
    check_parser.add_argument("--keyword", help="Keyword to identify form attachments")
    check_parser.add_argument("--client-id", help="Microsoft 365 application client ID")
    check_parser.add_argument("--client-secret", help="Microsoft 365 application client secret")
    
    # Report command
    report_parser = subparsers.add_parser("report", help="Generate status report")
    report_parser.add_argument("--tracking", help="Path to tracking spreadsheet")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Execute command
    if args.command == "setup":
        setup_authentication(args)
    elif args.command == "send":
        send_forms(args)
    elif args.command == "check":
        check_responses(args)
    elif args.command == "report":
        generate_report(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
