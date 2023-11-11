import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { type Output, parse } from 'valibot';
import { Data } from '$lib/models/api';
import { assert } from '$lib/assert';

async function readFile(path: string) {
    const { data } = await Filesystem.readFile({ path, directory: Directory.Cache });
    assert(typeof data === 'string');
    const payload = parse(Data, JSON.parse(data));
    return { path, payload };
}

export async function read() {
    const { files } = await Filesystem.readdir({ path: '.', directory: Directory.Cache });
    const promises = files.map(({ type, name }) => {
        assert(type === 'file');
        return readFile(name);
    });
    const readings = await Promise.all(promises);
    return readings.sort((a, b) => parseInt(b.path, 10) - parseInt(a.path, 10));
}

export async function write(data: Output<typeof Data>) {
    const { uri } = await Filesystem.writeFile({
        data: JSON.stringify(data),
        path: `${Date.now()}.json`,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
    });
    return uri;
}

export function remove(path: string) {
    return Filesystem.deleteFile({ path, directory: Directory.Cache });
}
