import { getValueWithFallback } from '../../utils.js';
import { basicModal } from './modal.js';

export function editProfileModal(langDict) {
	return basicModal(langDict, 'edit-profile-popup', `
		<h2>Edit Details</h2>
		<label>
			<i class="fa-solid fa-user left-icon"></i>
			<input type="text" name="username" id="editUsername" required placeholder="Username">
		</label>
		<label>
			<i class="fa-solid fa-envelope left-icon"></i>
			<input type="email" name="email" id="editEmail" required placeholder="user@example.com">
		</label>
		<label>
			<i class="fa-solid fa-lock left-icon"></i>
			<input type="password" name="newPassword" id="editNewPassword" minlength="8" placeholder="••••••••">
			<span class="text-secondary">New password or leave blank to keep current.</span>
		</label>
		<hr>
		<label>
			<i class="fa-solid fa-lock left-icon"></i>
			<input type="password" name="currentPassword" required placeholder="••••••••">
			<span class="text-secondary">Current password required to save.</span>
		</label>
		<button type="submit">
			<i class="fa-solid fa-user-pen"></i>	
			Save Changes
		</button>
	`);
}