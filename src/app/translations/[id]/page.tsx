import { Inter } from "next/font/google";
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import TranslationForm from '../../../components/TranslationForm';

const inter = Inter({ subsets: ["latin"] });

interface Translation {
  id: string;
  msgid: string;
  msgstr: string;
  status: string;
}

async function getTranslation(id: string): Promise<Translation> {
  try {
    // URL 디코딩된 ID를 사용
    const decodedId = decodeURIComponent(id);
    const filePath = path.join(process.cwd(), 'translations', `${decodedId}.json`);
    
    // 파일 존재 여부 확인
    try {
      await fs.access(filePath);
    } catch {
      console.error(`File not found: ${filePath}`);
      notFound();
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.translations[0];
  } catch (error) {
    console.error('Error reading translation:', error);
    throw error;
  }
}

export default async function TranslationEditPage({
  params,
}: {
  params: { id: string };
}) {
  const translation = await getTranslation(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">번역 수정</h1>
      <div className="max-w-2xl">
        <TranslationForm translation={translation} />
      </div>
    </div>
  );
} 