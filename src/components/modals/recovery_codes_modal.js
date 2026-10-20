import { getValueWithFallback } from '../../utils.js';
import { basicModal } from './modal.js';

export function recoveryCodesModal(langDict) {
    return basicModal(langDict, 'recovery-codes-popup', `
        <h2>Recovery Codes</h2>
        <p class="text-secondary">
            These codes can be used to access your account if you lose access to your authenticator app.
        </p>
        <label>
            <textarea readonly class="recovery-codes-textarea" id="recovery-codes-textarea"></textarea>
        </label>
        <button type="button" onclick="hidePopup('recovery-codes-popup')">
            <i class="fa-solid fa-check"></i> I've saved my recovery codes
        </button>
    `);
}