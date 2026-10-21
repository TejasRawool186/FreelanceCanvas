from pathlib import Path
from typing import Optional
from pypdf import PdfReader

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".json"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

class DocumentParser:
    @staticmethod
    def is_allowed_extension(filename: str) -> bool:
        ext = Path(filename).suffix.lower()
        return ext in ALLOWED_EXTENSIONS

    @staticmethod
    def parse_file(file_path: Path) -> str:
        if not file_path.exists():
            raise FileNotFoundError(f"File not found on disk: {file_path.name}")
        
        file_size = file_path.stat().st_size
        if file_size > MAX_FILE_SIZE:
            raise ValueError(f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum allowed size of 10MB.")
        
        if file_size == 0:
            raise ValueError("The uploaded document is empty (0 bytes).")

        ext = file_path.suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file format '{ext}'. Supported formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

        if ext == ".pdf":
            try:
                reader = PdfReader(str(file_path))
                if len(reader.pages) == 0:
                    raise ValueError("The PDF document contains 0 pages.")
                
                text_parts = []
                for idx, page in enumerate(reader.pages):
                    extracted = page.extract_text()
                    if extracted:
                        text_parts.append(extracted.strip())
                
                full_text = "\n\n".join(text_parts).strip()
                if len(full_text) < 15:
                    raise ValueError(
                        "The uploaded PDF appears to be a scanned image or contains no selectable text. "
                        "Please copy and paste the brief text into the editor."
                    )
                return full_text
            except ValueError:
                raise
            except Exception as e:
                raise ValueError(f"Failed to parse PDF document: {str(e)}")
                
        if ext in (".txt", ".md", ".json"):
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read().strip()
                if not content:
                    raise ValueError("The uploaded text document is empty.")
                return content
            except ValueError:
                raise
            except Exception as e:
                raise ValueError(f"Failed to read document: {str(e)}")
                
        raise ValueError(f"Unsupported file format '{ext}'.")
