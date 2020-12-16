import { fromEntries, isDefined, readInputLines, splitOn } from "../shared/utils";

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

const valid = (ranges: Range[]) => (x: number): boolean =>
    ranges.some(([min, max]) => min <= x && x <= max);

const part1 = ({ fields, others }: Data): number => {
    const validators = fields.map(f => valid(f.ranges));
    return others
        .flatMap(t => t)
        .filter(x => !validators.some(v => v(x)))
        .reduce((acc, curr) => acc + curr);
};

const part2 = ({ fields, yours, others}: Data): number => {
    const entries = fields.map(f => [f.name, valid(f.ranges)] as const);
    const valids = others.filter(t => t.every(x => entries.some(([, v]) => v(x))));
    const lookup = new Map(entries);

    let possible: string[][] = new Array(fields.length).fill(fields.map(f => f.name));
    for (const ticket of valids) {
        for (const [val, pos] of ticket.map((x, i) => [x, i])) {
            possible[pos] = possible[pos].filter(f => (lookup.get(f) ?? (_ => true))(val))
        }
    }

    while (!possible.every(ps => ps.length === 1)) {
        const settled = new Set(possible.filter(ps => ps.length === 1).map(([f]) => f));
        possible = possible.map(ps => ps.length === 1 ? ps : ps.filter(f => !settled.has(f)));
    }

    return possible
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