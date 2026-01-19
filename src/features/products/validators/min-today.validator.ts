import { AbstractControl, ValidationErrors } from '@angular/forms';

function parseLocalDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d); // ✅ local (sin UTC)
}

export function minTodayValidator(control: AbstractControl): ValidationErrors | null {
  const dt = parseLocalDate(control.value);
  if (!dt) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  dt.setHours(0, 0, 0, 0);

  return dt >= today ? null : { minToday: true };
}
