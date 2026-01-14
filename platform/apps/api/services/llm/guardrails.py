"""
LLM Guardrails
Input/Output filtering and validation for LLM responses
TOR Reference: Section 4.5.6
"""

from typing import Dict, List, Optional, Tuple
import re
import logging

from core.llm_config import GUARDRAIL_BLOCKED_TOPICS, GUARDRAIL_ALLOWED_DOMAINS

logger = logging.getLogger(__name__)


class Guardrails:
    """
    LLM Guardrails for content safety and quality

    Features:
    - Input sanitization
    - Topic filtering
    - Domain restriction
    - Output validation
    - Injection detection
    """

    def __init__(
        self,
        blocked_topics: Optional[List[str]] = None,
        allowed_domains: Optional[List[str]] = None,
        max_input_length: int = 4000,
        max_output_length: int = 8000,
    ):
        self.blocked_topics = blocked_topics or GUARDRAIL_BLOCKED_TOPICS
        self.allowed_domains = allowed_domains or GUARDRAIL_ALLOWED_DOMAINS
        self.max_input_length = max_input_length
        self.max_output_length = max_output_length

        # Compile regex patterns
        self._compile_patterns()

    def _compile_patterns(self) -> None:
        """Compile regex patterns for efficiency"""
        # Injection patterns
        self.injection_patterns = [
            r"ignore\s+(previous|above|all)\s+instructions?",
            r"disregard\s+(previous|above|all)",
            r"forget\s+(everything|all|previous)",
            r"new\s+instructions?:",
            r"system\s*prompt",
            r"<\s*system\s*>",
            r"]\s*}\s*{",  # JSON injection
        ]
        self.injection_regex = re.compile(
            "|".join(self.injection_patterns),
            re.IGNORECASE
        )

        # Blocked topic patterns
        self.blocked_regex = re.compile(
            "|".join(re.escape(topic) for topic in self.blocked_topics),
            re.IGNORECASE
        )

    def check_input(self, text: str) -> Tuple[bool, str, Optional[str]]:
        """
        Validate and sanitize input text

        Returns:
            Tuple of (is_valid, sanitized_text, error_message)
        """
        # Check length
        if len(text) > self.max_input_length:
            return False, text[:self.max_input_length], "ข้อความยาวเกินไป"

        # Check for injection attempts
        if self.injection_regex.search(text):
            logger.warning(f"Injection attempt detected: {text[:100]}...")
            return False, "", "ตรวจพบรูปแบบข้อความที่ไม่อนุญาต"

        # Check blocked topics
        if self.blocked_regex.search(text):
            return False, "", "คำถามนี้อยู่นอกเหนือขอบเขตของระบบ"

        # Sanitize text
        sanitized = self._sanitize_text(text)

        return True, sanitized, None

    def check_output(self, text: str) -> Tuple[bool, str, Optional[str]]:
        """
        Validate and filter output text

        Returns:
            Tuple of (is_valid, filtered_text, warning_message)
        """
        # Check length
        if len(text) > self.max_output_length:
            text = text[:self.max_output_length] + "..."

        # Check blocked topics in output
        if self.blocked_regex.search(text):
            logger.warning("Output contains blocked content")
            return False, "ขออภัย ไม่สามารถตอบคำถามนี้ได้", "เนื้อหาถูกกรอง"

        # Filter potentially sensitive information
        filtered = self._filter_sensitive(text)

        return True, filtered, None

    def _sanitize_text(self, text: str) -> str:
        """Sanitize input text"""
        # Remove control characters
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def _filter_sensitive(self, text: str) -> str:
        """Filter sensitive information from output"""
        # Remove potential PII patterns (Thai ID, phone numbers)
        text = re.sub(r'\b\d{13}\b', '[หมายเลขบัตรประชาชน]', text)
        text = re.sub(r'\b0[689]\d{8}\b', '[เบอร์โทรศัพท์]', text)

        # Remove email addresses
        text = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', '[อีเมล]', text)

        return text

    def is_domain_relevant(self, text: str) -> bool:
        """
        Check if text is relevant to allowed domains

        Used to gently steer conversation back to water loss topics
        """
        text_lower = text.lower()
        return any(
            domain.lower() in text_lower
            for domain in self.allowed_domains
        )

    def get_domain_reminder(self) -> str:
        """Get a polite reminder about the system's domain"""
        return (
            "ขออภัยครับ/ค่ะ ระบบ WARIS เป็นผู้ช่วยเฉพาะด้านการวิเคราะห์น้ำสูญเสียของ กปภ. "
            "หากมีคำถามเกี่ยวกับน้ำสูญเสีย DMA หรือข้อมูลในระบบ ยินดีช่วยเหลือครับ/ค่ะ"
        )

    def format_response_with_disclaimer(self, response: str) -> str:
        """Add appropriate disclaimers to response"""
        # Check if response makes predictions
        if any(word in response for word in ["คาดว่า", "น่าจะ", "อาจจะ", "ประมาณ"]):
            response += "\n\n*หมายเหตุ: ข้อมูลนี้เป็นการประมาณการจากโมเดล AI อาจมีความคลาดเคลื่อน*"

        return response

    def validate_conversation(
        self,
        messages: List[Dict[str, str]]
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate entire conversation history

        Returns:
            Tuple of (is_valid, error_message)
        """
        total_length = sum(len(m.get("content", "")) for m in messages)

        if total_length > self.max_input_length * 10:
            return False, "ประวัติการสนทนายาวเกินไป กรุณาเริ่มการสนทนาใหม่"

        # Check each message
        for msg in messages:
            if msg.get("role") == "user":
                is_valid, _, error = self.check_input(msg.get("content", ""))
                if not is_valid and error:
                    return False, error

        return True, None


# Create default guardrails instance
default_guardrails = Guardrails()
