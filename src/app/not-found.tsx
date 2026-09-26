import React from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-center items-center p-6 text-center">
      <div className="mb-8">
        <Logo size="lg" showTagline={true} />
      </div>

      <div className="max-w-md w-full bg-[#151B26] border border-[#232D3F] rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="text-4xl font-extrabold text-white mb-2">404</div>
        <h1 className="text-xl font-bold text-gray-200 mb-2">Page Not Found</h1>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          The page or resource you are seeking does not exist or has been relocated within LinkEarn.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
