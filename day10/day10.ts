import { memoize, readInputLines } from "../shared/utils";

const part1 = (adapters: number[]): number => {
    let prev = 0;
    const diffs: Partial<Record<number, number>> = { 3: 1 };
    for (const a of adapters) {
        diffs[prev - a] = (diffs[prev - a] ?? 0) + 1;
        prev = a;
    }

    return (diffs[1] ?? 0) * (diffs[3] ?? 0);
};

const part2Rec = (adapters: number[]): number => {
    const paths = memoize((start: number, end: number, adapters: Set<number>): number => {
        if (start === end) {
            return 1;
        }

        return [1, 2, 3]
            .map(d => start + d)
            .filter(n => adapters.has(n))
            .reduce((acc, curr) => acc + paths(curr, end, adapters), 0);
    }, (s, _, __) => s);
    return paths(0, adapters[0], new Set<number>(adapters));
}

const part2DP = ([head, ...tail]: number[]): number => {
    var seed: Partial<Record<number, number>> = { [head]: 1 };
    var paths = [...tail, 0].reduce((acc, curr) => {
        acc[curr]
            = (acc[curr + 1] ?? 0)
            + (acc[curr + 2] ?? 0)
            + (acc[curr + 3] ?? 0);
        return acc;
    }, seed);

    return paths[0] ?? 0;
};

(async () => {
    const lines = await readInputLines('day10');
    const numbers = lines.map(l => parseInt(l, 10)).sort((a, b) => b - a);

    console.log(part1(numbers));
    console.log(part2Rec(numbers));
    console.log(part2DP(numbers));
})();