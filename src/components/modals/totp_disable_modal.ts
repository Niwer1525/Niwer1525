import type { LangDict } from '../../types.ts';
import { translate } from '../../utils.ts';
import { basicModal } from './modal.ts';

export function totpDisableModal(langDict: LangDict) {
    return basicModal(langDict, 'disable-totp-popup', false, `
        <h2>${translate(langDict, 'form.disable_totp.title')}</h2>
        <label>
            <i class="fa-solid fa-key"></i>
            <input class="totp-code" type="text" name="code" id="totpLoginInput" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" required placeholder="123456">
        </label>
        <div class="form-buttons">
            <button type="button" onclick="hidePopup('disable-totp-popup')">
                <i class="fa-solid fa-xmark"></i>
                ${translate(langDict, 'form.disable_totp.cancel')}
            </button>
            <button class="danger-button" type="submit">
                <i class="fa-solid fa-shield-halved"></i>
                ${translate(langDict, 'form.disable_totp.action')}
            </button>
        </div>
    `);
}