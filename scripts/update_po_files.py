import json
import os
import re
from typing import Dict, List

class POEntry:
    def __init__(self, msgid: str, msgstr: str, status: str, location: str = None):
        self.msgid = msgid
        self.msgstr = msgstr
        self.status = status
        self.location = location

    def to_po_string(self) -> str:
        lines = []
        if self.location:
            lines.append(f"#: {self.location}")
        lines.append(f'msgid "{self.msgid}"')
        lines.append(f'msgstr "{self.msgstr}"')
        lines.append("")  # Empty line between entries
        return "\n".join(lines)

def read_translations_json(file_path: str) -> List[POEntry]:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        return [
            POEntry(
                msgid=entry['msgid'],
                msgstr=entry['msgstr'],
                status=entry['status'],
                location=entry.get('location')
            )
            for entry in data['translations']
        ]

def write_po_file(entries: List[POEntry], file_path: str):
    # Ensure directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        # Write PO file header
        f.write('''msgid ""
msgstr ""
"Project-Id-Version: Translation Workflow\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Language: es\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"

''')
        
        # Write entries
        for entry in entries:
            f.write(entry.to_po_string())

def main():
    # Read translations from JSON
    translations = read_translations_json('data/translations.json')
    
    # Write to PO file
    write_po_file(translations, 'locale/es/LC_MESSAGES/messages.po')

if __name__ == '__main__':
    main() 