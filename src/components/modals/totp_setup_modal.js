import { getValueWithFallback } from '../../utils.js';
import { basicModal } from './modal.js';

export function totpModal(langDict) {
	return basicModal(langDict, 'totp-setup-popup', `
		<h2>Enable 2FA</h2>
		<p class="text-secondary">Scan this code with Google Authenticator, Authy, or 1Password</p>
		<div id="totp-qr-container" class="qr-code">
			<i class="fa-solid fa-spinner fa-spin fa-2x text-secondary"></i>
		</div>
		<label>
			<i class="fa-solid fa-key"></i>
			<input type="text" id="totp-manual-key" readonly title="Click to copy">
			<span class="text-secondary">Manual Secret Key</span>
		</label>
		<hr>
		<label>
			<i class="fa-solid fa-key"></i>
			<input class="totp-code" type="text" name="code" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" required placeholder="123456">
		</label>
		<button type="submit">
			<i class="fa-solid fa-shield-halved text-accent"></i>
			Activate 2FA
		</button>
	`);
}