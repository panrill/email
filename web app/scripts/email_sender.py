#!/usr/bin/env python3
"""
Email Form Sender Script

This script sends emails with PDF form attachments to multiple recipients
and updates a tracking spreadsheet with the sent status.
"""

import os
import sys
import datetime
import pandas as pd
from O365 import Account, FileSystemTokenBackend
from O365.message import Message, MessageAttachment

class EmailFormSender:
    def __init__(self, client_id, client_secret, token_path='./o365_token'):
        """
        Initialize the EmailFormSender with Microsoft 365 credentials.
        
        Args:
            client_id (str): Microsoft 365 application client ID
            client_secret (str): Microsoft 365 application client secret
            token_path (str): Path to store authentication tokens
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_path = token_path
        
        # Ensure token directory exists
        os.makedirs(os.path.dirname(token_path), exist_ok=True)
        
        # Set up authentication with Microsoft 365
        self.token_backend = FileSystemTokenBackend(token_path=token_path)
        self.account = Account((client_id, client_secret), token_backend=self.token_backend)
        
        # Define required scopes for email and SharePoint access
        self.scopes = ['offline_access', 'message_all', 'mail.readwrite', 'mail.send', 
                       'files.readwrite.all', 'sites.readwrite.all']
    
    def authenticate(self):
        """
        Authenticate with Microsoft 365 and request necessary permissions.
        
        Returns:
            bool: True if authentication is successful, False otherwise
        """
        if not self.account.is_authenticated:
            # Initiate authentication flow
            result = self.account.authenticate(scopes=self.scopes)
            return result
        return True
    
    def send_form_emails(self, recipients_file, email_subject, email_body, form_path):
        """
        Send emails with form attachments to multiple recipients.
        
        Args:
            recipients_file (str): Path to Excel file with recipient information
            email_subject (str): Subject line for the email
            email_body (str): Body text for the email
            form_path (str): Path to the PDF form to attach
            
        Returns:
            pd.DataFrame: Updated tracking dataframe with sent status
        """
        # Check if form file exists
        if not os.path.exists(form_path):
            raise FileNotFoundError(f"Form file not found: {form_path}")
        
        # Load recipients from Excel file
        try:
            tracking_df = pd.read_excel(recipients_file)
            required_columns = ['Name', 'Email']
            if not all(col in tracking_df.columns for col in required_columns):
                raise ValueError(f"Recipients file must contain columns: {required_columns}")
        except Exception as e:
            raise Exception(f"Error loading recipients file: {e}")
        
        # Add tracking columns if they don't exist
        if 'Date Sent' not in tracking_df.columns:
            tracking_df['Date Sent'] = None
        if 'Email Status' not in tracking_df.columns:
            tracking_df['Email Status'] = 'Not Sent'
        if 'Form Status' not in tracking_df.columns:
            tracking_df['Form Status'] = 'Not Returned'
        
        # Get the mailbox
        mailbox = self.account.mailbox()
        
        # Process each recipient
        for index, recipient in tracking_df.iterrows():
            if pd.notna(recipient['Email']) and recipient['Email'].strip():
                try:
                    # Create a new message
                    message = Message(parent=mailbox)
                    message.subject = email_subject
                    message.body = email_body.replace('{Name}', recipient['Name'])
                    message.to.add(recipient['Email'])
                    
                    # Attach the form
                    with open(form_path, 'rb') as form_file:
                        form_content = form_file.read()
                    form_name = os.path.basename(form_path)
                    message.attachments.add((form_name, form_content))
                    
                    # Send the message
                    if message.send():
                        # Update tracking information
                        tracking_df.at[index, 'Date Sent'] = datetime.datetime.now()
                        tracking_df.at[index, 'Email Status'] = 'Sent'
                        print(f"Email sent to {recipient['Name']} ({recipient['Email']})")
                    else:
                        tracking_df.at[index, 'Email Status'] = 'Failed'
                        print(f"Failed to send email to {recipient['Name']} ({recipient['Email']})")
                
                except Exception as e:
                    tracking_df.at[index, 'Email Status'] = 'Error'
                    print(f"Error sending email to {recipient['Email']}: {e}")
        
        # Save updated tracking information
        tracking_df.to_excel(recipients_file, index=False)
        return tracking_df
    
    def check_for_responses(self, tracking_file, download_folder, form_keyword='form'):
        """
        Check email inbox for responses with form attachments.
        
        Args:
            tracking_file (str): Path to Excel file with tracking information
            download_folder (str): Folder to save downloaded form attachments
            form_keyword (str): Keyword to identify form attachments
            
        Returns:
            pd.DataFrame: Updated tracking dataframe with received status
        """
        # Ensure download folder exists
        os.makedirs(download_folder, exist_ok=True)
        
        # Load tracking information
        tracking_df = pd.read_excel(tracking_file)
        
        # Add tracking columns if they don't exist
        if 'Date Received' not in tracking_df.columns:
            tracking_df['Date Received'] = None
        if 'Form Path' not in tracking_df.columns:
            tracking_df['Form Path'] = None
        
        # Get the mailbox and inbox folder
        mailbox = self.account.mailbox()
        inbox = mailbox.inbox_folder()
        
        # Get unread messages
        messages = inbox.get_messages(limit=50)
        
        # Process each message
        for message in messages:
            # Check if this is a response from a tracked recipient
            sender_email = message.sender.address
            recipient_idx = tracking_df[tracking_df['Email'] == sender_email].index
            
            if len(recipient_idx) > 0 and tracking_df.loc[recipient_idx[0], 'Form Status'] == 'Not Returned':
                # Check for PDF attachments
                for attachment in message.attachments:
                    if attachment.is_pdf or form_keyword.lower() in attachment.name.lower():
                        # Download the attachment
                        attachment_content = attachment.content
                        file_name = f"{tracking_df.loc[recipient_idx[0], 'Name']}_{attachment.name}"
                        file_path = os.path.join(download_folder, file_name)
                        
                        with open(file_path, 'wb') as f:
                            f.write(attachment_content)
                        
                        # Update tracking information
                        tracking_df.loc[recipient_idx[0], 'Date Received'] = message.received.strftime('%Y-%m-%d %H:%M:%S')
                        tracking_df.loc[recipient_idx[0], 'Form Status'] = 'Returned'
                        tracking_df.loc[recipient_idx[0], 'Form Path'] = file_path
                        
                        print(f"Received form from {tracking_df.loc[recipient_idx[0], 'Name']} ({sender_email})")
                        
                        # Mark message as read
                        message.mark_as_read()
        
        # Save updated tracking information
        tracking_df.to_excel(tracking_file, index=False)
        return tracking_df

def create_tracking_spreadsheet(output_file, recipients_list=None):
    """
    Create or update a tracking spreadsheet for email form distribution.
    
    Args:
        output_file (str): Path to save the tracking spreadsheet
        recipients_list (list): Optional list of dictionaries with recipient information
        
    Returns:
        str: Path to the created spreadsheet
    """
    # Create a new dataframe or load existing one
    if os.path.exists(output_file):
        tracking_df = pd.read_excel(output_file)
    else:
        # Create a new tracking dataframe with required columns
        tracking_df = pd.DataFrame(columns=[
            'Name', 'Email', 'Date Sent', 'Email Status', 
            'Date Received', 'Form Status', 'Form Path', 'Processing Status'
        ])
    
    # Add new recipients if provided
    if recipients_list:
        new_records = []
        for recipient in recipients_list:
            # Check if recipient already exists
            if 'Email' in recipient and not tracking_df[tracking_df['Email'] == recipient['Email']].shape[0]:
                new_record = {
                    'Name': recipient.get('Name', ''),
                    'Email': recipient.get('Email', ''),
                    'Email Status': 'Not Sent',
                    'Form Status': 'Not Returned',
                    'Processing Status': 'Not Started'
                }
                new_records.append(new_record)
        
        # Append new records to the dataframe
        if new_records:
            new_df = pd.DataFrame(new_records)
            tracking_df = pd.concat([tracking_df, new_df], ignore_index=True)
    
    # Save the tracking spreadsheet
    tracking_df.to_excel(output_file, index=False)
    return output_file

if __name__ == "__main__":
    print("Email Form Sender - Use this module by importing it in your main script")
    print("Example usage:")
    print("  from email_sender import EmailFormSender, create_tracking_spreadsheet")
    print("  sender = EmailFormSender('your_client_id', 'your_client_secret')")
    print("  sender.authenticate()")
    print("  sender.send_form_emails('recipients.xlsx', 'Form Request', 'Please fill out the attached form', 'form.pdf')")
