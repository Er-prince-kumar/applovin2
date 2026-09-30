import { ADSTERRA_SMARTLINKS, getSmartlinkWithSubId } from '../src/lib/adsterra';

function runAdsterraTests() {
  console.log('Testing Adsterra Smartlinks Integration...');

  // Check SMARTLINK 1
  const sl1 = ADSTERRA_SMARTLINKS.SMARTLINK_1;
  if (!sl1.baseUrl.includes('sjbtc6g7b') || !sl1.baseUrl.includes('key=bb02b530b4c9fef30192815ad0da524d')) {
    throw new Error('SMARTLINK 1 URL does not match required key/endpoint');
  }
  const sl1WithSub = getSmartlinkWithSubId(sl1.baseUrl, 'test_sub');
  if (!sl1WithSub.includes('sub_id=test_sub')) {
    throw new Error('Failed to append sub_id to SMARTLINK 1');
  }
  console.log('✓ PASS: Smartlink 1 verified');

  // Check SMARTLINK 2
  const sl2 = ADSTERRA_SMARTLINKS.SMARTLINK_2;
  if (!sl2.baseUrl.includes('fpfr463rs') || !sl2.baseUrl.includes('key=3140b2ffd6dd3b01612eba7863e3dd71')) {
    throw new Error('SMARTLINK 2 URL does not match required key/endpoint');
  }
  const sl2WithSub = getSmartlinkWithSubId(sl2.baseUrl, 'test_sub_2');
  if (!sl2WithSub.includes('sub_id=test_sub_2')) {
    throw new Error('Failed to append sub_id to SMARTLINK 2');
  }
  console.log('✓ PASS: Smartlink 2 verified');

  // Check SMARTLINK 3
  const sl3 = ADSTERRA_SMARTLINKS.SMARTLINK_3;
  if (!sl3.baseUrl.includes('x2d4bg87') || !sl3.baseUrl.includes('key=ee65df4dacf73fc2809f529d50aa9e91')) {
    throw new Error('SMARTLINK 3 URL does not match required key/endpoint');
  }
  const sl3WithSub = getSmartlinkWithSubId(sl3.baseUrl, 'test_sub_3');
  if (!sl3WithSub.includes('sub_id=test_sub_3')) {
    throw new Error('Failed to append sub_id to SMARTLINK 3');
  }
  console.log('✓ PASS: Smartlink 3 verified');

  // Check distinct URLs
  const uniqueUrls = new Set([sl1.baseUrl, sl2.baseUrl, sl3.baseUrl]);
  if (uniqueUrls.size !== 3) {
    throw new Error('Smartlinks are not distinct!');
  }
  console.log('✓ PASS: All 3 Smartlinks are completely distinct');

  console.log('All Adsterra tests passed successfully!');
}

runAdsterraTests();
