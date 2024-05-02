<script context="module" lang="ts">
    const MIN_DATE = new Date('2023-09-12');
</script>

<script lang="ts">
    import * as amp from '@easepick/amp-plugin';
    import * as datetime from '@easepick/datetime';
    import * as easepick from '@easepick/core';
    import * as lock from '@easepick/lock-plugin';
    import * as preset from '@easepick/preset-plugin';
    import * as range from '@easepick/range-plugin';

    import ampCss from '@easepick/amp-plugin/dist/index.css?url';
    import baseCss from '@easepick/core/dist/index.css?url';
    import lockCss from '@easepick/lock-plugin/dist/index.css?url';
    import presetCss from '@easepick/preset-plugin/dist/index.css?url';
    import rangeCss from '@easepick/range-plugin/dist/index.css?url';

    import { assert } from '$lib/assert';
    import css from './DatePicker.css?url';
    import { onMount } from 'svelte';
    import { sub } from 'date-fns';

    // eslint-disable-next-line no-undefined
    export let startDate = undefined as datetime.DateTime | undefined;
    // eslint-disable-next-line no-undefined
    export let endDate = undefined as datetime.DateTime | undefined;

    // eslint-disable-next-line init-declarations
    let startDateElement: HTMLInputElement;
    // eslint-disable-next-line init-declarations
    let endDateElement: HTMLInputElement;

    function onSelect(evt: unknown) {
        assert(evt instanceof CustomEvent);
        assert(typeof evt.detail === 'object');
        const { start, end } = evt.detail;
        assert(start instanceof datetime.DateTime);
        assert(end instanceof datetime.DateTime);
        startDate = start;
        endDate = end;
    }

    function onReset() {
        // eslint-disable-next-line no-undefined
        startDate = endDate = undefined;
    }

    onMount(() => {
        const NOW = new Date();
        const customPreset = {
            'Past Week': [sub(NOW, { weeks: 1 }), NOW],
            'Past 2 Weeks': [sub(NOW, { weeks: 2 }), NOW],
            'Past Month': [sub(NOW, { months: 1 }), NOW],
            'Past Year': [sub(NOW, { years: 1 }), NOW],
        };
        // eslint-disable-next-line new-cap
        const picker = new easepick.create({
            element: startDateElement,
            css: [baseCss, rangeCss, lockCss, presetCss, ampCss, css],
            plugins: [range.RangePlugin, lock.LockPlugin, preset.PresetPlugin, amp.AmpPlugin],
            LockPlugin: { minDate: MIN_DATE, maxDate: NOW },
            RangePlugin: {
                startDate,
                endDate,
                elementEnd: endDateElement,
                strict: false,
                repick: true,
                tooltip: true,
                locale: { one: 'Day', other: 'Days' },
            },
            AmpPlugin: {
                resetButton: true,
                darkMode: false,
                dropdown: {
                    minYear: MIN_DATE.getUTCFullYear(),
                    maxYear: NOW.getUTCFullYear(),
                    months: true,
                    years: true,
                },
            },
            PresetPlugin: {
                customPreset,
                customLabels: Object.keys(customPreset),
                position: 'bottom',
            },
            setup(picker) {
                picker.on('select', onSelect);
                picker.on('clear', onReset);
            },
        });
        return () => {
            picker.off('select', onSelect);
            picker.off('clear', onReset);
            picker.destroy();
        };
    });
</script>

<label class="label">
    <span>Date Range</span>
    <div class="flex gap-1">
        <input
            type="date"
            placeholder="Start Date"
            class="input variant-form-material px-2 py-1"
            bind:this={startDateElement}
        />
        <input
            type="date"
            placeholder="End Date"
            class="input variant-form-material px-2 py-1"
            bind:this={endDateElement}
        />
    </div>
</label>
