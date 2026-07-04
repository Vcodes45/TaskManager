import os
import json
import google.generativeai as genai
from ai.base import AIService, AIAnalysisResult
from dotenv import load_dotenv

load_dotenv()


class GeminiService(AIService):
    """Google Gemini AI service for task analysis."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-flash-lite-latest")

    async def analyze_task(self, title: str, description: str) -> AIAnalysisResult:
        """Analyze a task using Google Gemini and return structured results."""
        prompt = f"""Analyze the following task and provide structured insights.

Task Title: {title}
Task Description: {description or "No description provided."}

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) with these exact keys:
{{
  "summary": "A concise 1-2 sentence summary of the task",
  "category": "One of: Work, Study, Personal, Shopping, Health, Finance, Other",
  "priority": "One of: High, Medium, Low",
  "priority_reason": "A brief explanation of why this priority level was assigned",
  "improved_description": "An improved, clearer, and more actionable version of the task description",
  "ai_actionable_steps": ["Step 1", "Step 2", "Step 3"],
  "ai_estimated_time": "A realistic time estimate (e.g. '30 minutes', '2 hours')",
  "ai_potential_roadblocks": "A brief description of any potential roadblocks or challenges"
}}

Rules:
- Category MUST be exactly one of: Work, Study, Personal, Shopping, Health, Finance, Other
- Priority MUST be exactly one of: High, Medium, Low
- The improved_description should be more detailed and actionable than the original
- Respond with ONLY the JSON object, nothing else
"""

        response = self.model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean up response — remove markdown code fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            # Remove first and last lines (code fences)
            lines = [l for l in lines if not l.strip().startswith("```")]
            response_text = "\n".join(lines).strip()

        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from the response
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            if start != -1 and end > start:
                result = json.loads(response_text[start:end])
            else:
                raise ValueError(f"Failed to parse AI response as JSON: {response_text[:200]}")

        # Validate category and priority
        valid_categories = ["Work", "Study", "Personal", "Shopping", "Health", "Finance", "Other"]
        valid_priorities = ["High", "Medium", "Low"]

        if result.get("category") not in valid_categories:
            result["category"] = "Other"
        if result.get("priority") not in valid_priorities:
            result["priority"] = "Medium"

        return AIAnalysisResult(
            summary=result.get("summary", "No summary available"),
            category=result.get("category", "Other"),
            priority=result.get("priority", "Medium"),
            priority_reason=result.get("priority_reason", "No reason provided"),
            improved_description=result.get("improved_description", description or title),
            ai_actionable_steps=result.get("ai_actionable_steps", []),
            ai_estimated_time=result.get("ai_estimated_time", "Not estimated"),
            ai_potential_roadblocks=result.get("ai_potential_roadblocks", "None identified"),
        )
