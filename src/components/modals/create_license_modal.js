import { translate } from '../../utils.js';
import { basicModal } from './modal.js';

export function createLicenseModal(langDict) {
  return basicModal(langDict, 'create-license-popup', `
    <h2>${translate(langDict, "form.license.title")}</h2>
    <label>
        <i class="fa-solid fa-tag"></i>
        <input type="text" name="name" required placeholder="${translate(langDict, "form.license.placeholder.name")}">
    </label>
    <div class="form-group">
        <label>
            <i class="fa-solid fa-box"></i>
            <select name="product_id" id="licenseProductSelect" required>
                <option value="">${translate(langDict, "form.license.loading_product")}</option>
            </select>
        </label>
    </div>
    <label>
        <i class="fa-solid fa-calendar-days"></i>
        <input type="number" name="duration_days" placeholder="30" min="1">
        <span class="text-secondary">
            ${translate(langDict, "form.license.description.day")}
        </span>
    </label>
    <button type="submit" class="btn primary" style="width: 100%; margin-top: 1rem;">
        <i class="fa-solid fa-key text-accent"></i>
        ${translate(langDict, "form.license.action")}
    </button>
  `);
}