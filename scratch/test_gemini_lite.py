import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

api_key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {api_key}")

try:
    genai.configure(api_key=api_key)
    # Try gemini-2.0-flash-lite
    model = genai.GenerativeModel("gemini-2.0-flash-lite")
    response = model.generate_content("Hello")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Error: {e}")
