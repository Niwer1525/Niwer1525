const TOOLBAR_ACTIONS = [
	{ command: 'bold', icon: 'fa-bold', label: 'Bold' },
	{ command: 'italic', icon: 'fa-italic', label: 'Italic' },
	{ command: 'underline', icon: 'fa-underline', label: 'Underline' },
	{ command: 'unordered-list', icon: 'fa-list', label: 'Bulleted list' },
	{ command: 'ordered-list', icon: 'fa-list-ol', label: 'Numbered list' },
	{ command: 'link', icon: 'fa-link', label: 'Insert link' },
	{ command: 'image', icon: 'fa-image', label: 'Insert image' }
];

export function textEditorToolbar(editorId) {
	return `
		<div class="text-editor-toolbar" role="toolbar" aria-label="Text formatting">
			${TOOLBAR_ACTIONS.map(({ command, icon, label }) => `
				<button type="button" data-editor-target="${editorId}" data-editor-command="${command}" title="${label}" aria-label="${label}">
					<i class="fa-solid ${icon}" aria-hidden="true"></i>
				</button>
			`).join('')}
		</div>
	`;
}
