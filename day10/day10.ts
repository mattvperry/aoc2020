import { memoize, readInputLines } from "../shared/utils";

const paths = memoize((start: number, end: number, adapters: Set<number>): number => {
    if (start === end) {
        return 1;
    }

    return [1, 2, 3]
        .map(d => start + d)
        .filter(n => adapters.has(n))
        .reduce((acc, curr) => acc + paths(curr, end, adapters), 0);
}, (s, _, __) => s);

const part1 = (adapters: number[]): number => {
    let prev = 0;
    const diffs: Partial<Record<number, number>> = { 3: 1 };
    for (const a of adapters) {
        diffs[a - prev] = (diffs[a - prev] ?? 0) + 1;
        prev = a;
    }

    return (diffs[1] ?? 0) * (diffs[3] ?? 0);
};

const part2 = (adapters: number[]): number => {
    const set = new Set<number>(adapters);
    return paths(0, adapters[adapters.length - 1], set);
}

(async () => {
    const lines = await readInputLines('day10');
    const numbers = lines.map(l => parseInt(l, 10)).sort((a, b) => a - b);

    console.log(part1(numbers));
    console.log(part2(numbers));
})();