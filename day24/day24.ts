import { countBy, map, readInputLines, repeatFn } from "../shared/utils";

type Dir = keyof (typeof dirs);
type Coord = [number, number, number];
type CoordS = `${number}_${number}_${number}`;
type Floor = Map<CoordS, boolean>;

const dirs = {
    'nw': [-1, 0, 1],
    'ne': [0, 1, 1],
    'w': [-1, -1, 0],
    'sw': [0, -1, -1],
    'se': [1, 0, -1],
    'e': [1, 1, 0],
};

const parse = (line: string): Dir[] => {
    if (line === '') {
        return [];
    }

    const match = /^(nw|ne|w|sw|se|e)([nsew]*)$/.exec(line);
    if (!match) {
        throw new Error(`Could not parse ${line}`);
    }

    return [match[1] as Dir].concat(parse(match[2]));
};

const toStr = ([x, y, z]: Coord): CoordS => `${x}_${y}_${z}` as const;

const fromStr = (str: CoordS): Coord => str.split('_').map(n => parseInt(n, 10)) as Coord;

const follow = (tile: Dir[]): Coord => tile.reduce(([x, y, z], dir) => {
    const [dx, dy, dz] = dirs[dir];
    return [x + dx, y + dy, z + dz];
}, [0, 0, 0]);

const init = (tiles: Dir[][]): Floor => {
    const flipped = new Map<CoordS, boolean>();
    for (const tile of tiles) {
        const end = toStr(follow(tile));
        const curr = flipped.get(end);
        flipped.set(end, !(curr ?? false));
    }

    return flipped;
};

const neighboors = (str: CoordS): CoordS[] => {
    const [x, y, z] = fromStr(str);
    return Object.values(dirs).map(([dx, dy, dz]) => toStr([x + dx, y + dy, z + dz]));
}

function* expand(floor: Floor): Iterable<readonly [CoordS, boolean]> {
    for (const [coord, active] of floor) {
        yield [coord, active] as const;
        yield* map(neighboors(coord), n => [n, floor.get(n) ?? false] as const);
    }
}

function* step(floor: Floor): Iterable<readonly [CoordS, boolean]> {
    for (const [c, active] of floor) {
        const count = countBy(neighboors(c), x => floor.get(x) ?? false);
        if (active && (count !== 0 && count <= 2)) {
            yield [c, true];
        }

        if (!active && count === 2) {
            yield [c, true];
        }
    }
}

const day23 = (tiles: Dir[][]): [number, number] => {
    const start = init(tiles);
    const end = repeatFn(start, 100, f =>
        new Map(step(new Map(expand(f))))
    );
    return [
        countBy(start.values(), x => x),
        countBy(end.values(), x => x),
    ];
};

(async () => {
    const lines = await readInputLines('day24');
    const tiles = lines.map(parse);
    
    const [part1, part2] = day23(tiles);
    console.log(part1);
    console.log(part2);
})();