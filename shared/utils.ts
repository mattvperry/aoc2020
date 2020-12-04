import fs from 'fs';
import path from 'path';

export type Day = `day${number}`;

export type FromEntries<T> = T extends [PropertyKey, infer V][] ? { [K in T[number][0]]?: V } : never;
export type Entries<T> = T extends { [K in keyof T]: infer V } ? [keyof T, V] : never;

export async function* streamInputLinesAsync<T extends Day>(day: T): AsyncIterableIterator<string> {
    let current = '';
    for await (const x of fs.createReadStream(path.join(day, 'input.txt'))) {
        const lines = (current + x).split('\n');
        const [before, after] = splitAt(lines, lines.length - 1)
        yield* before.map(l => l.trim());
        [current] = after
    }

    yield current.trim();
}

export const arrayFromAsyncGenerator = async <T>(gen: AsyncIterableIterator<T>): Promise<T[]> => {
    const current: T[] = [];
    for await (const x of gen) {
        current.push(x);
    }

    return current;
};

export const reduce = <T, U>(data: Iterable<T>, seed: U, fn: (acc: U, curr: T) => U): U => {
    let acc = seed;
    for (const x of data) {
        acc = fn(acc, x);
    }

    return acc;
}

export const reduceAsync = async <T, U>(data: AsyncIterable<T>, seed: U, fn: (acc: U, curr: T) => Promise<U>): Promise<U> => {
    let acc = seed;
    for await (const x of data) {
        acc = await fn(acc, x);
    }

    return acc;
}

export const readInputLines = <T extends Day>(day: T) =>
    arrayFromAsyncGenerator(streamInputLinesAsync(day));

type Sliceable = { slice: (start?: number, end?: number) => any, length: number };
export const splitAt = <T extends Sliceable>(xs: T, i: number): [ReturnType<T['slice']>, ReturnType<T['slice']>] =>
    [xs.slice(0, i), xs.slice(i, xs.length)];

export const isDefined = <T>(x: T | undefined): x is T =>
    x !== undefined;

export const countBy = <T>(data: Iterable<T>, fn: (x: T) => boolean): number =>
    reduce(data, 0, (acc, curr) => acc + (fn(curr) ? 1 : 0));

export const fromEntries = <T extends [PropertyKey, any]>(entries: T[]): FromEntries<T> =>
    Object.fromEntries(entries) as FromEntries<T>;