import React from 'react';
import './globals.css';

export const metadata = {
  title: '번역 워크플로우',
  description: '번역 관리 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
} 