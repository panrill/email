#!/usr/bin/env python3
"""
PDF Data Extractor

This script extracts data from returned PDF forms using various methods:
1. PyPDF for text-based extraction
2. pdftotext (poppler-utils) for more reliable text extraction
3. Form field extraction for fillable PDF forms

The script can handle different PDF formats and structures, with error handling
for various PDF types.
"""

import os
import sys
import re
import json
import subprocess
import tempfile
from pypdf import PdfReader
import pandas as pd

class PDFDataExtractor:
    def __init__(self, form_path):
        """
        Initialize the PDF data extractor with the path to the PDF form.
        
        Args:
            form_path (str): Path to the PDF form
        """
        self.form_path = form_path
        
        # Validate PDF file
        if not os.path.exists(form_path):
            raise FileNotFoundError(f"PDF file not found: {form_path}")
        
        # Check if file is a PDF
        if not form_path.lower().endswith('.pdf'):
            raise ValueError(f"File is not a PDF: {form_path}")
    
    def extract_form_fields(self):
        """
        Extract form fields from a fillable PDF form.
        
        Returns:
            dict: Dictionary of form field names and values
        """
        try:
            # Open the PDF
            reader = PdfReader(self.form_path)
            
            # Check if the PDF has form fields
            if reader.get_fields():
                # Extract form fields
                form_data = {}
                for field_name, field in reader.get_fields().items():
                    # Get the field value
                    if hasattr(field, 'value'):
                        form_data[field_name] = field.value
                    elif '/V' in field:
                        form_data[field_name] = field['/V']
                    else:
                        form_data[field_name] = None
                
                return form_data
            else:
                print(f"No form fields found in {self.form_path}")
                return {}
        
        except Exception as e:
            print(f"Error extracting form fields: {e}")
            return {}
    
    def extract_text_with_pypdf(self):
        """
        Extract text from PDF using PyPDF.
        
        Returns:
            str: Extracted text content
        """
        try:
            # Open the PDF
            reader = PdfReader(self.form_path)
            
            # Extract text from each page
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
            
            return text
        
        except Exception as e:
            print(f"Error extracting text with PyPDF: {e}")
            return ""
    
    def extract_text_with_pdftotext(self):
        """
        Extract text from PDF using pdftotext (poppler-utils).
        
        Returns:
            str: Extracted text content
        """
        try:
            # Create a temporary file for the output
            with tempfile.NamedTemporaryFile(suffix='.txt') as temp_file:
                # Run pdftotext command
                result = subprocess.run(
                    ['pdftotext', '-layout', self.form_path, temp_file.name],
                    capture_output=True,
                    text=True,
                    check=True
                )
                
                # Read the output file
                with open(temp_file.name, 'r') as f:
                    text = f.read()
                
                return text
        
        except subprocess.CalledProcessError as e:
            print(f"Error running pdftotext: {e}")
            return ""
        
        except Exception as e:
            print(f"Error extracting text with pdftotext: {e}")
            return ""
    
    def extract_data_from_text(self, text, field_patterns=None):
        """
        Extract structured data from text using regular expressions.
        
        Args:
            text (str): Text content to extract data from
            field_patterns (dict, optional): Dictionary of field names and regex patterns
            
        Returns:
            dict: Dictionary of extracted field values
        """
        # Default field patterns if none provided
        if field_patterns is None:
            field_patterns = {
                'name': r'Name:[\s\n]*([^\n]+)',
                'email': r'Email:[\s\n]*([^\n@]+@[^\n\s]+)',
                'phone': r'Phone:[\s\n]*([0-9\-\(\)\s\.]+)',
                'address': r'Address:[\s\n]*([^\n]+(?:\n[^\n]+){0,3})',
                'date': r'Date:[\s\n]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})'
            }
        
        # Extract data using patterns
        extracted_data = {}
        for field_name, pattern in field_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted_data[field_name] = match.group(1).strip()
            else:
                extracted_data[field_name] = None
        
        return extracted_data
    
    def extract_table_data(self, text):
        """
        Extract tabular data from text.
        
        Args:
            text (str): Text content to extract table data from
            
        Returns:
            list: List of dictionaries representing table rows
        """
        # Split text into lines
        lines = text.split('\n')
        
        # Find potential table headers
        header_line = None
        for i, line in enumerate(lines):
            # Look for lines with multiple words separated by spaces or tabs
            if re.search(r'\w+\s+\w+\s+\w+', line):
                # Check if the next few lines have similar structure
                if i + 3 < len(lines) and all(re.search(r'\w+\s+\w+', lines[i+j]) for j in range(1, 4)):
                    header_line = i
                    break
        
        if header_line is None:
            return []
        
        # Extract header columns
        header = lines[header_line]
        # Try to identify column boundaries based on header spacing
        col_positions = [match.start() for match in re.finditer(r'\b\w+\b', header)]
        
        if len(col_positions) < 2:
            return []
        
        # Extract column names
        col_names = []
        for i in range(len(col_positions)):
            if i < len(col_positions) - 1:
                col_name = header[col_positions[i]:col_positions[i+1]].strip()
            else:
                col_name = header[col_positions[i]:].strip()
            col_names.append(col_name)
        
        # Extract data rows
        table_data = []
        for i in range(header_line + 1, len(lines)):
            line = lines[i]
            # Skip empty lines
            if not line.strip():
                continue
            
            # Check if line has similar structure to header
            if not any(pos < len(line) for pos in col_positions):
                continue
            
            # Extract values based on column positions
            row_data = {}
            for j in range(len(col_positions)):
                if j < len(col_positions) - 1:
                    value = line[col_positions[j]:col_positions[j+1]].strip()
                else:
                    value = line[col_positions[j]:].strip()
                
                if j < len(col_names):
                    row_data[col_names[j]] = value
            
            # Add row to table data
            if row_data:
                table_data.append(row_data)
            
            # Stop if we encounter an empty line after some data rows
            if not line.strip() and table_data:
                break
        
        return table_data
    
    def extract_all_data(self, custom_patterns=None):
        """
        Extract all data from the PDF using multiple methods.
        
        Args:
            custom_patterns (dict, optional): Dictionary of custom field patterns
            
        Returns:
            dict: Dictionary containing all extracted data
        """
        result = {
            'metadata': {
                'filename': os.path.basename(self.form_path),
                'path': self.form_path,
                'extraction_methods': []
            },
            'form_fields': {},
            'text_content': '',
            'extracted_data': {},
            'table_data': []
        }
        
        # Try form field extraction
        form_fields = self.extract_form_fields()
        if form_fields:
            result['form_fields'] = form_fields
            result['metadata']['extraction_methods'].append('form_fields')
        
        # Try text extraction with pdftotext
        text_pdftotext = self.extract_text_with_pdftotext()
        if text_pdftotext:
            result['text_content'] = text_pdftotext
            result['metadata']['extraction_methods'].append('pdftotext')
            
            # Extract structured data from text
            result['extracted_data'] = self.extract_data_from_text(text_pdftotext, custom_patterns)
            
            # Extract table data
            result['table_data'] = self.extract_table_data(text_pdftotext)
        else:
            # Fall back to PyPDF if pdftotext fails
            text_pypdf = self.extract_text_with_pypdf()
            if text_pypdf:
                result['text_content'] = text_pypdf
                result['metadata']['extraction_methods'].append('pypdf')
                
                # Extract structured data from text
                result['extracted_data'] = self.extract_data_from_text(text_pypdf, custom_patterns)
                
                # Extract table data
                result['table_data'] = self.extract_table_data(text_pypdf)
        
        return result
    
    def save_extracted_data(self, output_file, data=None):
        """
        Save extracted data to a JSON file.
        
        Args:
            output_file (str): Path to save the extracted data
            data (dict, optional): Data to save, if None, extract all data
            
        Returns:
            str: Path to the saved file
        """
        # Extract data if not provided
        if data is None:
            data = self.extract_all_data()
        
        # Save data to JSON file
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        return output_file
    
    def extract_to_dataframe(self, custom_patterns=None):
        """
        Extract data and convert to a pandas DataFrame.
        
        Args:
            custom_patterns (dict, optional): Dictionary of custom field patterns
            
        Returns:
            pd.DataFrame: DataFrame containing extracted data
        """
        # Extract all data
        data = self.extract_all_data(custom_patterns)
        
        # Combine data from different sources
        combined_data = {}
        
        # Add form fields
        combined_data.update(data['form_fields'])
        
        # Add extracted data from text
        combined_data.update(data['extracted_data'])
        
        # Create DataFrame
        df = pd.DataFrame([combined_data])
        
        # Add metadata
        df['filename'] = data['metadata']['filename']
        df['extraction_methods'] = ','.join(data['metadata']['extraction_methods'])
        
        return df

def process_pdf_batch(pdf_dir, output_dir, custom_patterns=None):
    """
    Process a batch of PDF files and extract data.
    
    Args:
        pdf_dir (str): Directory containing PDF files
        output_dir (str): Directory to save extracted data
        custom_patterns (dict, optional): Dictionary of custom field patterns
        
    Returns:
        pd.DataFrame: DataFrame containing extracted data from all PDFs
    """
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Get all PDF files in the directory
    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print(f"No PDF files found in {pdf_dir}")
        return pd.DataFrame()
    
    # Process each PDF file
    all_data = []
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        print(f"Processing {pdf_file}...")
        
        try:
            # Extract data
            extractor = PDFDataExtractor(pdf_path)
            data = extractor.extract_all_data(custom_patterns)
            
            # Save extracted data
            output_file = os.path.join(output_dir, f"{os.path.splitext(pdf_file)[0]}_data.json")
            extractor.save_extracted_data(output_file, data)
            
            # Add to combined data
            combined_data = {}
            combined_data.update(data['form_fields'])
            combined_data.update(data['extracted_data'])
            combined_data['filename'] = data['metadata']['filename']
            combined_data['extraction_methods'] = ','.join(data['metadata']['extraction_methods'])
            
            all_data.append(combined_data)
            
            print(f"Extracted data saved to {output_file}")
        
        except Exception as e:
            print(f"Error processing {pdf_file}: {e}")
    
    # Create combined DataFrame
    if all_data:
        df = pd.DataFrame(all_data)
        
        # Save combined data to Excel
        excel_file = os.path.join(output_dir, "combined_data.xlsx")
        df.to_excel(excel_file, index=False)
        
        print(f"Combined data saved to {excel_file}")
        return df
    
    return pd.DataFrame()

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 3:
        print("Usage: python pdf_extractor.py <pdf_file_or_dir> <output_dir> [field_patterns_json]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    # Load custom patterns if provided
    custom_patterns = None
    if len(sys.argv) > 3:
        with open(sys.argv[3], 'r') as f:
            custom_patterns = json.load(f)
    
    # Process single file or directory
    if os.path.isdir(input_path):
        process_pdf_batch(input_path, output_dir, custom_patterns)
    else:
        try:
            # Extract data from single file
            extractor = PDFDataExtractor(input_path)
            data = extractor.extract_all_data(custom_patterns)
            
            # Save extracted data
            output_file = os.path.join(output_dir, f"{os.path.splitext(os.path.basename(input_path))[0]}_data.json")
            extractor.save_extracted_data(output_file, data)
            
            print(f"Extracted data saved to {output_file}")
        
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
