<script lang="ts">
    import { CellType } from '$lib/models/api';
    // eslint-disable-next-line init-declarations
    export let name: string;
    // eslint-disable-next-line init-declarations
    export let value: CellType;
</script>

<select {name} bind:value class="select variant-form-material pointer-events-auto">
    <option value={CellType.WiFi}>WiFi</option>
    <option value={CellType.Gsm}>GSM (2G)</option>
    <option value={CellType.Cdma}>CDMA (3G)</option>
    <option value={CellType.Tdscdma}>TDS-CDMA (3G)</option>
    <option value={CellType.Wcdma}>W-CDMA (3G)</option>
    <option value={CellType.Lte}>LTE (4G)</option>
    <option value={CellType.Nr}>NR (5G)</option>
</select>
