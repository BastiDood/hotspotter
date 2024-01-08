import { Data, type Data as TData } from '$lib/models/api';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { assert } from '$lib/assert';
import { filterMap } from '$lib/util';
import { parse } from 'valibot';

async function readFile(path: string) {
    const { data } = await Filesystem.readFile({ path, directory: Directory.Cache, encoding: Encoding.UTF8 });
    assert(typeof data === 'string');
    const payload = parse(Data, JSON.parse(data));
    return { path, payload };
}

export async function read() {
    const { files } = await Filesystem.readdir({ path: '.', directory: Directory.Cache });
    const promises = filterMap(files, ({ type, name }) => {
        switch (type) {
            case 'directory':
                return;
            case 'file':
                return readFile(name);
            default:
                throw new Error('unexpected directory entry type');
        }
    });
    const readings = await Promise.all(promises);
    return readings.sort((a, b) => parseInt(b.path, 10) - parseInt(a.path, 10));
}

export async function write(data: TData) {
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

export function clear(path = '.') {
    return Filesystem.rmdir({ path, directory: Directory.Cache, recursive: true });
}
