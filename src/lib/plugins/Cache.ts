import { Data, type Data as TData } from '$lib/models/api';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { assert } from '$lib/assert';
import { filterMap } from '$lib/util';
import { parse } from 'valibot';

export async function readFile(path: string) {
    const { data } = await Filesystem.readFile({ path, directory: Directory.Cache, encoding: Encoding.UTF8 });
    assert(typeof data === 'string', 'non-string data from cached readings');
    return parse(Data, JSON.parse(data));
}

export async function read() {
    const { files } = await Filesystem.readdir({ path: '.', directory: Directory.Cache });
    const promises = filterMap(files, ({ type, name }) => {
        switch (type) {
            case 'directory':
                return;
            case 'file':
                return readFile(name).then(payload => [name, payload] as const);
            default:
                throw new Error('unexpected directory entry type');
        }
    });
    const entries = await Promise.all(promises);
    return Object.fromEntries(entries);
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

export async function remove(path: string) {
    await Filesystem.deleteFile({ path, directory: Directory.Cache });
}

export async function clear(path = '.') {
    await Filesystem.rmdir({ path, directory: Directory.Cache, recursive: true });
}
