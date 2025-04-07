#!/usr/bin/env python3
"""
Integration Test Script

This script tests the complete workflow of the email form system:
1. Setting up the environment
2. Creating a sample form
3. Creating a tracking spreadsheet
4. Simulating form return and processing
5. Uploading results to cloud storage
"""

import os
import sys
import json
import shutil
import argparse
from datetime import datetime

# Add scripts directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import system modules
from create_sample_form import create_sample_form
from create_sample_tracking import create_sample_tracking_spreadsheet
from tracking_database import TrackingDatabase
from pdf_extractor import PDFDataExtractor, process_pdf_batch
from excel_transfer import process_extracted_data
from sharepoint_onedrive import SharePointOneDriveIntegration

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, 'data')
FORMS_DIR = os.path.join(PROJECT_DIR, 'forms')
RETURNED_FORMS_DIR = os.path.join(DATA_DIR, 'returned_forms')
EXTRACTED_DIR = os.path.join(DATA_DIR, 'extracted')
RESULTS_DIR = os.path.join(DATA_DIR, 'results')

def setup_test_environment():
    """
    Set up the test environment by creating necessary directories.
    
    Returns:
        bool: True if setup is successful, False otherwise
    """
    try:
        # Create directories
        for directory in [DATA_DIR, FORMS_DIR, RETURNED_FORMS_DIR, EXTRACTED_DIR, RESULTS_DIR]:
            os.makedirs(directory, exist_ok=True)
        
        print("Test environment set up successfully")
        return True
    
    except Exception as e:
        print(f"Error setting up test environment: {e}")
        return False

def create_test_assets():
    """
    Create test assets for the workflow test.
    
    Returns:
        dict: Dictionary with paths to created assets
    """
    assets = {}
    
    try:
        # Create sample form
        form_path = os.path.join(FORMS_DIR, 'test_form.pdf')
        create_sample_form(form_path)
        assets['form'] = form_path
        print(f"Created sample form: {form_path}")
        
        # Create tracking spreadsheet
        tracking_path = os.path.join(DATA_DIR, 'test_tracking.xlsx')
        create_sample_tracking_spreadsheet(tracking_path)
        assets['tracking'] = tracking_path
        print(f"Created tracking spreadsheet: {tracking_path}")
        
        # Create a copy of the form as a "returned" form
        returned_form_path = os.path.join(RETURNED_FORMS_DIR, 'John_Smith_test_form.pdf')
        shutil.copy(form_path, returned_form_path)
        assets['returned_form'] = returned_form_path
        print(f"Created returned form: {returned_form_path}")
        
        # Update tracking database
        db = TrackingDatabase(tracking_path)
        db.update_email_status('john.smith@example.com', 'Sent', datetime.now())
        db.update_form_status('john.smith@example.com', 'Returned', returned_form_path, datetime.now())
        print("Updated tracking database with test data")
        
        return assets
    
    except Exception as e:
        print(f"Error creating test assets: {e}")
        return {}

def test_pdf_extraction(assets):
    """
    Test PDF data extraction functionality.
    
    Args:
        assets (dict): Dictionary with paths to test assets
        
    Returns:
        dict: Dictionary with paths to extracted data
    """
    results = {}
    
    try:
        # Extract data from returned form
        extractor = PDFDataExtractor(assets['returned_form'])
        data = extractor.extract_all_data()
        
        # Save extracted data
        extracted_file = os.path.join(EXTRACTED_DIR, 'test_extracted_data.json')
        extractor.save_extracted_data(extracted_file, data)
        results['extracted_data'] = extracted_file
        print(f"Extracted data saved to: {extracted_file}")
        
        # Process batch of forms
        process_pdf_batch(RETURNED_FORMS_DIR, EXTRACTED_DIR)
        results['batch_data'] = os.path.join(EXTRACTED_DIR, 'combined_data.xlsx')
        print(f"Batch processing completed")
        
        return results
    
    except Exception as e:
        print(f"Error testing PDF extraction: {e}")
        return {}

def test_excel_transfer(assets, extraction_results):
    """
    Test Excel data transfer functionality.
    
    Args:
        assets (dict): Dictionary with paths to test assets
        extraction_results (dict): Dictionary with paths to extracted data
        
    Returns:
        dict: Dictionary with paths to Excel results
    """
    results = {}
    
    try:
        # Process extracted data
        excel_file = os.path.join(RESULTS_DIR, 'test_form_data.xlsx')
        result_file = process_extracted_data(extraction_results['extracted_data'], excel_file, assets['tracking'])
        results['excel_file'] = result_file
        print(f"Data transferred to Excel: {result_file}")
        
        return results
    
    except Exception as e:
        print(f"Error testing Excel transfer: {e}")
        return {}

def test_cloud_storage(assets, excel_results, client_id=None, client_secret=None):
    """
    Test cloud storage integration.
    
    Args:
        assets (dict): Dictionary with paths to test assets
        excel_results (dict): Dictionary with paths to Excel results
        client_id (str, optional): Microsoft 365 application client ID
        client_secret (str, optional): Microsoft 365 application client secret
        
    Returns:
        dict: Dictionary with cloud storage results
    """
    results = {}
    
    # Skip if credentials not provided
    if not client_id or not client_secret:
        print("Skipping cloud storage test (credentials not provided)")
        return results
    
    try:
        # Initialize integration
        integration = SharePointOneDriveIntegration(client_id, client_secret)
        
        # Authenticate
        if not integration.authenticate():
            print("Authentication failed")
            return results
        
        # Connect to OneDrive
        if not integration.connect_to_onedrive():
            print("Failed to connect to OneDrive")
            return results
        
        # Upload tracking spreadsheet
        tracking_url = integration.upload_file_to_onedrive(assets['tracking'], 'EmailFormSystem')
        results['tracking_url'] = tracking_url
        print(f"Tracking spreadsheet uploaded: {tracking_url}")
        
        # Upload Excel results
        if 'excel_file' in excel_results:
            excel_url = integration.upload_file_to_onedrive(excel_results['excel_file'], 'EmailFormSystem/Results')
            results['excel_url'] = excel_url
            print(f"Excel results uploaded: {excel_url}")
        
        # Create backup of data directory
        backup_results = integration.create_backup(DATA_DIR)
        results['backup'] = backup_results
        print(f"Data directory backup created: {backup_results['uploaded_files']} files uploaded")
        
        return results
    
    except Exception as e:
        print(f"Error testing cloud storage: {e}")
        return {}

def run_complete_workflow_test(client_id=None, client_secret=None):
    """
    Run a complete workflow test of the email form system.
    
    Args:
        client_id (str, optional): Microsoft 365 application client ID
        client_secret (str, optional): Microsoft 365 application client secret
        
    Returns:
        dict: Dictionary with test results
    """
    results = {
        'setup': False,
        'assets': {},
        'extraction': {},
        'excel': {},
        'cloud': {}
    }
    
    # Step 1: Set up test environment
    if not setup_test_environment():
        return results
    results['setup'] = True
    
    # Step 2: Create test assets
    assets = create_test_assets()
    if not assets:
        return results
    results['assets'] = assets
    
    # Step 3: Test PDF extraction
    extraction_results = test_pdf_extraction(assets)
    if not extraction_results:
        return results
    results['extraction'] = extraction_results
    
    # Step 4: Test Excel transfer
    excel_results = test_excel_transfer(assets, extraction_results)
    if not excel_results:
        return results
    results['excel'] = excel_results
    
    # Step 5: Test cloud storage
    cloud_results = test_cloud_storage(assets, excel_results, client_id, client_secret)
    results['cloud'] = cloud_results
    
    # Print summary
    print("\nWorkflow Test Summary:")
    print(f"  Environment Setup: {'Success' if results['setup'] else 'Failed'}")
    print(f"  Test Assets: {'Success' if results['assets'] else 'Failed'}")
    print(f"  PDF Extraction: {'Success' if results['extraction'] else 'Failed'}")
    print(f"  Excel Transfer: {'Success' if results['excel'] else 'Failed'}")
    print(f"  Cloud Storage: {'Success' if results['cloud'] else 'Skipped' if not client_id else 'Failed'}")
    
    return results

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Email Form System Integration Test")
    parser.add_argument("--client-id", help="Microsoft 365 application client ID")
    parser.add_argument("--client-secret", help="Microsoft 365 application client secret")
    args = parser.parse_args()
    
    # Run workflow test
    run_complete_workflow_test(args.client_id, args.client_secret)
