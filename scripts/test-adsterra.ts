import { ADSTERRA_SMARTLINKS, getSmartlinkWithSubId } from '../src/lib/adsterra';

function runAdsterraTests() {
  console.log('Testing Adsterra Smartlinks Integration...');

  // Check SMARTLINK 1
  const sl1 = ADSTERRA_SMARTLINKS.SMARTLINK_1;
  if (!sl1.baseUrl.includes('sjbtc6g7b') || !sl1.baseUrl.includes('key=bb02b530b4c9fef30192815ad0da524d')) {
    throw new Error('SMARTLINK 1 URL does not match required key/endpoint');
  }
  if (sl1.buttonText !== 'Continue to Resource') {
    throw new Error(`SMARTLINK 1 button text must be 'Continue to Resource', got '${sl1.buttonText}'`);
  }
  const sl1WithSub = getSmartlinkWithSubId(sl1.baseUrl, 'continue_to_resource');
  if (!sl1WithSub.includes('sub_id=continue_to_resource')) {
    throw new Error('Failed to append sub_id to SMARTLINK 1');
  }
  console.log('✓ PASS: Smartlink 1 verified ("Continue to Resource")');

  // Check SMARTLINK 2
  const sl2 = ADSTERRA_SMARTLINKS.SMARTLINK_2;
  if (!sl2.baseUrl.includes('fpfr463rs') || !sl2.baseUrl.includes('key=3140b2ffd6dd3b01612eba7863e3dd71')) {
    throw new Error('SMARTLINK 2 URL does not match required key/endpoint');
  }
  if (sl2.buttonText !== 'Open Link') {
    throw new Error(`SMARTLINK 2 button text must be 'Open Link', got '${sl2.buttonText}'`);
  }
  const sl2WithSub = getSmartlinkWithSubId(sl2.baseUrl, 'open_link');
  if (!sl2WithSub.includes('sub_id=open_link')) {
    throw new Error('Failed to append sub_id to SMARTLINK 2');
  }
  console.log('✓ PASS: Smartlink 2 verified ("Open Link")');

  // Check SMARTLINK 3
  const sl3 = ADSTERRA_SMARTLINKS.SMARTLINK_3;
  if (!sl3.baseUrl.includes('x2d4bg87') || !sl3.baseUrl.includes('key=ee65df4dacf73fc2809f529d50aa9e91')) {
    throw new Error('SMARTLINK 3 URL does not match required key/endpoint');
  }
  if (sl3.buttonText !== 'More Resources') {
    throw new Error(`SMARTLINK 3 button text must be 'More Resources', got '${sl3.buttonText}'`);
  }
  const sl3WithSub = getSmartlinkWithSubId(sl3.baseUrl, 'more_resources');
  if (!sl3WithSub.includes('sub_id=more_resources')) {
    throw new Error('Failed to append sub_id to SMARTLINK 3');
  }
  console.log('✓ PASS: Smartlink 3 verified ("More Resources")');

  // Check distinct URLs
  const uniqueUrls = new Set([sl1.baseUrl, sl2.baseUrl, sl3.baseUrl]);
  if (uniqueUrls.size !== 3) {
    throw new Error('Smartlinks are not distinct!');
  }
  console.log('✓ PASS: All 3 Smartlinks are completely distinct');

  console.log('All Adsterra tests passed successfully!');
}

runAdsterraTests();
