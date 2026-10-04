import { validateAppToDevice, validateDeviceToApp } from './generated/validators.js';
import type { AppToDeviceMessage, DeviceToAppMessage } from './generated/index.js';

/** Either a validated, correctly-typed `value`, or a human-readable `errors` string describing
 * every schema violation found (semicolon-joined). */
export type ValidationResult<T> = { valid: true; value: T } | { valid: false; errors: string };

function formatErrors(errors: unknown): string {
  if (!Array.isArray(errors) || errors.length === 0) return 'invalid message';
  return errors
    .map((e: { instancePath?: string; message?: string }) =>
      `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim(),
    )
    .join('; ');
}

/** Thin wrapper over the build-time-compiled Ajv validators (PRO-01) — see gen-types' genValidators. */
export function validateDeviceToAppMessage(data: unknown): ValidationResult<DeviceToAppMessage> {
  if (validateDeviceToApp(data)) return { valid: true, value: data as DeviceToAppMessage };
  return { valid: false, errors: formatErrors(validateDeviceToApp.errors) };
}

/** Thin wrapper over the build-time-compiled Ajv validators (PRO-01) — see gen-types' genValidators. */
export function validateAppToDeviceMessage(data: unknown): ValidationResult<AppToDeviceMessage> {
  if (validateAppToDevice(data)) return { valid: true, value: data as AppToDeviceMessage };
  return { valid: false, errors: formatErrors(validateAppToDevice.errors) };
}
