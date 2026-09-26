'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';

function LinkErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; desc: string }> = {
    not_found: {
      title: 'Link Not Found',
      desc: 'The requested monetization link does not exist or may have been deleted by the owner.',
    },
    inactive: {
      title: 'Link Currently Inactive',
      desc: 'This link has been paused or temporarily disabled by the publisher or platform administrator.',
    },
    malformed_url: {
      title: 'Invalid Destination',
      desc: 'The destination address associated with this link is not a valid or secure URL.',
    },
    system_error: {
      title: 'Routing Issue',
      desc: 'A temporary system error occurred while attempting to resolve the destination.',
    },
  };

  const current = errorMessages[error || ''] || {
    title: 'Link Unavailable',
    desc: 'The link you are trying to visit cannot be processed at this time.',
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#151B26] border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          Traffic Safety Protection
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-3">{current.title}</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">{current.desc}</p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to LinkEarn Homepage
          </Link>
          <p className="text-xs text-gray-400">
            Powered by <span className="text-white font-medium">LinkEarn</span> monetization platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LinkErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-gray-400">Loading...</div>}>
      <LinkErrorContent />
    </Suspense>
  );
}
