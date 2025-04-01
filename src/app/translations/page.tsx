import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

interface Translation {
  id: string;
  msgid: string;
  msgstr: string;
  status: string;
}

async function getTranslations(): Promise<Translation[]> {
  const res = await fetch('http://localhost:3000/api/translations', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch translations');
  }
  return res.json();
}

export default async function TranslationsPage() {
  const translations = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">번역 관리</h1>
      <div className="grid gap-4">
        {translations.map((translation) => (
          <div
            key={translation.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">원본 (한국어):</p>
                <p className="mt-1 text-lg">{translation.msgid}</p>
                <p className="font-medium mt-4">번역 (스페인어):</p>
                <p className="mt-1 text-lg">{translation.msgstr}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                  {translation.status}
                </span>
                <Link
                  href={`/translations/${translation.id}`}
                  className="mt-4 inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
                >
                  번역 수정
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 