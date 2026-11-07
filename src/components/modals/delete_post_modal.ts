import type { LangDict } from '../../types.ts';
import { translate } from '../../utils.ts';
import { basicModal } from './modal.ts';

export function deletePostModal(langDict: LangDict) {
    return basicModal(langDict, 'delete-post-popup', false, `
        <h2>${translate(langDict, 'form.delete_post.title')}</h2>
        <div class="form-buttons">
            <button type="button" onclick="hidePopup('delete-post-popup')">
                <i class="fa-solid fa-xmark"></i>
                ${translate(langDict, 'form.delete_post.cancel')}
            </button>
            <button class="danger-button" type="button" onclick="deleteBlogPost()">
                <i class="fa-solid fa-trash"></i>
                ${translate(langDict, 'form.delete_post.action')}
            </button>
        </div>
    `);
}