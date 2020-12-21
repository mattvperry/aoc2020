import { countBy, intersect, isDefined, readInputLines, splitOn } from "../shared/utils";

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

const popTopLeft = (tiles: Tile[]): [Tile, Tile[]] => {
    const match = tiles.find(({ id, bottom, right }) => {
        const target = new Set(tiles.filter(t => t.id === id).flatMap(edges));
        const others = new Set(tiles.filter(t => t.id !== id).flatMap(edges));
        const overlaps = intersect(target, others);
        return overlaps.size === 4
            && overlaps.has(bottom)
            && overlaps.has(right);
    });
    if (!isDefined(match)) {
        throw new Error('Cannot find top left corner');
    }

    return [match, tiles.filter(t => t.id !== match.id)];
};

const popMatch = (tiles: Tile[], side: Side, edge: string): [Tile, Tile[]] => {
    const match = tiles.find(g => g[side] === edge);
    if (!isDefined(match)) {
        throw new Error('Cannot find connecting tile');
    }

    return [match, tiles.filter(t => t.id !== match.id)];
}

const align = (tiles: Tile[]): Tile[][] => {
    const size = Math.sqrt(tiles.length / 8);
    const result = Array.from(Array(size), _ => Array<Tile>(size));

    for (let row = 0; row < result.length; ++row) {
        [result[row][0], tiles] = row === 0
            ? popTopLeft(tiles)
            : popMatch(tiles, 'top', result[row - 1][0].bottom);

        for (let col = 1; col < result.length; ++col) {
            [result[row][col], tiles] = popMatch(tiles, 'left', result[row][col - 1].right);
        }
    }

    return result;
};

const connect = (aligned: Tile[][]): Image => Array.from((function*() {
    for (const mids of aligned.map(r => r.map(t => t.middle))) {
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
    const aligned = align(tiles);

    const corners = [
        aligned[0][0],
        aligned[aligned.length - 1][0],
        aligned[0][aligned.length - 1],
        aligned[aligned.length - 1][aligned.length - 1],
    ];

    const image = connect(aligned);
    const total = countBy(image.flatMap(x => x.split('')), c => c === '#');
    const monster = orient(image).map(o => monsters(o) * 15).reduce((acc, curr) => acc + curr);

    return [
        corners.map(t => t.id).reduce((acc, curr) => acc * curr),
        total - monster,
    ];
};

(async () => {
    const lines = await readInputLines('day20');
    const tiles = parse(lines);

    const [part1, part2] = day20(tiles);
    console.log(part1);
    console.log(part2);
})();