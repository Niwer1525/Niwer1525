import { getValueWithFallback } from '../../utils.js';

function tabNavigation(langDict, id, tabs = []) {
	return `
		<div class="modal-tabs" id="${id}-tabs">
			${tabs.map(tab => `
				<div class="modal-tab ${tab.isActive ? 'active' : ''}" data-tab="${tab.id}" onclick="switchTab('${id}', '${tab.id}')">
					${getValueWithFallback(langDict, tab.titleKey, tab.defaultTitle)}
				</div>
			`).join('')}
		</div>
	`;
}

export function multiTabModal(langDict, id, tabs = [], additionalContent = '') {
	return `
		<div id="${id}" class="modal-overlay">
			<div class="modal">
				${tabNavigation(langDict, id, tabs)}
				${tabs.map(tab => `
					<form id="${id}-${tab.id}-form" data-tab="${tab.id}" class="${!tab.isActive ? 'hidden' : ''}">
						<button type="button" id="close" onclick="hidePopup('${id}')">
							<i class="fa-solid fa-xmark"></i>
						</button>
						${tab.content}
					</form>
				`).join('')}
				${additionalContent}
			</div>
		</div>
	`;
}

export function basicModal(langDict, id, fromContent) {
	return `
		<div id="${id}" class="modal-overlay">
			<div class="modal">
				<form id="${id}-form">
					<button type="button" id="close" onclick="hidePopup('${id}')">
						<i class="fa-solid fa-xmark"></i>
					</button>
					${fromContent}
				</form>
			</div>
		</div>
	`;
}