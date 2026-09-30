/**
 * Adsterra Active Smartlinks Configuration
 * 
 * Compliant with Adsterra Publisher Policies:
 * - Real user intentional clicks only
 * - Meaningful sub-ID / placement tracking
 * - Clearly labelled as sponsored/external links where appropriate
 * - No automatic clicks, popunders, or forced redirects
 */

export const ADSTERRA_SMARTLINKS = {
  // SMARTLINK 1: Landing Page Resource Placement
  SMARTLINK_1: {
    id: 1,
    name: 'Smartlink 1 (Landing Page Resource)',
    baseUrl: 'https://missiondifferentyawn.com/sjbtc6g7b?key=bb02b530b4c9fef30192815ad0da524d',
    defaultSubId: 'continue_to_resource',
    placement: 'Public Landing Page Hero & Partner Showcase',
    buttonText: 'Continue to Resource',
  },

  // SMARTLINK 2: Task Center Direct Link Placement
  SMARTLINK_2: {
    id: 2,
    name: 'Smartlink 2 (Task Center Direct Link)',
    baseUrl: 'https://missiondifferentyawn.com/fpfr463rs?key=3140b2ffd6dd3b01612eba7863e3dd71',
    defaultSubId: 'open_link',
    placement: 'Ad Task Center Sponsored Stream & Rewarded Overlay',
    buttonText: 'Open Link',
  },

  // SMARTLINK 3: Mobile Download & More Resources Placement
  SMARTLINK_3: {
    id: 3,
    name: 'Smartlink 3 (More Resources Hub)',
    baseUrl: 'https://missiondifferentyawn.com/x2d4bg87?key=ee65df4dacf73fc2809f529d50aa9e91',
    defaultSubId: 'more_resources',
    placement: 'Mobile App Download Page & Resource Hub',
    buttonText: 'More Resources',
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
