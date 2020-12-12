import { mod, readInputLines } from "../shared/utils";

type Dir = (typeof dirs)[number];
type Action = [Dir | 'L' | 'R' | 'F', number];
type Coord = [number, number];
type StateBase = { pos: Coord };
type StateP1 = StateBase & { facing: number };
type StateP2 = StateBase & { waypoint: Coord };

const dirs = [
    'N',
    'E',
    'S',
    'W',
] as const;

const deltas: Record<Dir, Coord> = {
    'N': [0, 1],
    'E': [1, 0],
    'S': [0, -1],
    'W': [-1, 0],
};

const parse = (line: string): Action => {
    const [op, ...rest] = line;
    return [op as Action[0], parseInt(rest.join(''), 10)];
}

const rotate = ([x, y]: Coord, times: number): Coord => {
    for (let i = 0; i < times; ++i) {
        [x, y] = [-y, x];
    }

    return [x, y];
};

const move = ([x, y]: Coord, amt: number, [dx, dy]: Coord): Coord => [
    x + (dx * amt),
    y + (dy * amt)
];

const step1 = ({ pos, facing }: StateP1, [op, amt]: Action): StateP1 => {
    switch (op) {
        case 'L':
            return { pos, facing: mod(facing - mod(amt / 90, 4), 4) }
        case 'R':
            return { pos, facing: mod(facing + mod(amt / 90, 4), 4) }
        case 'F':
            return { pos: move(pos, amt, deltas[dirs[facing]]), facing };
        default:
            return { pos: move(pos, amt, deltas[op]), facing };
    }
}

const step2 = ({ pos, waypoint }: StateP2, [op, amt]: Action): StateP2 => {
    switch (op) {
        case 'L':
            return { pos, waypoint: rotate(waypoint, mod(amt / 90, 4)) };
        case 'R':
            return { pos, waypoint: rotate(waypoint, 4 - mod(amt / 90, 4)) };
        case 'F':
            return { pos: move(pos, amt, waypoint), waypoint };
        default:
            return { pos, waypoint: move(waypoint, amt, deltas[op]) };
    }
};

const solve = <S extends StateBase>(initial: S, step: (state: S, action: Action) => S) => (actions: Action[]): number => {
    const { pos: [x, y] } = actions.reduce(step, initial);
    return Math.abs(x) + Math.abs(y);
};

const part1 = solve({ pos: [0, 0], facing: 1 }, step1);
const part2 = solve({ pos: [0, 0], waypoint: [10, 1] }, step2);

(async () => {
    const lines = await readInputLines('day12');
    const actions = lines.map(parse);

    console.log(part1(actions));
    console.log(part2(actions));
})();