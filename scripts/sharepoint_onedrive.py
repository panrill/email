#!/usr/bin/env python3
"""
SharePoint/OneDrive Integration Script

This script provides functionality to integrate the email form system with
SharePoint and OneDrive for file storage and retrieval.
"""

import os
import sys
import json
import time
from datetime import datetime
from O365 import Account, FileSystemTokenBackend
from O365.drive import DriveItem

class SharePointOneDriveIntegration:
    def __init__(self, client_id, client_secret, token_path='./o365_token'):
        """
        Initialize the SharePoint/OneDrive integration with Microsoft 365 credentials.
        
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
        
        # Define required scopes for SharePoint/OneDrive access
        self.scopes = ['offline_access', 'files.readwrite.all', 'sites.readwrite.all']
        
        # Initialize storage locations
        self.onedrive = None
        self.sharepoint_site = None
        self.sharepoint_drive = None
    
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
    
    def connect_to_onedrive(self):
        """
        Connect to OneDrive.
        
        Returns:
            bool: True if connection is successful, False otherwise
        """
        try:
            # Get OneDrive instance
            self.onedrive = self.account.storage()
            return self.onedrive is not None
        except Exception as e:
            print(f"Error connecting to OneDrive: {e}")
            return False
    
    def connect_to_sharepoint(self, site_name):
        """
        Connect to a SharePoint site.
        
        Args:
            site_name (str): Name of the SharePoint site
            
        Returns:
            bool: True if connection is successful, False otherwise
        """
        try:
            # Get SharePoint instance
            sharepoint = self.account.sharepoint()
            
            # Get site by name
            self.sharepoint_site = sharepoint.get_site(site_name)
            if not self.sharepoint_site:
                print(f"SharePoint site not found: {site_name}")
                return False
            
            # Get default document library (drive)
            self.sharepoint_drive = self.sharepoint_site.get_default_document_library()
            return self.sharepoint_drive is not None
        
        except Exception as e:
            print(f"Error connecting to SharePoint: {e}")
            return False
    
    def upload_file_to_onedrive(self, local_file, remote_folder=None):
        """
        Upload a file to OneDrive.
        
        Args:
            local_file (str): Path to the local file
            remote_folder (str, optional): Remote folder path in OneDrive
            
        Returns:
            str: URL of the uploaded file, or None if upload failed
        """
        if not self.onedrive:
            if not self.connect_to_onedrive():
                return None
        
        try:
            # Get root folder or specified folder
            if remote_folder:
                # Create folder path if it doesn't exist
                current_folder = self.onedrive.get_root_folder()
                for folder_name in remote_folder.strip('/').split('/'):
                    if not folder_name:
                        continue
                    
                    # Check if folder exists
                    folder_items = current_folder.get_items()
                    folder_exists = False
                    for item in folder_items:
                        if item.is_folder and item.name == folder_name:
                            current_folder = item
                            folder_exists = True
                            break
                    
                    # Create folder if it doesn't exist
                    if not folder_exists:
                        current_folder = current_folder.create_folder(folder_name)
                
                folder = current_folder
            else:
                folder = self.onedrive.get_root_folder()
            
            # Upload file
            file_name = os.path.basename(local_file)
            uploaded_file = folder.upload_file(local_file)
            
            if uploaded_file:
                # Get sharing link
                permission = uploaded_file.share_with_link(edit=False)
                return permission.share_link
            
            return None
        
        except Exception as e:
            print(f"Error uploading file to OneDrive: {e}")
            return None
    
    def upload_file_to_sharepoint(self, local_file, remote_folder=None):
        """
        Upload a file to SharePoint.
        
        Args:
            local_file (str): Path to the local file
            remote_folder (str, optional): Remote folder path in SharePoint
            
        Returns:
            str: URL of the uploaded file, or None if upload failed
        """
        if not self.sharepoint_drive:
            print("Not connected to SharePoint")
            return None
        
        try:
            # Get root folder or specified folder
            if remote_folder:
                # Create folder path if it doesn't exist
                current_folder = self.sharepoint_drive.get_root_folder()
                for folder_name in remote_folder.strip('/').split('/'):
                    if not folder_name:
                        continue
                    
                    # Check if folder exists
                    folder_items = current_folder.get_items()
                    folder_exists = False
                    for item in folder_items:
                        if item.is_folder and item.name == folder_name:
                            current_folder = item
                            folder_exists = True
                            break
                    
                    # Create folder if it doesn't exist
                    if not folder_exists:
                        current_folder = current_folder.create_folder(folder_name)
                
                folder = current_folder
            else:
                folder = self.sharepoint_drive.get_root_folder()
            
            # Upload file
            file_name = os.path.basename(local_file)
            uploaded_file = folder.upload_file(local_file)
            
            if uploaded_file:
                # Get sharing link
                permission = uploaded_file.share_with_link(edit=False)
                return permission.share_link
            
            return None
        
        except Exception as e:
            print(f"Error uploading file to SharePoint: {e}")
            return None
    
    def download_file_from_onedrive(self, remote_file, local_file):
        """
        Download a file from OneDrive.
        
        Args:
            remote_file (str): Path to the remote file in OneDrive
            local_file (str): Path to save the local file
            
        Returns:
            bool: True if download is successful, False otherwise
        """
        if not self.onedrive:
            if not self.connect_to_onedrive():
                return False
        
        try:
            # Get file by path
            drive_item = self.onedrive.get_item_by_path(remote_file)
            if not drive_item:
                print(f"File not found in OneDrive: {remote_file}")
                return False
            
            # Download file
            return drive_item.download(local_file)
        
        except Exception as e:
            print(f"Error downloading file from OneDrive: {e}")
            return False
    
    def download_file_from_sharepoint(self, remote_file, local_file):
        """
        Download a file from SharePoint.
        
        Args:
            remote_file (str): Path to the remote file in SharePoint
            local_file (str): Path to save the local file
            
        Returns:
            bool: True if download is successful, False otherwise
        """
        if not self.sharepoint_drive:
            print("Not connected to SharePoint")
            return False
        
        try:
            # Get file by path
            drive_item = self.sharepoint_drive.get_item_by_path(remote_file)
            if not drive_item:
                print(f"File not found in SharePoint: {remote_file}")
                return False
            
            # Download file
            return drive_item.download(local_file)
        
        except Exception as e:
            print(f"Error downloading file from SharePoint: {e}")
            return False
    
    def list_files_in_onedrive(self, remote_folder=None):
        """
        List files in an OneDrive folder.
        
        Args:
            remote_folder (str, optional): Remote folder path in OneDrive
            
        Returns:
            list: List of file items in the folder
        """
        if not self.onedrive:
            if not self.connect_to_onedrive():
                return []
        
        try:
            # Get folder
            if remote_folder:
                folder = self.onedrive.get_item_by_path(remote_folder)
                if not folder or not folder.is_folder:
                    print(f"Folder not found in OneDrive: {remote_folder}")
                    return []
            else:
                folder = self.onedrive.get_root_folder()
            
            # Get items in folder
            items = folder.get_items()
            return list(items)
        
        except Exception as e:
            print(f"Error listing files in OneDrive: {e}")
            return []
    
    def list_files_in_sharepoint(self, remote_folder=None):
        """
        List files in a SharePoint folder.
        
        Args:
            remote_folder (str, optional): Remote folder path in SharePoint
            
        Returns:
            list: List of file items in the folder
        """
        if not self.sharepoint_drive:
            print("Not connected to SharePoint")
            return []
        
        try:
            # Get folder
            if remote_folder:
                folder = self.sharepoint_drive.get_item_by_path(remote_folder)
                if not folder or not folder.is_folder:
                    print(f"Folder not found in SharePoint: {remote_folder}")
                    return []
            else:
                folder = self.sharepoint_drive.get_root_folder()
            
            # Get items in folder
            items = folder.get_items()
            return list(items)
        
        except Exception as e:
            print(f"Error listing files in SharePoint: {e}")
            return []
    
    def sync_local_to_cloud(self, local_dir, remote_folder, use_sharepoint=False):
        """
        Synchronize local directory to cloud storage.
        
        Args:
            local_dir (str): Local directory to synchronize
            remote_folder (str): Remote folder path in cloud storage
            use_sharepoint (bool): Whether to use SharePoint instead of OneDrive
            
        Returns:
            dict: Dictionary with sync results
        """
        results = {
            'total_files': 0,
            'uploaded_files': 0,
            'failed_files': 0,
            'skipped_files': 0,
            'uploaded_urls': {}
        }
        
        # Check if local directory exists
        if not os.path.exists(local_dir) or not os.path.isdir(local_dir):
            print(f"Local directory not found: {local_dir}")
            return results
        
        # Get list of local files
        local_files = []
        for root, _, files in os.walk(local_dir):
            for file in files:
                local_file = os.path.join(root, file)
                rel_path = os.path.relpath(local_file, local_dir)
                local_files.append((local_file, rel_path))
        
        results['total_files'] = len(local_files)
        
        # Upload each file
        for local_file, rel_path in local_files:
            # Determine remote path
            remote_path = os.path.join(remote_folder, rel_path).replace('\\', '/')
            remote_dir = os.path.dirname(remote_path)
            
            try:
                # Upload file
                if use_sharepoint:
                    url = self.upload_file_to_sharepoint(local_file, remote_dir)
                else:
                    url = self.upload_file_to_onedrive(local_file, remote_dir)
                
                if url:
                    results['uploaded_files'] += 1
                    results['uploaded_urls'][rel_path] = url
                    print(f"Uploaded: {rel_path} -> {url}")
                else:
                    results['failed_files'] += 1
                    print(f"Failed to upload: {rel_path}")
            
            except Exception as e:
                results['failed_files'] += 1
                print(f"Error uploading {rel_path}: {e}")
        
        return results
    
    def create_backup(self, local_dir, backup_name=None, use_sharepoint=False):
        """
        Create a backup of a local directory in cloud storage.
        
        Args:
            local_dir (str): Local directory to backup
            backup_name (str, optional): Name for the backup folder
            use_sharepoint (bool): Whether to use SharePoint instead of OneDrive
            
        Returns:
            dict: Dictionary with backup results
        """
        # Generate backup folder name
        if not backup_name:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_name = f"Backup_{os.path.basename(local_dir)}_{timestamp}"
        
        # Sync to cloud
        remote_folder = f"Backups/{backup_name}"
        return self.sync_local_to_cloud(local_dir, remote_folder, use_sharepoint)

def setup_cloud_storage(client_id, client_secret, site_name=None):
    """
    Set up cloud storage integration.
    
    Args:
        client_id (str): Microsoft 365 application client ID
        client_secret (str): Microsoft 365 application client secret
        site_name (str, optional): SharePoint site name
        
    Returns:
        SharePointOneDriveIntegration: Initialized integration object
    """
    # Initialize integration
    integration = SharePointOneDriveIntegration(client_id, client_secret)
    
    # Authenticate
    if not integration.authenticate():
        print("Authentication failed")
        return None
    
    # Connect to OneDrive
    if not integration.connect_to_onedrive():
        print("Failed to connect to OneDrive")
    
    # Connect to SharePoint if site name provided
    if site_name:
        if not integration.connect_to_sharepoint(site_name):
            print(f"Failed to connect to SharePoint site: {site_name}")
    
    return integration

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 4:
        print("Usage: python sharepoint_onedrive.py <client_id> <client_secret> <command> [options]")
        print("\nCommands:")
        print("  upload <local_file> <remote_folder> [--sharepoint <site_name>]")
        print("  download <remote_file> <local_file> [--sharepoint <site_name>]")
        print("  list <remote_folder> [--sharepoint <site_name>]")
        print("  sync <local_dir> <remote_folder> [--sharepoint <site_name>]")
        print("  backup <local_dir> [backup_name] [--sharepoint <site_name>]")
        sys.exit(1)
    
    client_id = sys.argv[1]
    client_secret = sys.argv[2]
    command = sys.argv[3]
    
    # Check for SharePoint option
    use_sharepoint = False
    site_name = None
    for i, arg in enumerate(sys.argv):
        if arg == "--sharepoint" and i + 1 < len(sys.argv):
            use_sharepoint = True
            site_name = sys.argv[i + 1]
            break
    
    # Set up integration
    integration = setup_cloud_storage(client_id, client_secret, site_name)
    if not integration:
        print("Failed to set up cloud storage integration")
        sys.exit(1)
    
    # Execute command
    if command == "upload":
        if len(sys.argv) < 6:
            print("Usage: python sharepoint_onedrive.py <client_id> <client_secret> upload <local_file> <remote_folder> [--sharepoint <site_name>]")
            sys.exit(1)
        
        local_file = sys.argv[4]
        remote_folder = sys.argv[5]
        
        if use_sharepoint:
            url = integration.upload_file_to_sharepoint(local_file, remote_folder)
        else:
            url = integration.upload_file_to_onedrive(local_file, remote_folder)
        
        if url:
            print(f"File uploaded successfully: {url}")
        else:
            print("Failed to upload file")
            sys.exit(1)
    
    elif command == "download":
        if len(sys.argv) < 6:
            print("Usage: python sharepoint_onedrive.py <client_id> <client_secret> download <remote_file> <local_file> [--sharepoint <site_name>]")
            sys.exit(1)
        
        remote_file = sys.argv[4]
        local_file = sys.argv[5]
        
        if use_sharepoint:
            success = integration.download_file_from_sharepoint(remote_file, local_file)
        else:
            success = integration.download_file_from_onedrive(remote_file, local_file)
        
        if success:
            print(f"File downloaded successfully to {local_file}")
        else:
            print("Failed to download file")
            sys.exit(1)
    
    elif command == "list":
        if len(sys.argv) < 5:
            print("Usage: python sharepoint_onedrive.py <client_id> <client_secret> list <remote_folder> [--sharepoint <site_name>]")
            sys.exit(1)
        
        remote_folder = sys.argv[4]
        
        if use_sharepoint:
            items = integration.list_files_in_sharepoint(remote_folder)
        else:
            items = integration.list_files_in_onedrive(remote_folder)
        
        print(f"Files in {remote_folder}:")
        for item in items:
            item_type = "Folder" if item.is_folder else "File"
            print(f"  {item.name} ({item_type})")
    
    elif command == "sync":
        if len(sys.argv) < 6:
            print("Usage: python sharepoint_onedrive.py <client_id> <client_secret> sync <local_dir> <remote_folder> [--sharepoint <site_name>]")
            sys.exit(1)
        
        local_dir = sys.argv[4]
        remote_folder = sys.argv[5]
        
        results = integration.sync_local_to_cloud(local_dir, remote_folder, use_sharepoint)
        
        print("\nSync Results:")
        print(f"  Total files: {results['total_files']}")
        print(f"  Uploaded: {results['uploaded_files']}")
        print(f"  Failed: {results['failed_files']}")
        print(f"  Skipped: {results['skipped_files']}")
    
    elif command == "backup":
        if len(sys.argv) < 5:
            print("Usage: python sharepoint_onedrive.py <client_id> <client_secret> backup <local_dir> [backup_name] [--sharepoint <site_name>]")
            sys.exit(1)
        
        local_dir = sys.argv[4]
        backup_name = sys.argv[5] if len(sys.argv) > 5 and not sys.argv[5].startswith("--") else None
        
        results = integration.create_backup(local_dir, backup_name, use_sharepoint)
        
        print("\nBackup Results:")
        print(f"  Total files: {results['total_files']}")
        print(f"  Uploaded: {results['uploaded_files']}")
        print(f"  Failed: {results['failed_files']}")
        print(f"  Skipped: {results['skipped_files']}")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
