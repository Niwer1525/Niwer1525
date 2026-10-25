import { translate } from '../../utils.js';
import { basicModal } from './modal.js';

export function editPostModal(langDict) {
	return basicModal(langDict, 'edit-post-popup', true, `
		<h2>${translate(langDict, 'form.edit_post.title')}</h2>
		<input type="hidden" name="post_id" id="editPostId">
		<label>
			<i class="fa-solid fa-link"></i>
			<input type="text" name="slug" id="editPostSlug" required placeholder="debian-or-fedora">
		</label>
        <label class="hidden" id="editPostScheduledAtLabel">
			<i class="fa-solid fa-calendar"></i>
            <input type="datetime-local" name="scheduled_at" id="editPostScheduledAt">
            <span class="text-secondary">${translate(langDict, 'form.edit_post.description.scheduled_at')}</span>
		</label>

		<label>
			<i class="fa-solid fa-text-height"></i>
			<input type="text" name="title" id="editPostTitle" required placeholder="Debian Or Feodra?">
		</label>
		<label>
			<i class="fa-solid fa-align-left"></i>
			<input type="text" name="summary" id="editPostSummary" placeholder="A brief summary of the post...">
		</label>
        <div class="text-editor-toolbar">
            <button type="button"><i class="fa-solid fa-bold"></i></button>
            <button type="button"><i class="fa-solid fa-italic"></i></button>
            <button type="button"><i class="fa-solid fa-underline"></i></button>
            <button type="button"><i class="fa-solid fa-list"></i></button>
            <button type="button"><i class="fa-solid fa-list-ol"></i></button>
            <button type="button"><i class="fa-solid fa-link"></i></button>
            <button type="button"><i class="fa-solid fa-image"></i></button>
        </div>
		<label>
			<i class="fa-solid fa-align-left"></i>
			<textarea type="text" name="content" id="editPostContent" required></textarea>
		</label>

		<button type="submit">
			<i class="fa-solid fa-plus"></i>
			${translate(langDict, 'form.edit_post.action')}
		</button>
	`);
}