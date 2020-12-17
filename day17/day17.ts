import { countBy, map, readInputLines } from "../shared/utils";

type Coord = [number, number, number, number];
type CoordS = `${number}_${number}_${number}_${number}`;
type Conway = Map<CoordS, boolean>;

const parse = (lines: string[]): Conway => new Map([...(function* () {
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            if (lines[y][x] == '#') {
                yield [toStr([x, y, 0, 0]), true] as const;
            }
        }
    }
})()]);

const toStr = ([x, y, z, w]: Coord): CoordS => `${x}_${y}_${z}_${w}` as const;

const fromStr = (coord: CoordS): Coord => coord
    .split('_')
    .map(x => parseInt(x, 10)) as Coord;

function* neighboors(s: CoordS): Iterable<CoordS> {
    const [x, y, z, w] = fromStr(s);
    for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
            for (let dz = -1; dz <= 1; ++dz) {
                for (let dw = -1; dw <= 1; ++dw) {
                    if (dx === 0 && dy === 0 && dz === 0 && dw === 0) {
                        continue;
                    }

                    yield toStr([x + dx, y + dy, z + dz, w + dw]);
                }
            }
        }
    }
};

function* expand(conway: Conway): Iterable<readonly [CoordS, boolean]> {
    for (const [coord, active] of conway) {
        yield [coord, active] as const;
        yield* map(neighboors(coord), n => [n, conway.get(n) ?? false] as const);
    }
}

function* step(conway: Conway): Iterable<readonly [CoordS, boolean]> {
    for (const [c, active] of conway) {
        const count = countBy(neighboors(c), x => conway.get(x) ?? false);
        if (count === 3 || (active && count === 2)) {
            yield [c, true] as const;
        }
    }
}

const part2 = (conway: Conway): number => {
    for (let i = 0; i < 6; ++i) {
        conway = new Map(expand(conway));
        conway = new Map(step(conway));
    }

    return conway.size;
};

(async () => {
    const lines = await readInputLines('day17');
    const conway = parse(lines);

    console.log(part2(conway));
})();