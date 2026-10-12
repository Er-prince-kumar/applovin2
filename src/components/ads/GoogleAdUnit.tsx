'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdUnitProps {
  slot?: string;
  client?: string;
  className?: string;
}

export default function GoogleAdUnit({
  slot = '8470608183',
  client = 'ca-pub-8693430049850870',
  className = '',
}: GoogleAdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      if (
        typeof window !== 'undefined' &&
        adRef.current &&
        !adRef.current.getAttribute('data-adsbygoogle-status')
      ) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      // Catch AdSense errors gracefully (e.g. adblocker, duplicate push)
      console.warn('Google AdSense banner init:', err);
    }
  }, []);

  return (
    <div
      className={`w-full flex flex-col items-center justify-center my-6 overflow-hidden ${className}`}
      aria-label="Sponsored Advertisement"
    >
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-mono">
        Advertisement
      </div>
      <div className="w-full flex justify-center items-center min-h-[90px] overflow-x-auto bg-[#0d121c]/40 rounded-xl border border-[#1e2638]/50 p-2">
        {/* first */}
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'inline-block',
            width: '728px',
            height: '90px',
            maxWidth: '100%',
          }}
          data-ad-client={client}
          data-ad-slot={slot}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
          }}
        />
      </div>
    </div>
  );
}
