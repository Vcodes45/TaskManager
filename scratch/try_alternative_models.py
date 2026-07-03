import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

api_key = os.getenv("GEMINI_API_KEY")

models_to_try = [
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
    "gemini-3.5-flash",
    "gemini-2.5-flash"
]

genai.configure(api_key=api_key)

for model_name in models_to_try:
    print(f"Trying model: {model_name}")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"Success: {response.text}")
        break
    except Exception as e:
        print(f"Error: {e}")
