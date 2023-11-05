<script>
    import { ExclamationTriangleIcon } from '@krowten/svelte-heroicons';
</script>

<div class="alert variant-soft-warning flex flex-row items-center gap-x-2">
    <ExclamationTriangleIcon class="h-8 w-8" />
    <div class="!mt-0 contents">
        <slot />
    </div>
</div>
