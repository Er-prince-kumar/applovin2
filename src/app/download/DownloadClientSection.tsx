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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('To install on iPhone / Safari:\n1. Tap the Share button (↑) at the bottom.\n2. Tap "Add to Home Screen".');
      } else {
        alert('To install on Android:\n1. Tap the 3 dots (⋮) in Chrome at top right.\n2. Tap "Install app" or "Add to Home screen".\n\nThis installs the app icon directly to your phone!');
      }
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleInstallPWA}
        className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
      >
        <Smartphone className="w-5 h-5 text-gray-950 stroke-[2.5]" />
        <span>{installed ? '✓ App Installed Successfully' : 'Install App to Phone (1-Tap)'}</span>
      </button>

      <div className="p-3 bg-[#0D121C] border border-[#1E2638] rounded-xl text-[11px] text-gray-400 space-y-1.5">
        <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
          <span>📱</span> Quick Install Without Downloading APK:
        </div>
        <div>
          <strong className="text-gray-200">On Android (Chrome):</strong> Tap the <strong>3 dots (⋮)</strong> at top right &rarr; Tap <strong className="text-emerald-400">&quot;Install app&quot;</strong> or <strong className="text-emerald-400">&quot;Add to Home screen&quot;</strong>.
        </div>
        <div>
          <strong className="text-gray-200">On iPhone (Safari):</strong> Tap <strong>Share (↑)</strong> &rarr; Tap <strong className="text-emerald-400">&quot;Add to Home Screen&quot;</strong>.
        </div>
      </div>
    </div>
  );
}
