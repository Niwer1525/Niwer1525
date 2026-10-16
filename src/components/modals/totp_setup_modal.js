import { getValueWithFallback } from '../../utils.js';
import { modal } from './modal.js';

export function contactModal(langDict) {
  return modal(langDict, 'totp-setup-popup', `

  `);
}