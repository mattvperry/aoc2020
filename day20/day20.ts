import { countBy, isDefined, readInputLines, splitOn } from "../shared/utils";

type Image = string[];

type Tile = {
    id: number,
    middle: Image;
    top: string;
    bottom: string;
    left: string;
    right: string;
}

type Side = Exclude<keyof Tile, 'grid' | 'id'>;

const flip = (image: Image): Image =>
    image.map(s => s.split('').reverse().join(''));

const rotate = (image: Image): Image => image[0]
    .split('')
    .map((_, i) => image.map(r => r[i]).reverse().join(''));

const orient = (image: Image): Image[] => Array.from((function*() {
    for (let i = 0; i < 4; ++i) {
        yield image;
        image = rotate(image);
    }

    image = flip(image);
    for (let i = 0; i < 4; ++i) {
        yield image;
        image = rotate(image);
    }
})());

const edges = (tile: Tile): string[] => [
    tile.top,
    tile.bottom,
    tile.left,
    tile.right
];

const parse = (lines: string[]): Tile[] => {
    if (lines.length === 0) {
        return [];
    }

    const [first, rest] = splitOn(lines, '');
    const [idStr, ...image] = first;
    const id = parseInt(idStr.split(' ')[1].slice(0, idStr.length - 1), 10);
    const tiles = orient(image).map(o => ({ 
        id,
        middle: o.slice(1, o.length - 1).map(s => s.slice(1, s.length - 1)),
        top: o[0],
        bottom: o[o.length - 1],
        left: o.map(r => r[0]).join(''),
        right: o.map(r => r[r.length - 1]).join('')
    }));

    return tiles.concat(parse(rest));
};

const overlap = (id: number, tiles: Tile[]): Tile[] => {
    const target = tiles.filter(t => t.id === id);
    const others = tiles.filter(t => t.id !== id);
    const es = new Set(target.flatMap(edges));
    return others.filter(o => edges(o).some(e => es.has(e)));
};

const findMatch = (tiles: Tile[], side: Side, edge: string): Tile | undefined =>
    tiles.find(g => g[side] === edge);

const align = (corners: Tile[], sides: Tile[], middle: Tile[]): Tile[][] => {
    const topLeft = corners.find(c => {
        const overlaps = overlap(c.id, corners.concat(sides)).flatMap(edges);
        return overlaps.includes(c.bottom) && overlaps.includes(c.right);
    });
    if (!isDefined(topLeft)) {
        throw new Error();
    }

    const size = (sides.length / 32) + 2;
    const final = Array.from(Array<Tile[]>(size), _ => Array<Tile>(size));

    corners = corners.filter(c => c.id !== topLeft.id);
    final[0][0] = topLeft;
    for (let i = 1; i < size - 1; ++i) {
        const match = findMatch(sides, 'left', final[0][i - 1].right);
        if (!isDefined(match)) {
            throw new Error();
        }

        sides = sides.filter(s => s.id !== match.id);
        final[0][i] = match;
    }

    const topRight = findMatch(corners, 'left', final[0][size - 2].right);
    if (!isDefined(topRight)) {
        throw new Error();
    }

    corners = corners.filter(c => c.id !== topRight.id);
    final[0][size - 1] = topRight;

    for (let i = 1; i < size - 1; ++i) {
        const first = findMatch(sides, 'top', final[i - 1][0].bottom);
        if (!isDefined(first)) {
            throw new Error();
        }

        sides = sides.filter(s => s.id !== first.id);
        final[i][0] = first

        for (let j = 1; j < size - 1; ++j) {
            const match = findMatch(middle, 'left', final[i][j - 1].right);
            if (!isDefined(match)) {
                throw new Error();
            }

            middle = middle.filter(r => r.id !== match.id);
            final[i][j] = match;
        }

        const last = findMatch(sides, 'left', final[i][size - 2].right);
        if (!isDefined(last)) {
            throw new Error();
        }

        sides = sides.filter(s => s.id !== last.id);
        final[i][size - 1] = last;
    }

    const bottomLeft = findMatch(corners, 'top', final[size - 2][0].bottom);
    if (!isDefined(bottomLeft)) {
        throw new Error();
    }

    corners = corners.filter(c => c.id !== bottomLeft.id);
    final[size - 1][0] = bottomLeft;

    for (let i = 1; i < size - 1; ++i) {
        const match = findMatch(sides, 'left', final[size - 1][i - 1].right);
        if (!isDefined(match)) {
            throw new Error();
        }

        sides = sides.filter(s => s.id !== match.id);
        final[size - 1][i] = match;
    }

    const bottomRight = findMatch(corners, 'left', final[size - 1][size - 2].right);
    if (!isDefined(bottomRight)) {
        throw new Error();
    }

    corners = corners.filter(c => c.id !== bottomRight.id);
    final[size - 1][size - 1] = bottomRight;

    return final;
}

const connect = (aligned: Tile[][]): Image => Array.from((function*() {
    for (const row of aligned) {
        const mids = row.map(t => t.middle);
        for (let i = 0; i < mids[0].length; ++i) {
            yield mids.map(r => r[i]).join('');
        }
    }
})());

const shape = [
    [0, 0],
    [1, 1],
    [4, 1],
    [5, 0],
    [6, 0],
    [7, 1],
    [10, 1],
    [11, 0],
    [12, 0],
    [13, 1],
    [16, 1],
    [17, 0],
    [18, 0],
    [18, -1],
    [19, 0],
];

const monsters = (image: Image): number => countBy((function*() {
    for (let y = 1; y < image.length - 1; ++y) {
        for (let x = 0; x < image[0].length - 20; ++x) {
            yield shape.map(([dx, dy]) => [x + dx, y + dy] as const);
        }
    }
})(), cs => cs.every(([x, y]) => image[x][y] === '#'));

const day20 = (tiles: Tile[]): [number, number] => {
    const corners = tiles.filter(t => overlap(t.id, tiles).length === 16);
    const sides = tiles.filter(t => overlap(t.id, tiles).length === 24);
    const middle = tiles.filter(t => overlap(t.id, tiles).length === 32);

    const image = connect(align(corners, sides, middle));

    const total = countBy(image.flatMap(x => x.split('')), c => c === '#');
    const monster = orient(image).map(o => monsters(o) * 15).reduce((acc, curr) => acc + curr);

    return [
        [...new Set(corners.map(c => c.id))].reduce((acc, curr) => acc * curr),
        total - monster,
    ];
};

(async () => {
    const lines = await readInputLines('day20');
    let tiles = parse(lines);

    const [part1, part2] = day20(tiles);
    console.log(part1);
    console.log(part2);
})();