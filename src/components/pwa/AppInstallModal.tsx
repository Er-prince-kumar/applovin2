'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download, Star, ShieldCheck, Zap, Share, PlusSquare, Check } from 'lucide-react';
import Logo from '@/components/brand/Logo';

interface AppInstallModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function AppInstallModal({ forceOpen = false, onClose }: AppInstallModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed as standalone PWA
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    // 2. Check if iOS
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosCheck);

    // 3. Catch PWA beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__pwaPrompt = e;
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setIsOpen(false);
      localStorage.setItem('linkearn_app_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Custom event to trigger modal from anywhere
    const handleCustomTrigger = () => {
      setIsOpen(true);
    };
    window.addEventListener('trigger-install-modal', handleCustomTrigger);

    // 4. Trigger modal if user just logged in
    const checkLoginTrigger = () => {
      const justLoggedIn = sessionStorage.getItem('showInstallPromptAfterLogin');
      if (justLoggedIn === 'true' && !standaloneMode) {
        // Small delay so user sees dashboard first then smooth prompt pops up
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.removeItem('showInstallPromptAfterLogin');
        }, 600);
        return () => clearTimeout(timer);
      }
    };

    checkLoginTrigger();

    if (forceOpen) {
      setIsOpen(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-install-modal', handleCustomTrigger);
    };
  }, [forceOpen]);

  // Don't show if already in standalone app mode
  if (isStandalone && !forceOpen) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  async function handleInstallClick() {
    const promptEvent = deferredPrompt || (window as any).__pwaPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setInstalled(true);
          setIsOpen(false);
        }
        setDeferredPrompt(null);
        (window as any).__pwaPrompt = null;
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (isIOS) {
      // iOS doesn't support programmatic prompt, instructions shown below
    } else {
      // Chrome fallback instructions
      alert('To install LinkEarn App:\n1. Tap the 3 dots (⋮) in Chrome at top right.\n2. Tap "Install App" or "Add to Home Screen".');
    }
  }

  function handleDismiss() {
    setIsOpen(false);
    if (onClose) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131924] border border-[#243044] rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1E2638] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center">
              <span className="text-2xl font-black bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                LE
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold text-white leading-tight">LinkEarn App</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Official
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <span>4.9 (5,200+ Publishers)</span>
            </div>
          </div>
        </div>

        {/* Description Banner */}
        <div className="p-3.5 rounded-xl bg-[#0D121C] border border-[#1E2638] mb-5 space-y-2">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Install App for Best Experience
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Install the LinkEarn app on your device for instant 1-tap access, real-time earnings alerts, and faster link shortening!
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No storage needed (&lt;1MB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Offline tracking ready</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Smartphone className="w-5 h-5 stroke-[2.5]" />
            <span>{installed ? '✓ App Installed' : 'Install App Now (1-Tap)'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#1A2232] text-gray-400 hover:text-white text-xs font-medium transition-colors"
          >
            Continue in Browser for Now
          </button>
        </div>

        {/* iOS Manual instructions if on iPhone */}
        {isIOS && (
          <div className="mt-4 pt-3.5 border-t border-[#1E2638] text-[11px] text-gray-400 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>🍏</span> iPhone / Safari Instructions:
            </div>
            <div className="flex items-center gap-1.5">
              1. Tap the <Share className="w-3.5 h-3.5 text-emerald-400 inline" /> <strong>Share</strong> button at the bottom.
            </div>
            <div className="flex items-center gap-1.5">
              2. Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> <strong>&quot;Add to Home Screen&quot;</strong>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
