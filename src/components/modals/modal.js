import { translate } from '../../utils.js';

function tabNavigation(langDict, id, tabs = []) {
	return `
		<div class="modal-tabs" id="${id}-tabs">
			${tabs.map(tab => `
				<div class="modal-tab ${tab.isActive ? 'active' : ''}" data-tab="${tab.id}" onclick="switchTab('${id}', '${tab.id}')">
					${translate(langDict, tab.titleKey)}
				</div>
			`).join('')}
		</div>
	`;
}

export function multiTabModal(langDict, id, largeModal = false, tabs = [], additionalContent = '') {
	return `
		<div id="${id}" class="modal-overlay">
			<div class="modal ${largeModal ? 'large-modal' : ''}">
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

export function basicModal(langDict, id, largeModal = false, fromContent) {
	return `
		<div id="${id}" class="modal-overlay">
			<div class="modal ${largeModal ? 'large-modal' : ''}">
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