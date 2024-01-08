import { Geolocation } from '@capacitor/geolocation';

export async function getLocation() {
    const { location, coarseLocation } = await Geolocation.requestPermissions({ permissions: ['location'] });
    if (location !== 'granted' && coarseLocation !== 'granted') return null;
    return Geolocation.getCurrentPosition({ enableHighAccuracy: true });
}
