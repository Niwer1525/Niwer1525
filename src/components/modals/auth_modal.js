import { translate } from '../../utils.js';
import { multiTabModal } from './modal.js';

function login(langDict) {
	return `
		<h2>${translate(langDict, "form.auth.login.title")}</h2>
		<label>
			<i class="fa fa-envelope"></i>
			<input type="email" name="email" required placeholder="joe@gmail.com">
		</label>
		<label>
			<i class="fa-solid fa-lock"></i>
			<input type="password" name="password" required placeholder="••••••••">
		</label>
		<button type="submit">
			<i class="fa-solid fa-fingerprint"></i>
			${translate(langDict, "form.auth.login.action")}
		</button>
	`;
}

function twoFactorAuth(langDict) {
	return `
		<form id="totp-login-form" class="hidden">
			<h2>${translate(langDict, "form.auth.2fa.title")}</h2>
			<label>
				<i class="fa-solid fa-key"></i>
				<input class="totp-code" type="text" name="code" id="totpLoginInput" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" required placeholder="123456">
			</label>
			<button type="submit">
				<i class="fa-solid fa-shield-halved"></i>
				${translate(langDict, "form.auth.2fa.action")}
			</button>
			<button type="button" id="btnCancel2FA" onclick="showPopupAndSwitchTab('auth-popup', 'login')">
				${translate(langDict, "form.auth.2fa.back")}
			</button>
		</form>
	`
}

function register(langDict) {
	return `
		<h2>${translate(langDict, "form.auth.register.title")}</h2>
		<label>
			<i class="fa fa-user"></i>
			<input type="text" name="username" required placeholder="JoeDalton_">
		</label>
		<label>
			<i class="fa fa-envelope"></i>
			<input type="email" name="email" required placeholder="joe@gmail.com">
		</label>
		<label>
			<i class="fa-solid fa-lock"></i>
			<input type="password" name="password" required minlength="8" placeholder="••••••••">
		</label>
		<label>
			<i class="fa-solid fa-lock"></i>
			<input type="password" name="confirm_password" required minlength="8" placeholder="••••••••">
		</label>
		<button type="submit">
			<i class="fa-solid fa-user-plus"></i>
			${translate(langDict, "form.auth.register.action")}
		</button>
	`;
}

export function authModal(langDict) {
	return multiTabModal(langDict, 'auth-popup', false, [
		{ id: 'login', titleKey: 'modal.login', content: login(langDict), isActive: true },
		{ id: 'register', titleKey: 'modal.register', content: register(langDict) }
	], twoFactorAuth(langDict));
}