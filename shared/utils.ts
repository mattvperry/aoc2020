import { promises as fs } from "fs";
import path from 'path';

export type Day = `day${number}`;

export const readInputLines = async <T extends Day>(day: T) => {
    const text = await fs.readFile(path.join(day, 'input.txt'), 'utf8');
    return text.split('\n');
}

export const countBy = <T>(data: T[], fn: (x: T) => boolean): number =>
    data.reduce((acc, curr) => fn(curr) ? acc + 1 : acc, 0);