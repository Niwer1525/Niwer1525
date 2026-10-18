import { getValueWithFallback } from '../../utils.js';
import { multiTabModal } from './modal.js';

function login(langDict) {
	return `
		<h2>Authentication</h2>
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
			Login
		</button>
	`;
}

function twoFactorAuth(langDict) {
	return `
		<form id="totp-login-form">
			<h2>Two-Factor Auth</h2>
			<label>
				<i class="fa-solid fa-key"></i>
				<input type="text" name="code" id="totpLoginInput" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" required placeholder="123456" style="letter-spacing: 0.3rem; text-align: center; font-size: 1.25rem;">
			</label>
			<button type="submit">
				<i class="fa-solid fa-shield-halved"></i>
				Verify & Continue
			</button>
			<button type="button" id="btnCancel2FA" onclick="showPopupAndSwitchTab('auth-popup', 'login')">Back to Login</button>
		</form>
	`
}

function register(langDict) {
	return `
		<h2>Create Account</h2>
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
		<button type="submit">
			<i class="fa-solid fa-user-plus"></i>
			Register
		</button>
	`;
}

export function authModal(langDict) {
	return multiTabModal(langDict, 'auth-popup', [
		{ id: 'login', titleKey: 'modal.login', defaultTitle: 'Login', content: login(langDict), isActive: true },
		{ id: 'register', titleKey: 'modal.register', defaultTitle: 'Register', content: register(langDict) }
	], twoFactorAuth(langDict));
}