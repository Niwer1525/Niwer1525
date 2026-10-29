import { translate } from '../../utils.js';
import { basicModal } from './modal.js';

export function editProfileModal(langDict) {
	return basicModal(langDict, 'edit-profile-popup', false, `
		<h2>${translate(langDict, 'form.edit_profile.title')}</h2>
		<label>
			<i class="fa-solid fa-user"></i>
			<input type="text" name="username" id="editUsername" required placeholder="Username">
		</label>
		<label>
			<i class="fa-solid fa-envelope"></i>
			<input type="email" name="email" id="editEmail" required placeholder="user@example.com">
		</label>
		<label>
			<i class="fa-solid fa-lock"></i>
			<input type="password" name="newPassword" id="editNewPassword" minlength="8" placeholder="••••••••">
			<span class="text-secondary">${translate(langDict, 'form.edit_profile.description.new_password')}</span>
		</label>
		<label>
			<i class="fa-solid fa-lock"></i>
			<input type="password" name="confirmNewPassword" minlength="8" placeholder="••••••••">
			<span class="text-secondary">${translate(langDict, 'form.edit_profile.description.confirm_new_password')}</span>
		</label>
		<hr>
		<label>
			<i class="fa-solid fa-lock"></i>
			<input type="password" name="currentPassword" required placeholder="••••••••">
			<span class="text-secondary">${translate(langDict, 'form.edit_profile.description.confirm_password')}</span>
		</label>
		<label id="totp-login-code" class="hidden">
            <i class="fa-solid fa-key"></i>
            <input class="totp-code" type="text" name="code" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" required disabled placeholder="123456">
            <span class="text-secondary">${translate(langDict, 'form.edit_profile.description.authenticator_code')}</span>
        </label>
		<button type="submit">
			<i class="fa-solid fa-user-pen"></i>	
			${translate(langDict, 'form.edit_profile.action')}
		</button>
	`);
}