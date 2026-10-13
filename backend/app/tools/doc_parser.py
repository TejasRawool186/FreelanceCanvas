from pathlib import Path
from typing import Optional
from pypdf import PdfReader

class DocumentParser:
    @staticmethod
    def parse_file(file_path: Path) -> str:
        if not file_path.exists():
            return ""
        
        ext = file_path.suffix.lower()
        if ext == ".pdf":
            try:
                reader = PdfReader(str(file_path))
                text = ""
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                return text.strip()
            except Exception as e:
                return f"[PDF Extraction Error: {str(e)}]"
                
        if ext in (".txt", ".md", ".json"):
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read().strip()
            except Exception as e:
                return f"[Text File Error: {str(e)}]"
                
        return ""

# UTF-8 and latin-1 encoding fallbacks

# Clean chunk metadata formatting
