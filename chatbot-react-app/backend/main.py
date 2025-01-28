from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Optional
import json
import os
from qa_agent import QA_Agent  # Your existing QA_Agent class

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize QA Agent
qa_agent = QA_Agent()

# Create uploads directory if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load the document into QA Agent
        qa_agent.add_document_to_context(file_path)
        
        return {"success": True, "message": f"Document {file.filename} uploaded and processed successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/chat")
async def chat(message: str = Form(...)):
    try:
        # Get document content and generate response
        document_content = qa_agent.get_document_content()
        if not document_content:
            return {"success": False, "message": "No document loaded"}
        
        full_prompt = f"{document_content}\n\n{message}"
        response = qa_agent.agent_chat(full_prompt)
        
        return {
            "success": True,
            "response": {
                "role": "assistant",
                "content": response
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


