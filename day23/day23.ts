import { mod, readInputLines, splitAt, splitOn } from "../shared/utils";

type Cups = number[];

const wrapPred = (num: number, len: number): number => {
    const x = mod(num - 1, len);
    return x === 0 ? len : x;
}

const move = ([curr, x, y, z, ...rest]: Cups): Cups => {
    let dest = wrapPred(curr, rest.length + 4);
    while ([x, y, z].includes(dest)) {
        dest = wrapPred(dest, rest.length + 4);
    }

    const insert = rest.indexOf(dest);
    if (insert === -1) {
        throw new Error(`Couldn't find destination: ${dest}`);
    }

    const [before, after] = splitAt(rest, insert + 1);
    return [...before, x, y, z, ...after, curr];
};

const print = (cups: Cups): string =>
    splitOn(cups, 1).reverse().map(x => x.join('')).join('');

const repeat = <T>(x: T, times: number, fn: (x: T) => T): T => {
    for (let i = 0; i < times; ++i) {
        x = fn(x);
    }

    return x;
};

function* extra(): Iterable<number> {
    for (let x = 10; x <= 1000000; ++x) {
        yield x;
    }
}

const part1 = (cups: Cups): string =>
    print(repeat(cups, 100, move));

const part2 = (cups: Cups): string =>
    print(repeat([...cups, ...extra()], 10000000, move));

(async () => {
    const line = (await readInputLines('day23'))[0];
    const cups = line.split('').map(d => parseInt(d, 10));

    console.log(part1(cups));
    console.log(part2(cups));
})();