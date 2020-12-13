import { isDefined, mod, readInputLines } from "../shared/utils";

type Id = number | 'x';

const nextDeparture = (timestamp: number, id: number): number => id - mod(timestamp, id);

const modInv = (a: bigint, m: bigint): bigint => {
    if (m === 1n) {
        return 0n;
    }

    const m0 = m;
    let [x0, x1] = [0n, 1n];

    while (a > 1) {
        const q = a / m;
        [m, a] = [a % m, m];
        [x0, x1] = [x1 - (q * x0), x0];
    }

    if (x1 < 0) {
        x1 = x1 + m0;
    }

    return x1;
};

const crt = (an: (readonly [bigint, bigint])[]): bigint => {
    const prod = an.reduce((acc, curr) => acc * curr[0], 1n);
    const result = an.reduce((acc, [a, n]) => {
        const pp = prod / a;
        return acc + (n * modInv(pp, a) * pp);
    }, 0n);

    return result % prod;
};

const part1 = (timestamp: number, ids: Id[]): number => {
    const [a, b] = ids
        .filter((i): i is number => i !== 'x')
        .map(i => [i, nextDeparture(timestamp, i)] as const)
        .reduce(([mi, md], [i, d]) => d < md ? [i, d] : [mi, md]);

    return a * b;
};

const part2 = (ids: Id[]): bigint => {
    const an = ids
        .map((x, i) => x === 'x' ? undefined : [BigInt(x), BigInt(x - i)] as const)
        .filter(isDefined);

    return crt(an);
};

(async () => {
    const [first, second] = await readInputLines('day13');
    const timestamp = parseInt(first, 10);
    const ids = second.split(',').map(i => i === 'x' ? 'x' : parseInt(i, 10));

    console.log(part1(timestamp, ids));
    console.log(part2(ids));
})();