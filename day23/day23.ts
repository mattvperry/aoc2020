import { mod, readInputLines, repeatFn, splitAt, splitOn } from "../shared/utils";

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

const move2 = ([cups, curr]: [Cups, number]): [Cups, number] => {
    const size = cups.length
    let dest = wrapPred(cups[curr], size);

    const toMove = curr + 3 >= size
        ? curr === size - 1
        ? cups.splice(0, 3)
        : [...cups.splice(curr + 1), ...cups.splice(0, 3 - (size - curr - 1))]
        : cups.splice(curr + 1, 3);
        
    while (toMove.includes(dest)) {
        dest = wrapPred(dest, size);
    }

    const insert = cups.indexOf(dest);
    if (insert === -1) {
        throw new Error(`Couldn't find destination: ${dest}`);
    }

    const next = cups[curr >= cups.length - 1 ? 0 : curr + 1];
    cups.splice(insert + 1, 0, ...toMove);
    return [cups, cups.indexOf(next)];
};

const print = (cups: Cups): string =>
    splitOn(cups, 1).reverse().map(x => x.join('')).join('');

function* extra(): Iterable<number> {
    for (let x = 10; x <= 1000000; ++x) {
        yield x;
    }
}

const part1 = (cups: Cups): string =>
    print(repeatFn([cups, 0], 100, move2)[0]);

const part2 = (cups: Cups): string =>
    print(repeatFn([[...cups, ...extra()], 0], 10000000, move2)[0]);

(async () => {
    const lines = await readInputLines('day23');
    const cups = lines[0].split('').map(d => parseInt(d, 10));

    console.log(part1(cups));
    console.log(part2(cups));
})();