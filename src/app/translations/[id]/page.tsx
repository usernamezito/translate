import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface Translation {
  id: string;
  msgid: string;
  msgstr: string;
  status: string;
}

export default async function TranslationEditPage({
  params,
}: {
  params: { id: string };
}) {
  // 실제로는 API에서 데이터를 가져와야 합니다
  const translation: Translation = {
    id: params.id,
    msgid: "계정 로그인",
    msgstr: "login hahahahaha",
    status: "human_reviewed",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">번역 수정</h1>
      <div className="max-w-2xl">
        <form action="/api/translations" method="POST">
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

          <div className="flex justify-end gap-4">
            <a
              href="/translations"
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              취소
            </a>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 