import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

// GitHub 설정
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";

export async function GET() {
  // 실제로는 데이터베이스나 파일에서 데이터를 가져와야 합니다
  const translations = [
    {
      id: "1",
      msgid: "계정 로그인",
      msgstr: "Iniciar sesión en la cuenta",
      status: "machine_translated",
    },
    {
      id: "2",
      msgid: "이메일 주소",
      msgstr: "Dirección de correo electrónico",
      status: "machine_translated",
    },
  ];

  return NextResponse.json(translations);
}

export async function POST(request: Request) {
  const data = await request.formData();
  const id = data.get("id") as string;
  const msgstr = data.get("msgstr") as string;

  // 브랜치 이름 생성
  const branchName = `translation-update-${id}-${Date.now()}`;

  try {
    // 메인 브랜치의 최신 커밋 SHA 가져오기
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });

    // 새 브랜치 생성
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });

    // 파일 업데이트 (실제로는 번역 파일의 경로와 내용을 적절히 수정해야 합니다)
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `translations/${id}.json`,
      message: `Update translation for ${id}`,
      content: Buffer.from(
        JSON.stringify({ id, msgstr, status: "human_reviewed" }, null, 2)
      ).toString("base64"),
      branch: branchName,
    });

    // PR 생성
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: `Update translation ${id}`,
      head: branchName,
      base: "main",
      body: `Translation update for ID: ${id}\nNew translation: ${msgstr}`,
    });

    return NextResponse.json({ success: true, pr: pr.html_url });
  } catch (error) {
    console.error("Error creating PR:", error);
    return NextResponse.json(
      { error: "Failed to create PR" },
      { status: 500 }
    );
  }
} 