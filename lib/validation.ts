// 방명록 입력 검증 규칙. 서버(guestbook 모듈)와 클라이언트(폼)가 같이 쓴다.

export const LIMITS = {
  name: { min: 1, max: 20, object: "이름을", topic: "이름은" },
  message: { min: 1, max: 500, object: "메시지를", topic: "메시지는" },
  password: { min: 4, max: 50, object: "비밀번호를", topic: "비밀번호는" },
} as const;

export type Field = keyof typeof LIMITS;
export type FieldErrors = Partial<Record<Field, string>>;

// 앞뒤 공백을 자른 값이 길이 제한 안에 있는지 확인한다. 통과하면 null.
export function checkField(field: Field, raw: string): string | null {
  const { min, max, object, topic } = LIMITS[field];
  const length = [...raw.trim()].length;
  if (length === 0) return `${object} 입력해 주세요.`;
  if (length < min || length > max) return `${topic} ${min}–${max}자로 입력해 주세요.`;
  return null;
}

export function checkFields(values: Partial<Record<Field, string>>): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of Object.keys(values) as Field[]) {
    const error = checkField(field, values[field] ?? "");
    if (error) errors[field] = error;
  }
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
