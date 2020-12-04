import { countBy, readInputLines } from "../shared/utils";

type Grid = string[][];

function* traverse(grid: Grid, right: number, down: number): IterableIterator<string> {
    let [x, y] = [0, 0];
    while (y < grid.length) {
        yield grid[y][x];
        [x, y] = [(x + right) % grid[0].length, y + down];
    }
}

const countTrees = (xs: IterableIterator<string>): number => countBy(xs, x => x === '#');

const part1 = (grid: Grid): number => countTrees(traverse(grid, 3, 1));

const part2 = (grid: Grid): number => {
    const slopes = [
        [1, 1],
        [3, 1],
        [5, 1],
        [7, 1],
        [1, 2]
    ];

    return slopes.reduce((acc, [right, down]) => acc * countTrees(traverse(grid, right, down)), 1);
}

(async () => {
    const input = await readInputLines('day3');
    const grid: Grid = input.map(l => l.split(''));

    console.log(part1(grid));
    console.log(part2(grid));
})();