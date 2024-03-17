import Component from './Popup.svelte';
import { Overlay } from 'ol';
import { getAllContexts } from 'svelte';

export class PopupOverlay extends Overlay {
    #component: Component;

    constructor(count?: string) {
        const target = document.createElement('div');
        target.classList.add('contents');
        super({ element: target });
        this.#component = new Component({
            target,
            props: { count },
            context: getAllContexts(),
        });
    }

    protected disposeInternal() {
        this.#component.$destroy();
        super.disposeInternal();
    }

    set count(count: string) {
        this.#component.$set({ count });
    }
}
