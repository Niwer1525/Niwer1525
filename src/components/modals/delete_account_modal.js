import { getValueWithFallback } from '../../utils.js';
import { basicModal } from './modal.js';

const CONFIRMATION_PHRASE = 'DELETE MY ACCOUNT';

export function deleteAccountModal(langDict) {
    return basicModal(langDict, 'delete-account-popup', `
        <h2><i class="fa-solid fa-triangle-exclamation text-danger"></i> Delete Account</h2>
        <p class="text-secondary">
            This action starts your grace period and revokes all active sessions immediately.
        </p>
        <label>
            <i class="fa-solid fa-lock"></i>
            <input type="password" name="password" required placeholder="••••••••">
        </label>
        <label id="totp-login-code" class="hidden">
            <i class="fa-solid fa-key left-icon"></i>
            <input class="totp-code" type="text" name="code" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" required disabled placeholder="123456">
            <span class="text-secondary">Authenticator Code (2FA)</span>
        </label>
        <label>
            <i class="fa-solid fa-keyboard"></i>
            <input type="text" id="delete-phrase-input" name="confirmationPhrase" autocomplete="off" required placeholder="${CONFIRMATION_PHRASE}">
            <span class="text-secondary">
                Type <span class="text-danger">${CONFIRMATION_PHRASE}</span> to confirm
            </span>
        </label>
        <button type="submit" id="btn-submit-delete" class="button-danger" disabled>
            <i class="fa-solid fa-trash-can"></i> Confirm Deletion
        </button>
    `);
}