function show(element: HTMLElement) {
    element.classList.remove('hidden');
}

function hide(element: HTMLElement) {
    element.classList.add('hidden');
}

export { show, hide };
