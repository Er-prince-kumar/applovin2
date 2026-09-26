import { validatePassword, passwordComplexitySchema } from '../src/lib/password';

console.log('Testing Password Combination Validation Rules...');

const testCases = [
  { pass: 'short', expected: false, desc: 'Too short (<8 chars)' },
  { pass: 'onlylettershere', expected: false, desc: 'Only letters, no numbers or special' },
  { pass: '1234567890', expected: false, desc: 'Only numbers' },
  { pass: '!@#$%^&*()', expected: false, desc: 'Only special chars' },
  { pass: 'LetterAndNumber123', expected: false, desc: 'Letters + Numbers, missing special char' },
  { pass: 'LetterAndSpecial!@#', expected: false, desc: 'Letters + Special, missing numbers' },
  { pass: '123456789!@#$', expected: false, desc: 'Numbers + Special, missing letters' },
  { pass: 'Publisher123!', expected: true, desc: 'Letters + Numbers + Special + 8+ chars (Valid)' },
  { pass: 'AdminSecure123!', expected: true, desc: 'Letters + Numbers + Special + 8+ chars (Valid)' },
  { pass: 'Password@2026', expected: true, desc: 'Letters + Numbers + Special + 8+ chars (Valid)' },
];

let allPassed = true;

for (const tc of testCases) {
  const res = validatePassword(tc.pass);
  const zodRes = passwordComplexitySchema.safeParse(tc.pass);
  const pass = res.isValid === tc.expected && zodRes.success === tc.expected;

  if (pass) {
    console.log(`  ✓ PASS: ${tc.desc} (isValid: ${res.isValid})`);
  } else {
    console.error(`  ✗ FAIL: ${tc.desc} (expected ${tc.expected}, got ${res.isValid})`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PASSWORD VALIDATION TESTS PASSED PERFECTLY!\n');
}
