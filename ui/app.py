import streamlit as st
import requests

# Set the URL for the Flask API (running locally)
API_URL = "http://localhost:5000"

# Title for the Streamlit app
st.title("Chatbot with Document Interaction")

# File Upload Section
st.header("Upload a Document")
uploaded_file = st.file_uploader("Choose a document", type=["txt", "pdf", "csv", "xlsx", "docx", "cdr", "pptx", "sqlite", "db"])

# Upload file to the backend API
if uploaded_file:
    # Display a progress bar while uploading
    with st.spinner('Uploading your document...'):
        files = {'file': uploaded_file}
        response = requests.post(f"{API_URL}/upload", files=files)

    if response.status_code == 200:
        st.success("Document uploaded successfully!")
    else:
        error_message = response.json().get("error", "Failed to upload document")
        st.error(f"Error: {error_message}")

# User Query Section
st.header("Ask a Question")
user_query = st.text_input("Enter your query:")

# Query the backend API
if user_query:
    with st.spinner('Processing your query...'):
        response = requests.post(f"{API_URL}/query", json={"query": user_query})

    if response.status_code == 200:
        answer = response.json().get("response")
        st.write(answer)
    else:
        error_message = response.json().get("error", "Error processing the query")
        st.error(f"Error: {error_message}")

