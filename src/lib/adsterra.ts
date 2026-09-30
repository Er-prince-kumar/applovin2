/**
 * Adsterra Active Smartlinks Configuration
 * 
 * Compliant with Adsterra Publisher Policies:
 * - Real user intentional clicks only
 * - Meaningful sub-ID / placement tracking
 * - Clearly labelled as sponsored ads
 * - No automatic clicks, popunders, or forced redirects
 */

export const ADSTERRA_SMARTLINKS = {
  // SMARTLINK 1: Landing Page & Public Showcase
  SMARTLINK_1: {
    id: 1,
    name: 'Smartlink 1 (Landing Page Showcase)',
    baseUrl: 'https://missiondifferentyawn.com/sjbtc6g7b?key=bb02b530b4c9fef30192815ad0da524d',
    defaultSubId: 'landing_showcase',
    placement: 'Public Landing Page Hero & Partner Showcase',
    label: 'Explore Sponsored Partner Deals (External Ad)',
  },

  // SMARTLINK 2: Task Center & Rewarded Ad Interactive CTA
  SMARTLINK_2: {
    id: 2,
    name: 'Smartlink 2 (Task Center & Sponsor CTA)',
    baseUrl: 'https://missiondifferentyawn.com/fpfr463rs?key=3140b2ffd6dd3b01612eba7863e3dd71',
    defaultSubId: 'task_center_sponsor',
    placement: 'Ad Task Center & Rewarded Video Overlay',
    label: 'Visit Sponsored Partner Ad (External Ad)',
  },

  // SMARTLINK 3: Mobile Download Page & Direct App Deals Hub
  SMARTLINK_3: {
    id: 3,
    name: 'Smartlink 3 (Mobile Download & Direct Hub)',
    baseUrl: 'https://missiondifferentyawn.com/x2d4bg87?key=ee65df4dacf73fc2809f529d50aa9e91',
    defaultSubId: 'download_partner_apps',
    placement: 'Mobile App Download Page & Shortlink Hub',
    label: 'Explore Partner App Deals (External Ad)',
  },
} as const;

/**
 * Builds a tracking URL with sub-ID parameter
 * @param baseUrl Base Adsterra Smartlink URL
 * @param subId Placement tracking identifier
 */
export function getSmartlinkWithSubId(baseUrl: string, subId?: string): string {
  if (!subId) return baseUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}sub_id=${encodeURIComponent(subId)}`;
}
