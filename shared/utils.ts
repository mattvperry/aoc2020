import { promises as fs } from "fs";
import path from 'path';

export type Day = `day${number}`;

export const readInputLines = async <T extends Day>(day: T) => {
    const text = await fs.readFile(path.join(day, 'input.txt'), 'utf8');
    return text.split('\n').map(l => l.trim());
}

export const countBy = <T>(data: ArrayLike<T> | Iterable<T>, fn: (x: T) => boolean): number =>
    Array.from(data).reduce((acc, curr) => fn(curr) ? acc + 1 : acc, 0);