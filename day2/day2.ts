import { countBy, readInputLines } from "../shared/utils";

type Data = [number, number, string, string];

const parse = (line: string): Data | undefined => {
    const match = line.match(/(\d+)-(\d+) (\w): (\w+)/);
    return match?.length === 5
        ? [parseInt(match[1], 10), parseInt(match[2], 10), match[3], match[4]]
        : undefined;
}

const part1 = (data: Data[]): number => countBy(data, ([min, max, char, pwd]) => {
    const count = pwd.split('').reduce((acc, curr) => acc + (curr === char ? 1 : 0), 0);
    return count >= min && count <= max;
});

const part2 = (data: Data[]): number => countBy(data, ([x, y, char, pwd]) => {
    return (pwd[x - 1] === char) !== (pwd[y - 1] === char);
});

(async () => {
    const input = await readInputLines('day2');
    const data = input.map(parse).filter((x): x is Data => x !== undefined);

    console.log(part1(data));
    console.log(part2(data));
})();