import { getValueWithFallback } from '../../utils.js';
import { modal } from './modal.js';

export function authModal(langDict) {
  return modal(langDict, 'auth-popup', `

  `);
}