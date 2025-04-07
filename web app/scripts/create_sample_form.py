#!/usr/bin/env python3
"""
PDF Form Template Creator

This script creates a sample PDF form template that can be used for testing
the PDF data extraction functionality. It creates a fillable PDF form with
various field types that can be sent to recipients.
"""

import os
import sys
from fpdf import FPDF
import tempfile
import subprocess

class PDFFormCreator:
    def __init__(self, output_file):
        """
        Initialize the PDF form creator.
        
        Args:
            output_file (str): Path to save the PDF form
        """
        self.output_file = output_file
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)
        self.pdf.add_page()
        self.pdf.set_font("Helvetica", size=12)
    
    def add_title(self, title):
        """
        Add a title to the form.
        
        Args:
            title (str): Form title
        """
        self.pdf.set_font("Helvetica", 'B', size=16)
        self.pdf.cell(0, 10, title, ln=True, align='C')
        self.pdf.ln(5)
        self.pdf.set_font("Helvetica", size=12)
    
    def add_text_field(self, label, field_name):
        """
        Add a text field to the form.
        
        Args:
            label (str): Field label
            field_name (str): Field name for identification
        """
        self.pdf.set_font("Helvetica", 'B', size=12)
        self.pdf.cell(50, 10, label, ln=0)
        self.pdf.set_font("Helvetica", size=12)
        self.pdf.cell(0, 10, "____________________", ln=True)
        self.pdf.ln(5)
    
    def add_multi_line_field(self, label, field_name, lines=3):
        """
        Add a multi-line text field to the form.
        
        Args:
            label (str): Field label
            field_name (str): Field name for identification
            lines (int): Number of lines for the field
        """
        self.pdf.set_font("Helvetica", 'B', size=12)
        self.pdf.cell(0, 10, label, ln=True)
        self.pdf.set_font("Helvetica", size=12)
        
        for _ in range(lines):
            self.pdf.cell(0, 10, "____________________________________________", ln=True)
        
        self.pdf.ln(5)
    
    def add_checkbox_group(self, label, options, field_name):
        """
        Add a group of checkboxes to the form.
        
        Args:
            label (str): Group label
            options (list): List of option labels
            field_name (str): Base field name for identification
        """
        self.pdf.set_font("Helvetica", 'B', size=12)
        self.pdf.cell(0, 10, label, ln=True)
        self.pdf.set_font("Helvetica", size=12)
        
        for option in options:
            self.pdf.cell(5, 10, "[ ]", ln=0)
            self.pdf.cell(0, 10, option, ln=True)
        
        self.pdf.ln(5)
    
    def add_date_field(self, label, field_name):
        """
        Add a date field to the form.
        
        Args:
            label (str): Field label
            field_name (str): Field name for identification
        """
        self.pdf.set_font("Helvetica", 'B', size=12)
        self.pdf.cell(50, 10, label, ln=0)
        self.pdf.set_font("Helvetica", size=12)
        self.pdf.cell(0, 10, "____ / ____ / ________", ln=True)
        self.pdf.ln(5)
    
    def add_signature_field(self, label, field_name):
        """
        Add a signature field to the form.
        
        Args:
            label (str): Field label
            field_name (str): Field name for identification
        """
        self.pdf.set_font("Helvetica", 'B', size=12)
        self.pdf.cell(0, 10, label, ln=True)
        self.pdf.set_font("Helvetica", size=12)
        self.pdf.cell(0, 20, "_______________________________", ln=True)
        self.pdf.ln(5)
    
    def add_table(self, headers, rows=3):
        """
        Add a table to the form.
        
        Args:
            headers (list): List of column headers
            rows (int): Number of empty rows to add
        """
        # Calculate column width
        col_width = self.pdf.w / len(headers)
        
        # Add headers
        self.pdf.set_font("Helvetica", 'B', size=12)
        for header in headers:
            self.pdf.cell(col_width, 10, header, border=1, align='C')
        self.pdf.ln()
        
        # Add empty rows
        self.pdf.set_font("Helvetica", size=12)
        for _ in range(rows):
            for _ in headers:
                self.pdf.cell(col_width, 10, "", border=1)
            self.pdf.ln()
        
        self.pdf.ln(5)
    
    def add_instructions(self, instructions):
        """
        Add instructions to the form.
        
        Args:
            instructions (str): Instructions text
        """
        self.pdf.set_font("Helvetica", 'I', size=10)
        self.pdf.multi_cell(0, 5, instructions)
        self.pdf.ln(5)
        self.pdf.set_font("Helvetica", size=12)
    
    def save(self):
        """
        Save the PDF form.
        
        Returns:
            str: Path to the saved PDF form
        """
        self.pdf.output(self.output_file)
        return self.output_file

def create_sample_form(output_file):
    """
    Create a sample PDF form for testing.
    
    Args:
        output_file (str): Path to save the PDF form
        
    Returns:
        str: Path to the created PDF form
    """
    # Create form
    creator = PDFFormCreator(output_file)
    
    # Add content
    creator.add_title("Sample Information Form")
    
    creator.add_instructions("Please fill out this form completely and return it via email.")
    
    creator.add_text_field("Name:", "name")
    creator.add_text_field("Email:", "email")
    creator.add_text_field("Phone:", "phone")
    
    creator.add_multi_line_field("Address:", "address", lines=3)
    
    creator.add_checkbox_group("Preferred Contact Method:", 
                              ["Email", "Phone", "Mail"], 
                              "contact_method")
    
    creator.add_date_field("Date:", "date")
    
    creator.add_table(["Item", "Quantity", "Description"], rows=3)
    
    creator.add_multi_line_field("Additional Comments:", "comments", lines=3)
    
    creator.add_signature_field("Signature:", "signature")
    
    # Save form
    return creator.save()

if __name__ == "__main__":
    # Define output directory
    forms_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
    os.makedirs(forms_dir, exist_ok=True)
    
    # Create sample form
    output_file = os.path.join(forms_dir, 'sample_form.pdf')
    create_sample_form(output_file)
    
    print(f"Sample form created at: {output_file}")
