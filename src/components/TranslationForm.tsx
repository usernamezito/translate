'use client';

import { useState } from 'react';

interface TranslationFormProps {
  translation: {
    id: string;
    msgid: string;
    msgstr: string;
    status: string;
  };
}

export default function TranslationForm({ translation }: TranslationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const requestData = {
      id: formData.get('id'),
      msgstr: formData.get('msgstr'),
    };
    
    console.log('=== Translation Form Submission ===');
    console.log('Submitting data:', requestData);
    
    try {
      console.log('Sending request to:', `${window.location.origin}/api/translations`);
      const response = await fetch(`${window.location.origin}/api/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update translation');
      }

      if (data.pr) {
        console.log('PR created successfully:', data.pr);
        window.open(data.pr, '_blank');
        window.location.href = '/translations';
      } else {
        throw new Error('No PR URL returned from the server');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={translation.id} />
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          원본 (한국어)
        </label>
        <div className="mt-1 p-3 bg-gray-50 rounded-md">
          {translation.msgid}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="msgstr"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          번역 (스페인어)
        </label>
        <textarea
          id="msgstr"
          name="msgstr"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          defaultValue={translation.msgstr}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상태
        </label>
        <div className="mt-1">
          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            {translation.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <a
          href="/translations"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
} 