import { getValueWithFallback } from '../../utils.js';
import { basicModal } from './modal.js';

export function createLicenseModal(langDict) {
  return basicModal(langDict, 'create-license-popup', `
    <h2>New License</h2>
    <label>
        <i class="fa-solid fa-tag"></i>
        <input type="text" name="name" required placeholder="e.g. Production Server">
    </label>
    <div class="form-group">
        <label>
            <i class="fa-solid fa-box"></i>
            <select name="product_id" id="licenseProductSelect" required>
                <option value="">Loading products...</option>
            </select>
        </label>
    </div>
    <label>
        <i class="fa-solid fa-calendar-days"></i>
        <input type="number" name="duration_days" placeholder="30" min="1">
        <span class="text-secondary">
            Duration (Days) or leave blank for default.
        </span>
    </label>
    <button type="submit" class="btn primary" style="width: 100%; margin-top: 1rem;">
        <i class="fa-solid fa-key text-accent"></i>
        Generate Key
    </button>
  `);
}