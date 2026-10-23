import { translate } from '../../utils.js';
import { basicModal } from './modal.js';

export function contactModal(langDict) {
  return basicModal(langDict, 'contact-popup', `
    <input type="hidden" name="access_key" value="f18de961-019b-4e2a-ad3d-dffbb5136e1f">
    <h2>${translate(langDict, 'form.contact.title')}</h2>
    <label>
        <i class="fa fa-user"></i>
        <input type="text" name="name" placeholder="John Doe" required autocomplete="name">
    </label>
    <label>
        <i class="fa fa-envelope"></i>
        <input type="email" name="email" placeholder="john.doe@example.com" required autocomplete="email">
    </label>
    <label>
        <i class="fa fa-comment"></i>
        <textarea name="message" placeholder="Message" required></textarea>
    </label>
    <button type="submit"><i class="fa fa-paper-plane"></i>${translate(langDict, 'btn.send')}</button>
    <hr>
    <a href="mailto:contact@niwer.dev" class="button">
        <i class="fa fa-envelope"></i>
        ${translate(langDict, 'btn.open_email')}
    </a>
    <span onclick="copyEmail()" class="email-link">
        contact@niwer.dev
    </span>
  `);
}