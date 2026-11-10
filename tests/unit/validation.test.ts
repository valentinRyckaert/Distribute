import {
  LIMITS,
  validatePassword,
  validatePhone,
  validateText,
  validateTitle,
} from '@/src/lib/validation'

describe('validateTitle', () => {
  it('requires 3 to 150 characters once trimmed', () => {
    expect(validateTitle('  ab ')).toMatch(/au moins 3/)
    expect(validateTitle('x'.repeat(151))).toMatch(/150/)
    expect(validateTitle('Wifi coupé')).toBeNull()
  })
})

describe('validateText', () => {
  it('checks required and maximum length', () => {
    expect(validateText('  ', 10)).toMatch(/obligatoire/)
    expect(validateText('', 10, false)).toBeNull()
    expect(validateText('x'.repeat(11), 10)).toMatch(/10/)
    expect(validateText('ok', LIMITS.commentMax)).toBeNull()
  })
})

describe('validatePassword', () => {
  it('follows the server rule: 8 characters, letters and digits', () => {
    expect(validatePassword('short1', 'short1')).toMatch(/8 caractères/)
    expect(validatePassword('lettersonly', 'lettersonly')).toMatch(/chiffres/)
    expect(validatePassword('12345678', '12345678')).toMatch(/lettres/)
  })
  it('requires the confirmation to match', () => {
    expect(validatePassword('password123', 'password124')).toMatch(/identiques/)
    expect(validatePassword('password123', 'password123')).toBeNull()
  })
})

describe('validatePhone', () => {
  it('accepts usual formats and refuses text', () => {
    expect(validatePhone('06 12 34 56 78')).toBeNull()
    expect(validatePhone('+33 6.12.34.56.78')).toBeNull()
    expect(validatePhone('appelez-moi')).toMatch(/non valide/)
  })
})
