import AccessPointControlComponent from './AccessPointControl.svelte';
import type Collection from 'ol/Collection';
import { Control } from 'ol/control';
import type Feature from 'ol/Feature';
import type { SvelteComponent } from 'svelte';
import type View from 'ol/View';

export class AccessPointControl extends Control {
    #component: SvelteComponent;

    constructor(view: View, features: Collection<Feature>) {
        const target = document.createElement('div');
        super({ element: target });
        this.#component = new AccessPointControlComponent({ target, props: { view, features } });
    }

    protected disposeInternal() {
        this.#component.$destroy();
        super.disposeInternal();
    }
}
