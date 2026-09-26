import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import AdNetworkView from './AdNetworkView';

export const metadata = {
  title: 'Ad Network & SDK Settings | MonetizeMax',
  description: 'Manage AppLovin MAX, Unity Ads, and Google AdMob Publisher keys with Anti-Ban CTR controls.',
};

const DEFAULT_CONFIG = {
  applovinSdkKey: 'demo_applovin_max_sdk_key_9823412',
  applovinRewardedId: 'rewarded_video_placement_01',
  applovinInterstitialId: 'interstitial_placement_01',
  applovinBannerId: 'banner_placement_01',
  unityGameId: '5482910',
  unityRewardedId: 'Rewarded_Android',
  unityInterstitialId: 'Interstitial_Android',
  admobAppId: 'ca-app-pub-3940256099942544~3347511713',
  admobRewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
  admobInterstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  antiBanCtrLimit: 1.5,
  minIntervalSeconds: 25,
  dailyImpressionLimit: 50,
  testMode: true,
  customAdScript: '',
};

export default async function AdNetworkPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const setting = await prisma.platformSetting.findUnique({
    where: { key: 'AD_NETWORK_CONFIG' },
  });

  const config = setting ? { ...DEFAULT_CONFIG, ...JSON.parse(setting.value) } : DEFAULT_CONFIG;

  return (
    <DashboardShell>
      <AdNetworkView initialConfig={config} />
    </DashboardShell>
  );
}
