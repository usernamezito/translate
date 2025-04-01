'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { TranslationEntry } from '../types/translation';
import TranslationEditor from '../components/TranslationEditor';

export default function Home() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'machine_translated' | 'reviewed'>('all');

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/translations');
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const handleTranslationUpdate = async (msgid: string, newTranslation: string) => {
    try {
      await fetch('/api/translations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msgid,
          msgstr: newTranslation,
          status: 'reviewed',
        }),
      });
      fetchTranslations();
    } catch (error) {
      console.error('Failed to update translation:', error);
    }
  };

  const filteredTranslations = translations.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <main>
      <TranslationEditor />
    </main>
  );
} 