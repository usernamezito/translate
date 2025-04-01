import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import fs from 'fs/promises';
import path from 'path';

// GitHub 설정
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || "";
const repo = process.env.GITHUB_REPO || "";

// GET /api/translations
export async function GET() {
  try {
    // translations 디렉토리에서 모든 JSON 파일 읽기
    const translationsDir = path.join(process.cwd(), 'translations');
    const files = await fs.readdir(translationsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // 모든 파일의 내용을 읽어서 하나의 배열로 합치기
    const allTranslations = [];
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(translationsDir, file), 'utf-8');
      const data = JSON.parse(content);
      allTranslations.push(...data.translations);
    }

    return NextResponse.json(allTranslations);
  } catch (error) {
    console.error('Error reading translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// POST /api/translations
export async function POST(request: Request) {
  console.log('=== Translation Update Request ===');
  try {
    const data = await request.json();
    console.log('Received data:', data);

    if (!data.id || !data.msgstr) {
      console.error('Missing required fields:', { id: data.id, msgstr: data.msgstr });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { id, msgstr } = data;

    // 1. 파일 읽기
    const filePath = path.join(process.cwd(), 'translations', `${id}.json`);
    console.log('Reading file:', filePath);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('File not found:', filePath);
      return NextResponse.json(
        { error: `Translation file not found: ${id}.json` },
        { status: 404 }
      );
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const fileData = JSON.parse(content);
    console.log('Current file data:', fileData);

    // 2. 번역 업데이트
    fileData.translations[0].msgstr = msgstr;
    fileData.translations[0].status = 'human_reviewed';
    console.log('Updated file data:', fileData);

    // 3. GitHub 관련 정보 확인
    if (!process.env.GITHUB_TOKEN) {
      console.error('GitHub token not found');
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    if (!owner || !repo) {
      console.error('GitHub owner or repo not configured');
      return NextResponse.json(
        { error: 'GitHub repository not configured' },
        { status: 500 }
      );
    }

    // 4. 브랜치 이름 생성
    const branchName = `translation-update-${id}-${Date.now()}`;
    console.log('Creating branch:', branchName);

    try {
      // 5. 메인 브랜치의 최신 커밋 SHA 가져오기
      const { data: ref } = await octokit.git.getRef({
        owner,
        repo,
        ref: "heads/main",
      });
      console.log('Main branch SHA:', ref.object.sha);

      // 6. 새 브랜치 생성
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });
      console.log('Branch created successfully');

      // 7. 현재 파일의 SHA 가져오기
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: `translations/${id}.json`,
        ref: 'main'
      });
      
      if (!('sha' in currentFile)) {
        throw new Error('Could not get file SHA');
      }
      
      console.log('Current file SHA:', currentFile.sha);

      // 8. 파일 업데이트
      const { data: file } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: `translations/${id}.json`,
        message: `Update translation for ${id}`,
        content: Buffer.from(JSON.stringify(fileData, null, 2)).toString("base64"),
        branch: branchName,
        sha: currentFile.sha
      });
      console.log('File updated successfully:', file.commit.html_url);

      // 9. PR 생성
      const { data: pr } = await octokit.pulls.create({
        owner,
        repo,
        title: `Update translation ${id}`,
        head: branchName,
        base: "main",
        body: `Translation update for ID: ${id}\nNew translation: ${msgstr}`,
      });
      console.log('PR created successfully:', pr.html_url);

      return NextResponse.json({ success: true, pr: pr.html_url });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json(
        { error: 'Failed to create PR: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 