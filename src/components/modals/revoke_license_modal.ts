import type { LangDict } from '../../types.ts';
import { translate } from '../../utils.ts';
import { basicModal } from './modal.ts';

export function revokeLicenseModal(langDict: LangDict) {
    return basicModal(langDict, 'revoke-license-popup', false, `
        <h2>${translate(langDict, 'form.revoke_license.title')}</h2>
        <div class="form-buttons">
            <button type="button" onclick="hidePopup('revoke-license-popup')">
                <i class="fa-solid fa-xmark"></i>
                ${translate(langDict, 'form.revoke_license.cancel')}
            </button>
            <button class="danger-button" type="button" onclick="revokeLicense()">
                <i class="fa-solid fa-sign-out-alt"></i>	
                ${translate(langDict, 'form.revoke_license.action')}
            </button>
        </div>
    `);
}