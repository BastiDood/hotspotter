import { Data, type Data as TData } from '$lib/models/api';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { type SchemaIssues, safeParse } from 'valibot';
import { filterMap } from '$lib/util';
import { printIssues } from '$lib/error/valibot';

export class ReadError extends Error {
    constructor(
        public path: string,
        public value: unknown,
        public issues: SchemaIssues,
    ) {
        const message = Array.from(printIssues(issues)).join('. ');
        super(message);
        this.name = 'ReadError';
    }
}

/** @throws {ReadError} */
export async function readFile(path: string) {
    const { data } = await Filesystem.readFile({ path, directory: Directory.Cache, encoding: Encoding.UTF8 });
    const json = JSON.parse(typeof data === 'string' ? data : await data.text());
    const result = safeParse(Data, json);
    if (result.success) return result.output;
    throw new ReadError(path, result.output, result.issues);
}

export async function read() {
    const { files } = await Filesystem.readdir({ path: '.', directory: Directory.Cache });
    return filterMap(files, ({ type, name }) => {
        switch (type) {
            case 'directory':
                return;
            case 'file':
                return name;
            default:
                throw new Error('unexpected directory entry type');
        }
    });
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
