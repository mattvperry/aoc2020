import { mod, readInputLines } from "../shared/utils";

type Dir = 'N' | 'E' | 'S' | 'W';
type Action = [Dir | 'L' | 'R' | 'F', number];
type Coord = [number, number];
type State = { pos: Coord, waypoint: Coord };

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

const step = (mover: keyof State) => (state: State, [op, amt]: Action): State => {
    switch (op) {
        case 'L':
            return { ...state, waypoint: rotate(state.waypoint, mod(amt / 90, 4)) }
        case 'R':
            return { ...state, waypoint: rotate(state.waypoint, 4 - mod(amt / 90, 4)) }
        case 'F':
            return { ...state, pos: move(state.pos, amt, state.waypoint) };
        default:
            return { ...state, [mover]: move(state[mover], amt, deltas[op]) };
    }
};

const solve = (waypoint: Coord, fn: Parameters<typeof step>[0]) => (actions: Action[]): number => {
    const { pos: [x, y] } = actions.reduce(step(fn), { pos: [0, 0], waypoint });
    return Math.abs(x) + Math.abs(y);
};

const part1 = solve([1, 0], 'pos');
const part2 = solve([10, 1], 'waypoint');

(async () => {
    const lines = await readInputLines('day12');
    const actions = lines.map(parse);

    console.log(part1(actions));
    console.log(part2(actions));
})();