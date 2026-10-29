export class TemplateError extends Error {
  constructor(public readonly code: 'stale-plan' | 'apply-failed' | 'cancelled') {
    super('Template application failed');
    this.name = 'TemplateError';
  }
}
export function checkAbort(signal?: AbortSignal): void {
  if (signal?.aborted) throw new TemplateError('cancelled');
}
