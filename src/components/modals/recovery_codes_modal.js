import { translate } from '../../utils.js';
import { basicModal } from './modal.js';

export function recoveryCodesModal(langDict) {
    return basicModal(langDict, 'recovery-codes-popup', false, `
        <h2>${translate(langDict, 'form.totp_recovery.title')}</h2>
        <p class="text-secondary">
            ${translate(langDict, 'form.totp_recovery.description')}
        </p>
        <label>
            <textarea readonly class="recovery-codes-textarea" id="recovery-codes-textarea"></textarea>
        </label>
        <button type="button" onclick="hidePopup('recovery-codes-popup')">
            <i class="fa-solid fa-check"></i>
            ${translate(langDict, 'form.totp_recovery.action')}
        </button>
    `);
}