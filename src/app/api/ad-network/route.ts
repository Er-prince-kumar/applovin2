import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.platformSetting.findUnique({
      where: { key: 'AD_NETWORK_CONFIG' },
    });

    const config = setting ? { ...DEFAULT_CONFIG, ...JSON.parse(setting.value) } : DEFAULT_CONFIG;

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error fetching ad network config:', error);
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const merged = { ...DEFAULT_CONFIG, ...body };

    await prisma.platformSetting.upsert({
      where: { key: 'AD_NETWORK_CONFIG' },
      update: {
        value: JSON.stringify(merged),
        description: 'Ad Network SDK configurations (AppLovin, Unity, AdMob)',
      },
      create: {
        key: 'AD_NETWORK_CONFIG',
        value: JSON.stringify(merged),
        description: 'Ad Network SDK configurations (AppLovin, Unity, AdMob)',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ad Network settings updated successfully!',
      config: merged,
    });
  } catch (error) {
    console.error('Error saving ad network config:', error);
    return NextResponse.json({ error: 'Failed to update ad network settings' }, { status: 500 });
  }
}
