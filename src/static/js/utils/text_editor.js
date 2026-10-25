const INLINE_MARKERS = {
    bold: '**',
    italic: '*',
    underline: '<u>'
};

function replaceSelection(editor, replacement) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText(replacement, start, end, 'select');
    editor.focus();
    editor.dispatchEvent(new Event('input', { bubbles: true }));
}

function hasInlineFormatting(editor, start, end, opening, closing) {
    const value = editor.value;
    const hasMarkers = start >= opening.length
        && value.slice(start - opening.length, start) === opening
        && value.slice(end, end + closing.length) === closing;

    if (!hasMarkers || opening !== '*') return hasMarkers;

    return value[start - opening.length - 1] !== '*'
        && value[end + closing.length] !== '*';
}

function wrapSelection(editor, marker) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end);
    const closingMarker = marker === '<u>' ? '</u>' : marker;

    if (hasInlineFormatting(editor, start, end, marker, closingMarker)) {
        editor.setSelectionRange(start - marker.length, end + closingMarker.length);
        replaceSelection(editor, selected);
        return;
    }

    replaceSelection(editor, `${marker}${selected || 'text'}${closingMarker}`);
}

function formatList(editor, ordered) {
    const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd) || 'List item';
    const lines = selected.split('\n').map((line, index) => `${ordered ? `${index + 1}.` : '-'} ${line}`);
    replaceSelection(editor, lines.join('\n'));
}

function insertLink(editor, image = false) {
    const url = window.prompt(`Enter the ${image ? 'image URL' : 'link URL'}:`);
    if (!url) return;

    const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd) || (image ? 'image description' : 'link text');
    replaceSelection(editor, image ? `![${selected}](${url})` : `[${selected}](${url})`);
}

function runEditorCommand(editor, command) {
    if (command in INLINE_MARKERS) wrapSelection(editor, INLINE_MARKERS[command]);
    else if (command === 'unordered-list') formatList(editor, false);
    else if (command === 'ordered-list') formatList(editor, true);
    else if (command === 'link') insertLink(editor);
    else if (command === 'image') insertLink(editor, true);
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-editor-command][data-editor-target]');
    if (!button) return;

    event.preventDefault();
    const editor = document.getElementById(button.dataset.editorTarget);
    if (editor instanceof HTMLTextAreaElement) runEditorCommand(editor, button.dataset.editorCommand);
});
