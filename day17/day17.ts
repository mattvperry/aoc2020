import { countBy, map, readInputLines, zipWith } from "../shared/utils";

type Coord = number[];
type CoordS = string;
type Conway = Map<CoordS, boolean>;

const parse = (lines: string[], dims: number): Conway => new Map([...(function* () {
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            if (lines[y][x] == '#') {
                yield [toStr([x, y, ...Array(dims - 2).fill(0)]), true] as const;
            }
        }
    }
})()]);

const toStr = (coord: Coord): CoordS =>
    coord.map(x => x.toString()).join('_');

const fromStr = (coord: CoordS): Coord => coord
    .split('_')
    .map(x => parseInt(x, 10)) as Coord;

const neighboors = (dims: number) => {
    const deltas = Array((3 ** dims) - 1).fill([]).map((_, i) => (i + 1)
        .toString(3)
        .padStart(dims, '0')
        .split('')
        .map(d => d === '2' ? -1 : parseInt(d, 10)));

    return (s: CoordS) =>
        map(deltas, delta => toStr(zipWith(delta, fromStr(s), (x, y) => x + y)));
}

function* expand(conway: Conway, fns: (s: CoordS) => Iterable<CoordS>): Iterable<readonly [CoordS, boolean]> {
    for (const [coord, active] of conway) {
        yield [coord, active] as const;
        yield* map(fns(coord), n => [n, conway.get(n) ?? false] as const);
    }
}

function* step(conway: Conway, fns: (s: CoordS) => Iterable<CoordS>): Iterable<readonly [CoordS, boolean]> {
    for (const [c, active] of conway) {
        const count = countBy(fns(c), x => conway.get(x) ?? false);
        if (count === 3 || (active && count === 2)) {
            yield [c, true] as const;
        }
    }
}

const day17 = (lines: string[], dims: number): number => {
    const fns = neighboors(dims);
    let conway = parse(lines, dims);
    for (let i = 0; i < 6; ++i) {
        conway = new Map(expand(conway, fns));
        conway = new Map(step(conway, fns));
    }

    return conway.size;
};

(async () => {
    const lines = await readInputLines('day17');

    console.log(day17(lines, 3));
    console.log(day17(lines, 4));
})();