import { Control } from 'ol/control';
import type { Coordinate } from 'ol/coordinate';
import Dashboard from './Dashboard.svelte';
import type { Feature } from 'ol';

export class DashboardControl extends Control {
    #component: Dashboard;

    constructor(base: URL, center: Coordinate) {
        const target = document.createElement('div');
        target.style.display = 'contents';
        super({ element: target });
        this.#component = new Dashboard({ target, props: { base, center } });
    }

    protected disposeInternal() {
        this.#component.$destroy();
        super.disposeInternal();
    }

    get view() {
        return this.#component.view;
    }

    get gps() {
        return this.#component.gps;
    }

    get hex() {
        return this.#component.hex;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onData(callback: (data: CustomEvent<Feature[]>) => any) {
        return this.#component.$on('data', callback);
    }
}
