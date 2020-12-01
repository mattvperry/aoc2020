import { promises as fs } from "fs";
import path from 'path';

export type Day = `day${number}`;

export const readInputLines = async <T extends Day>(day: T) => {
    const text = await fs.readFile(path.join(day, 'input.txt'), 'utf8');
    return text.split('\n');
}