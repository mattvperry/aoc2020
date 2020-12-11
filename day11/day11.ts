import { countBy, Entries, fromEntries, isDefined, readInputLines } from "../shared/utils";

type Pos = readonly [number, number];
type Adjacent = (pos: Pos, seats: Seats, dx: number, dy: number) => Pos;
type Seats = Partial<Record<string, boolean>>;
type Room = {
    seats: Seats;
    width: number;
    height: number;
};

function* parse(lines: string[]): Iterable<Entries<Seats>> {
    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            const char = lines[y][x];
            if (char === '.') {
                continue;
            }

            yield [toStr([x, y]), false];
        }
    }
};

const fromStr = (str: string): Pos => {
    const [x, y] = str.split(',').map(x => parseInt(x, 10));
    return [x, y] as const;
}

const toStr = (pos: Pos): string => pos.join(',');

const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
] as const;

function* changes(seats: Seats, rule: number, adj: Adjacent): Iterable<Entries<Seats>> {
    for (const pos of Object.keys(seats)) {
        const neighboors = dirs.map(([dx, dy]) => adj(fromStr(pos), seats, dx, dy))
        const occupied = countBy(neighboors, x => seats[toStr(x)] ?? false);
        if (seats[pos] && occupied >= rule) {
            yield [pos, false];
        } else if (!seats[pos] && occupied === 0) {
            yield [pos, true];
        }
    }
};

const settle = (seats: Seats, rule: number, adj: Adjacent): number => {
    while (true) {
        const cs = fromEntries(changes(seats, rule, adj));
        if (Object.keys(cs).length === 0) {
            break;
        }

        seats = { ...seats, ...cs };
    }

    return countBy(Object.values(seats), x => x ?? false);
};

const part1 = ({ seats }: Room): number => settle(seats, 4, ([x, y], _, dx, dy) => {
    return [x + dx, y + dy];
});

const part2 = ({ seats, width, height }: Room): number => settle(seats, 5, ([x, y], seats, dx, dy) => {
    while (x < width && x > -1 && y < height && y > -1) {
        [x, y] = [x + dx, y + dy];
        if (isDefined(seats[toStr([x, y])])) {
            return [x, y];
        }
    }

    return [x, y];
});

(async () => {
    const lines = await readInputLines('day11');
    const room = {
        seats: fromEntries(parse(lines)),
        width: lines[0].length,
        height: lines.length,
    };

    console.log(part1(room));
    console.log(part2(room));
})();