from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from agent import QA_Agent  # Import the existing chatbot logic

app = Flask(__name__)

# Initialize the QA agent
chat_agent = QA_Agent()

# Ensure the upload folder exists
UPLOAD_FOLDER = './data'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Supported file extensions for upload
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'csv', 'xlsx', 'docx', 'cdr', 'pptx', 'sqlite', 'db'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/query', methods=['POST'])
def query_document():
    # Get the query from the request body
    query = request.json.get('query')
    if not query:
        return jsonify({"error": "Query not provided"}), 400

    # Get the response from the agent
    response = chat_agent.agent_chat(query)
    if not response:
        return jsonify({"error": "No response generated from the agent"}), 500

    return jsonify({"response": response})

@app.route('/upload', methods=['POST'])
def upload_document():
    # Check if the request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Check if the file has a valid extension
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Please upload a supported document."}), 400

    # Secure the file name and save it to the upload folder
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        # Add document to the context
        chat_agent.add_document_to_context(file_path)
    except Exception as e:
        # In case of any issues while processing the document
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

    return jsonify({"message": "Document uploaded and processed successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True)

