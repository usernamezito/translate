export type TranslationStatus = 'machine_translated' | 'reviewed' | 'pending';

export interface TranslationEntry {
  msgid: string;
  msgstr: string;
  status: TranslationStatus;
  location?: string;
  lastModified?: Date;
}

export interface POFile {
  headers: Record<string, string>;
  translations: Record<string, TranslationEntry>;
}

export interface TranslationsResponse {
  translations: TranslationEntry[];
}

export interface TranslationUpdate {
  msgstr: string;
  status: TranslationStatus;
} 