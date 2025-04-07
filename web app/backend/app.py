from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import datetime
import sys

# Add parent directory to path to import from scripts
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts import tracking_database, email_sender, pdf_extractor, excel_transfer, sharepoint_onedrive

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
jwt = JWTManager(app)

# Load configuration
CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'config.json')

def load_config():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    return {
        "client_id": "",
        "client_secret": "",
        "sharepoint_site": "",
        "token_path": os.path.join(os.path.dirname(CONFIG_PATH), "o365_token"),
        "users": {
            "admin@example.com": {
                "password": generate_password_hash("admin123"),
                "name": "Admin User",
                "role": "admin"
            }
        },
        "email_templates": {
            "default_subject": "Please complete the attached form",
            "default_body": "Hello {Name},\n\nPlease complete the attached form and return it at your earliest convenience.\n\nThank you.",
            "signature": "Best regards,\nAdmin User\nEmail Form System"
        }
    }

def save_config(config):
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f, indent=2)

config = load_config()

# Serve static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Authentication routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
    
    user = config['users'].get(email)
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Create access token
    access_token = create_access_token(identity=email)
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "email": email,
            "name": user['name'],
            "role": user['role']
        }
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    first_name = request.json.get('firstName', None)
    last_name = request.json.get('lastName', None)
    
    if not email or not password or not first_name or not last_name:
        return jsonify({"error": "Missing required fields"}), 400
    
    if email in config['users']:
        return jsonify({"error": "Email already registered"}), 400
    
    # Add new user
    config['users'][email] = {
        "password": generate_password_hash(password),
        "name": f"{first_name} {last_name}",
        "role": "user"
    }
    
    # Save updated config
    save_config(config)
    
    return jsonify({"message": "Registration successful"})

@app.route('/api/auth/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user = get_jwt_identity()
    user = config['users'].get(current_user)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "email": current_user,
        "name": user['name'],
        "role": user['role']
    })

# Dashboard routes
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    # Get tracking data
    tracking_data = tracking_database.get_tracking_data()
    
    # Count forms
    forms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
    forms_count = len([f for f in os.listdir(forms_path) if f.endswith('.pdf')]) if os.path.exists(forms_path) else 0
    
    # Count recipients
    recipients = set()
    for record in tracking_data:
        recipients.add(record['recipient_email'])
    
    # Count emails sent and forms returned
    emails_sent = len(tracking_data)
    forms_returned = sum(1 for record in tracking_data if record['returned'])
    
    # Get recent activity
    recent_activity = []
    for record in sorted(tracking_data, key=lambda x: x['date_sent'], reverse=True)[:5]:
        activity = {
            "date": record['date_sent'],
            "activity": f"Form sent to {record['recipient_name']}",
            "status": "Sent"
        }
        recent_activity.append(activity)
        
        if record['returned']:
            activity = {
                "date": record['date_returned'],
                "activity": f"Form returned from {record['recipient_name']}",
                "status": "Returned"
            }
            recent_activity.append(activity)
    
    return jsonify({
        "formsCount": forms_count,
        "recipientsCount": len(recipients),
        "emailsSentCount": emails_sent,
        "formsReturnedCount": forms_returned,
        "recentActivity": sorted(recent_activity, key=lambda x: x['date'], reverse=True)[:5]
    })

# Forms routes
@app.route('/api/forms', methods=['GET'])
@jwt_required()
def get_forms():
    forms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
    if not os.path.exists(forms_path):
        os.makedirs(forms_path)
    
    forms = []
    for filename in os.listdir(forms_path):
        if filename.endswith('.pdf'):
            form_path = os.path.join(forms_path, filename)
            form_stat = os.stat(form_path)
            forms.append({
                "id": filename,
                "name": os.path.splitext(filename)[0],
                "path": form_path,
                "size": form_stat.st_size,
                "created": datetime.datetime.fromtimestamp(form_stat.st_ctime).isoformat()
            })
    
    return jsonify(forms)

@app.route('/api/forms/<form_id>', methods=['GET'])
@jwt_required()
def get_form(form_id):
    forms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
    form_path = os.path.join(forms_path, form_id)
    
    if not os.path.exists(form_path):
        return jsonify({"error": "Form not found"}), 404
    
    return send_from_directory(forms_path, form_id)

@app.route('/api/forms', methods=['POST'])
@jwt_required()
def create_form():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        forms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
        if not os.path.exists(forms_path):
            os.makedirs(forms_path)
        
        filename = file.filename
        file_path = os.path.join(forms_path, filename)
        file.save(file_path)
        
        form_stat = os.stat(file_path)
        
        return jsonify({
            "id": filename,
            "name": os.path.splitext(filename)[0],
            "path": file_path,
            "size": form_stat.st_size,
            "created": datetime.datetime.fromtimestamp(form_stat.st_ctime).isoformat()
        })
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/forms/<form_id>', methods=['DELETE'])
@jwt_required()
def delete_form(form_id):
    forms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
    form_path = os.path.join(forms_path, form_id)
    
    if not os.path.exists(form_path):
        return jsonify({"error": "Form not found"}), 404
    
    os.remove(form_path)
    
    return jsonify({"message": "Form deleted successfully"})

@app.route('/api/forms/<form_id>/send', methods=['POST'])
@jwt_required()
def send_form(form_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    recipients = request.json.get('recipients', [])
    subject = request.json.get('subject', config['email_templates']['default_subject'])
    message = request.json.get('message', config['email_templates']['default_body'])
    
    if not recipients:
        return jsonify({"error": "No recipients specified"}), 400
    
    forms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'forms')
    form_path = os.path.join(forms_path, form_id)
    
    if not os.path.exists(form_path):
        return jsonify({"error": "Form not found"}), 404
    
    # Send emails
    results = []
    for recipient in recipients:
        try:
            # Personalize message
            personalized_message = message.replace('{Name}', recipient['name'])
            personalized_message += f"\n\n{config['email_templates']['signature']}"
            
            # Send email
            email_sender.send_email(
                recipient['email'],
                recipient['name'],
                subject,
                personalized_message,
                form_path
            )
            
            # Track the sent form
            tracking_database.add_tracking_record(
                recipient['email'],
                recipient['name'],
                form_id,
                os.path.splitext(form_id)[0]
            )
            
            results.append({
                "recipient": recipient,
                "status": "sent",
                "message": "Email sent successfully"
            })
        except Exception as e:
            results.append({
                "recipient": recipient,
                "status": "failed",
                "message": str(e)
            })
    
    return jsonify(results)

# Recipients routes
@app.route('/api/recipients', methods=['GET'])
@jwt_required()
def get_recipients():
    # Get tracking data to extract unique recipients
    tracking_data = tracking_database.get_tracking_data()
    
    recipients = {}
    for record in tracking_data:
        email = record['recipient_email']
        if email not in recipients:
            recipients[email] = {
                "id": email,
                "email": email,
                "name": record['recipient_name'],
                "formsSent": 0,
                "formsReturned": 0
            }
        
        recipients[email]['formsSent'] += 1
        if record['returned']:
            recipients[email]['formsReturned'] += 1
    
    return jsonify(list(recipients.values()))

@app.route('/api/recipients', methods=['POST'])
@jwt_required()
def create_recipient():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    email = request.json.get('email', None)
    name = request.json.get('name', None)
    
    if not email or not name:
        return jsonify({"error": "Missing email or name"}), 400
    
    # We don't actually store recipients separately, just return success
    return jsonify({
        "id": email,
        "email": email,
        "name": name,
        "formsSent": 0,
        "formsReturned": 0
    })

# Tracking routes
@app.route('/api/tracking', methods=['GET'])
@jwt_required()
def get_tracking():
    tracking_data = tracking_database.get_tracking_data()
    
    # Convert to API format
    result = []
    for record in tracking_data:
        result.append({
            "id": record['id'],
            "recipientEmail": record['recipient_email'],
            "recipientName": record['recipient_name'],
            "formId": record['form_id'],
            "formName": record['form_name'],
            "dateSent": record['date_sent'],
            "returned": record['returned'],
            "dateReturned": record['date_returned'] if record['returned'] else None,
            "processed": record['processed'],
            "dateProcessed": record['date_processed'] if record['processed'] else None
        })
    
    return jsonify(result)

@app.route('/api/tracking/check-returns', methods=['POST'])
@jwt_required()
def check_returns():
    # This would normally check email for returned forms
    # For demo purposes, we'll just return a success message
    return jsonify({
        "message": "Check completed",
        "newReturns": 0
    })

# Data extraction routes
@app.route('/api/extraction', methods=['GET'])
@jwt_required()
def get_extraction():
    tracking_data = tracking_database.get_tracking_data()
    
    # Filter for returned but not processed forms
    extraction_data = []
    for record in tracking_data:
        if record['returned'] and not record['processed']:
            extraction_data.append({
                "id": record['id'],
                "recipientEmail": record['recipient_email'],
                "recipientName": record['recipient_name'],
                "formId": record['form_id'],
                "formName": record['form_name'],
                "dateReturned": record['date_returned']
            })
    
    return jsonify(extraction_data)

@app.route('/api/extraction/extract', methods=['POST'])
@jwt_required()
def extract_data():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    form_ids = request.json.get('formIds', [])
    
    if not form_ids:
        return jsonify({"error": "No forms specified"}), 400
    
    # This would normally extract data from the forms
    # For demo purposes, we'll just return a success message
    return jsonify({
        "message": "Extraction completed",
        "processed": len(form_ids),
        "successful": len(form_ids),
        "failed": 0
    })

# Settings routes
@app.route('/api/settings', methods=['GET'])
@jwt_required()
def get_settings():
    # Return non-sensitive settings
    return jsonify({
        "emailTemplates": config['email_templates'],
        "integration": {
            "clientId": config['client_id'] != "",
            "clientSecret": config['client_secret'] != "",
            "sharepointSite": config['sharepoint_site']
        }
    })

@app.route('/api/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    # Update email templates if provided
    if 'emailTemplates' in request.json:
        config['email_templates'] = request.json['emailTemplates']
    
    # Update integration settings if provided
    if 'integration' in request.json:
        integration = request.json['integration']
        if 'clientId' in integration:
            config['client_id'] = integration['clientId']
        if 'clientSecret' in integration:
            config['client_secret'] = integration['clientSecret']
        if 'sharepointSite' in integration:
            config['sharepoint_site'] = integration['sharepointSite']
    
    # Save updated config
    save_config(config)
    
    return jsonify({
        "message": "Settings updated successfully",
        "emailTemplates": config['email_templates'],
        "integration": {
            "clientId": config['client_id'] != "",
            "clientSecret": config['client_secret'] != "",
            "sharepointSite": config['sharepoint_site']
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
