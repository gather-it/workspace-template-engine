export class TemplateError extends Error {
  constructor(public readonly code: 'stale-plan' | 'apply-failed') {
    super('Template application failed');
    this.name = 'TemplateError';
  }
}
