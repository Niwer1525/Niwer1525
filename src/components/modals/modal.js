export function modal(langDict, id, fromContent) {
	return `
		<div id="${id}">
			<form id="${id}-form">
				<button type="button" id="close" onclick="hidePopup('${id}')">
					<i class="fa-solid fa-xmark"></i>
				</button>
				${fromContent}
			</form>
		</div>
	`;
}