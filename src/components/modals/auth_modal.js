import { getValueWithFallback } from '../../utils.js';
import { multiTabModal } from './modal.js';

function login(langDict) {
	return `
		<h2><i class="fa-solid fa-fingerprint text-accent"></i> Authentication</h2>
		<label>
			<i class="fa-regular fa-envelope left-icon"></i>
			<input type="email" name="email" required placeholder="joe@gmail.com">
		</label>
		<label>
			<i class="fa-solid fa-lock left-icon"></i>
			<input type="password" name="password" required placeholder="••••••••">
		</label>
		<button type="submit" class="btn primary" style="width: 100%; margin-top: 1rem;">Login</button>
	`;
}

function twoFactorAuth(langDict) {
	return `
		<form id="totpLoginForm">
			<h2><i class="fa-solid fa-shield-halved text-accent"></i> Two-Factor Auth</h2>
			<label>
				<i class="fa-solid fa-key left-icon"></i>
				<input type="text" name="code" id="totpLoginInput" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" required placeholder="123456" style="letter-spacing: 0.3rem; text-align: center; font-size: 1.25rem;">
			</label>
			<button type="submit" class="btn primary" style="width: 100%; margin-top: 1rem;">Verify & Continue</button>
			<button type="button" class="btn icon-btn" id="btnCancel2FA" style="width: 100%; margin-top: 0.5rem; border-radius: 12px;">Back to Login</button>
		</form>
	`
}

function register(langDict) {
	return `
		<h2><i class="fa-solid fa-user-plus text-accent"></i> Create Account</h2>
		<label>
			<i class="fa-regular fa-user left-icon"></i>
			<input type="text" name="username" required placeholder="JoeDalton_">
		</label>
		<label>
			<i class="fa-regular fa-envelope left-icon"></i>
			<input type="email" name="email" required placeholder="joe@gmail.com">
		</label>
		<label>
			<i class="fa-solid fa-lock left-icon"></i>
			<input type="password" name="password" required minlength="8" placeholder="••••••••">
		</label>
		<button type="submit" class="btn">Register</button>
	`;
}

export function authModal(langDict) {
	return multiTabModal(langDict, 'auth-popup', [
		{ id: 'login', titleKey: 'modal.login', defaultTitle: 'Login', content: login(langDict), isActive: true },
		{ id: 'register', titleKey: 'modal.register', defaultTitle: 'Register', content: register(langDict) }
	], twoFactorAuth(langDict));
}