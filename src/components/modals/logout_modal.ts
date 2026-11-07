import type { LangDict } from '../../types.ts';
import { translate } from '../../utils.ts';
import { basicModal } from './modal.ts';

export function logoutModal(langDict: LangDict) {
    return basicModal(langDict, 'logout-popup', false, `
        <h2>${translate(langDict, 'form.logout.title')}</h2>
        <div class="form-buttons">
            <button type="button" onclick="hidePopup('logout-popup')">
                <i class="fa-solid fa-xmark"></i>
                ${translate(langDict, 'form.logout.cancel')}
            </button>
            <button class="danger-button" type="button" onclick="logout()">
                <i class="fa-solid fa-sign-out-alt"></i>	
                ${translate(langDict, 'form.logout.action')}
            </button>
        </div>
    `);
}