export function modal(langDict, id, fromContent) {
	return `
		<div id="${id}">
			<form id="contact-form">
				<button type="button" id="close" onclick="hidePopup('${id}')">X</button>
				${fromContent}
			</form>
		</div>è
	`;
}