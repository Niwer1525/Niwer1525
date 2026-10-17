import { getValueWithFallback } from '../../utils.js';
import { modal } from './modal.js';

export function contactModal(langDict) {
  return basicModal(langDict, 'totp-setup-popup', `

  `);
}