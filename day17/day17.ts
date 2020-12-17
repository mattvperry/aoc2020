import { countBy, map, readInputLines } from "../shared/utils";

type Coord = [number, number, number, number];
type CoordS = `${number}_${number}_${number}_${number}`;
type Conway = Set<CoordS>;

const parse = (lines: string[]): Conway => new Set([...(function* () {
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            if (lines[y][x] == '#') {
                yield toStr([x, y, 0, 0]);
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

const step = (conway: Conway): Conway => {
    const consider = new Map([...(function* () {
        for (const coord of conway) {
            yield [coord, true] as const;
            yield* map(neighboors(coord), n => [n, conway.has(n)] as const);
        }
    })()]);

    return new Set([...(function* () {
        for (const [c, active] of consider) {
            const count = countBy(neighboors(c), x => consider.get(x) ?? false);
            if (count === 3 || (active && count === 2)) {
                yield c;
            }
        }
    })()]);
};

const part2 = (conway: Conway): number => {
    for (let i = 0; i < 6; ++i) {
        conway = step(conway);
    }

    return conway.size;
};

(async () => {
    const lines = await readInputLines('day17');
    const conway = parse(lines);

    console.log(part2(conway));
})();