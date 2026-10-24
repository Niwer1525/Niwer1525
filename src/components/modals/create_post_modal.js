import { translate } from '../../utils.js';
import { basicModal } from './modal.js';

export function createPostModal(langDict) {
	return basicModal(langDict, 'create-post-popup', true, `
		<h2>${translate(langDict, 'form.create_post.title')}</h2>
		<label>
			<i class="fa-solid fa-link"></i>
			<input type="text" name="slug" id="createPostSlug" required placeholder="debian-or-fedora">
		</label>
        <label>
			<i class="fa-solid fa-calendar"></i>
            <input type="datetime-local" name="scheduled_at" id="createPostScheduledAt">
            <span class="text-secondary">${translate(langDict, 'form.create_post.description.scheduled_at')}</span>
		</label>

        <hr>

        <!-- English -->
		<label>
			<i class="fa-solid fa-text-height"></i>
			<input type="text" name="title_en" id="createPostTitle_en" required placeholder="Debian Or Feodra?">
		</label>
		<label>
			<i class="fa-solid fa-align-left"></i>
			<input type="text" name="summary_en" id="createPostSummary_en" placeholder="A brief summary of the post...">
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
			<textarea type="text" name="content_en" id="createPostContent_en" required></textarea>
		</label>

        <hr>

        <!-- French -->
        <label>
			<i class="fa-solid fa-text-height"></i>
			<input type="text" name="title_fr" id="createPostTitle_fr" required placeholder="Debian ou Feodra?">
		</label>
        <label>
			<i class="fa-solid fa-align-left"></i>
			<input type="text" name="summary_fr" id="createPostSummary_fr" placeholder="Un résumé bref du post...">
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
			<textarea type="text" name="content_fr" id="createPostContent_fr" required></textarea>
		</label>

		<button type="submit">
			<i class="fa-solid fa-plus"></i>
			${translate(langDict, 'form.create_post.action')}
		</button>
	`);
}