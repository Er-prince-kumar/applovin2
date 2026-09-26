'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, Share2, PlusSquare } from 'lucide-react';

export default function DownloadClientSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  async function handleInstallPWA() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on iOS / Safari:\n1. Tap the Share button (↑) at the bottom.\n2. Tap "Add to Home Screen".');
    }
  }

  return (
    <div>
      <button
        onClick={handleInstallPWA}
        className="w-full py-3.5 px-5 rounded-xl bg-[#1E2638] hover:bg-[#28354c] text-white font-bold text-sm transition-all border border-[#2E3C56] flex items-center justify-center gap-2 mb-2"
      >
        <PlusSquare className="w-5 h-5 text-purple-400" />
        <span>{installed ? 'App Installed' : 'Add to Home Screen (PWA)'}</span>
      </button>
    </div>
  );
}
