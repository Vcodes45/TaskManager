from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class AIAnalysisResult:
    """Structured result from AI analysis."""
    summary: str
    category: str
    priority: str
    priority_reason: str
    improved_description: str
    ai_actionable_steps: list
    ai_estimated_time: str
    ai_potential_roadblocks: str


class AIService(ABC):
    """Abstract base class for AI services. Implement this to swap LLM providers."""

    @abstractmethod
    async def analyze_task(self, title: str, description: str) -> AIAnalysisResult:
        """
        Analyze a task and return structured insights.

        Args:
            title: The task title.
            description: The task description.

        Returns:
            AIAnalysisResult with summary, category, priority, reason, and improved description.
        """
        pass
