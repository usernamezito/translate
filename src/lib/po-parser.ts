import { POFile, TranslationEntry } from '../types/translation';
import * as fs from 'fs/promises';

export class POParser {
  static async parse(filePath: string): Promise<POFile> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const translations: Record<string, TranslationEntry> = {};
    let currentMsgid = '';
    let currentEntry: Partial<TranslationEntry> = {};
    let headers: Record<string, string> = {};

    for (const line of lines) {
      if (line.startsWith('#: ')) {
        currentEntry.location = line.substring(3).trim();
      } else if (line.startsWith('msgid "')) {
        if (currentMsgid && currentEntry.msgstr) {
          translations[currentMsgid] = {
            ...currentEntry,
            msgid: currentMsgid,
            status: 'pending',
            lastModified: new Date(),
          } as TranslationEntry;
        }
        currentMsgid = line.substring(7, line.length - 1);
        currentEntry = {};
      } else if (line.startsWith('msgstr "')) {
        currentEntry.msgstr = line.substring(8, line.length - 1);
      }
    }

    // Add the last entry
    if (currentMsgid && currentEntry.msgstr) {
      translations[currentMsgid] = {
        ...currentEntry,
        msgid: currentMsgid,
        status: 'pending',
        lastModified: new Date(),
      } as TranslationEntry;
    }

    return { headers, translations };
  }

  static async write(filePath: string, poFile: POFile): Promise<void> {
    let content = '';
    
    // Write headers
    Object.entries(poFile.headers).forEach(([key, value]) => {
      content += `"${key}: ${value}\\n"\n`;
    });
    content += '\n';

    // Write translations
    Object.entries(poFile.translations).forEach(([msgid, entry]: [string, TranslationEntry]) => {
      if (entry.location) {
        content += `#: ${entry.location}\n`;
      }
      content += `msgid "${entry.msgid}"\n`;
      content += `msgstr "${entry.msgstr}"\n\n`;
    });

    await fs.writeFile(filePath, content, 'utf-8');
  }
} 