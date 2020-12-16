import { difference, intersect, readInputLines, splitOn, zipWith } from "../shared/utils";

type Range = [number, number];
type Field = {
    name: string,
    ranges: Range[],
};
type Ticket = number[];
type Data = {
    fields: Field[];
    yours: Ticket;
    others: Ticket[];
};

const parse = (lines: string[]): Data => {
    const [fields, rest] = splitOn(lines, '');
    const [[, yours], [, ...others]] = splitOn(rest, '');

    return {
        fields: fields
            .map(f => /(.*): (\d+)-(\d+) or (\d+)-(\d+)/.exec(f))
            .filter((m): m is RegExpExecArray => m !== null)
            .map(([, name, min1, max1, min2, max2]) => ({
                name,
                ranges: [
                    [parseInt(min1, 10), parseInt(max1, 10)],
                    [parseInt(min2, 10), parseInt(max2, 10)]
                ],
            })),
        yours: yours.split(',').map(x => parseInt(x, 10)),
        others: others.map(o => o.split(',').map(x => parseInt(x, 10))),
    };
};

const valid = (fields: Field[], x: number): string[] => fields
    .filter(({ ranges }) => ranges.some(([min, max]) => min <= x && x <= max))
    .map(({ name }) => name);

const possible = (ticket: Ticket, fields: Field[]): Set<string>[] =>
    ticket.map(x => new Set(valid(fields, x)));

const part1 = ({ fields, others }: Data): number => others
    .flatMap(t => t)
    .filter(x => valid(fields, x).length === 0)
    .reduce((acc, curr) => acc + curr);

const part2 = ({ fields, yours, others }: Data): number => {
    const valids = others.filter(t => t.every(x => valid(fields, x).length !== 0));

    let possibles = valids
        .map(t => possible(t, fields))
        .reduce(
            (acc, curr) => zipWith(acc, curr, intersect),
            new Array<Set<string>>(fields.length).fill(new Set(fields.map(f => f.name)))
        );

    while (!possibles.every(ps => ps.size === 1)) {
        const settled = new Set(possibles.filter(ps => ps.size === 1).map(([f]) => f));
        possibles = possibles.map(ps => ps.size === 1 ? ps : difference(ps, settled));
    }

    return possibles
        .map(([x], i) => [x, yours[i]] as const)
        .filter(([x]) => x.startsWith('departure'))
        .reduce((acc, [, curr]) => acc * curr, 1);
};

(async () => {
    const lines = await readInputLines('day16');
    const data = parse(lines);

    console.log(part1(data));
    console.log(part2(data));
})();