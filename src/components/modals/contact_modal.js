import { getValueWithFallback } from '../../utils.js';
import { modal } from './modal.js';

export function contactModal(langDict) {
  return modal(langDict, 'contact-popup', `
    <input type="hidden" name="access_key" value="f18de961-019b-4e2a-ad3d-dffbb5136e1f">
    <h2>${getValueWithFallback(langDict, 'form.title', 'Contact Me')}</h2>
    <label>
        <i class="fa fa-user"></i>
        <input type="text" name="name" placeholder="Name" required autocomplete="name">
    </label>
    <label>
        <i class="fa fa-envelope"></i>
        <input type="email" name="email" placeholder="Email" required autocomplete="email">
    </label>
    <label>
        <i class="fa fa-comment"></i>
        <textarea name="message" placeholder="Message" required></textarea>
    </label>
    <button type="submit"><i class="fa fa-paper-plane"></i>${getValueWithFallback(langDict, 'btn.send', 'Send')}</button>
    <hr>
    <a href="mailto:contact@niwer.dev" class="button">
        <i class="fa fa-envelope"></i>
        ${getValueWithFallback(langDict, 'btn.open_email', 'Open email application')}
    </a>
    <span onclick="copyEmail()" class="email-link">
        contact@niwer.dev
    </span>
  `);
}