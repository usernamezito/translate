import React, { useState, useEffect } from 'react';
import { TranslationEntry, TranslationsResponse } from '../types/translation';

export default function TranslationEditor() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'machine_translated' | 'reviewed'>('all');

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/translations');
      const data: TranslationsResponse = await response.json();
      setTranslations(data.translations);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const handleUpdate = async (msgid: string, newTranslation: string) => {
    try {
      await fetch(`/api/translations/${encodeURIComponent(msgid)}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          msgstr: newTranslation, 
          status: 'reviewed' 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await fetchTranslations();
      alert('번역이 업데이트되었습니다!');
    } catch (error) {
      console.error('Failed to update translation:', error);
      alert('번역 업데이트 중 오류가 발생했습니다.');
    }
  };

  const filteredTranslations = translations.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">번역 관리</h1>
      
      <div className="mb-6">
        <label className="mr-4">필터:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded p-2"
        >
          <option value="all">모든 번역</option>
          <option value="machine_translated">기계 번역</option>
          <option value="reviewed">검수 완료</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTranslations.map((translation) => (
          <div 
            key={translation.msgid} 
            className="border rounded-lg p-4 bg-white shadow"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                원문:
              </label>
              <p className="mt-1 p-2 bg-gray-50 rounded">
                {translation.msgid}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                번역:
              </label>
              <textarea
                defaultValue={translation.msgstr}
                onChange={(e) => handleUpdate(translation.msgid, e.target.value)}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                rows={3}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>상태: {translation.status}</span>
              {translation.location && (
                <span>위치: {translation.location}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 