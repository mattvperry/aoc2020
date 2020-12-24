import { mod, readInputLines } from "../shared/utils";

type Cups = Map<number, number>;

const init = (nums: number[]): [Cups, number] => {
    const entries = nums.map((x, i) => [x, nums[(i + 1) % nums.length]] as const);
    return [
        new Map(entries),
        nums[0],
    ];
};

const toArray = (cups: Cups, from: number, len: number) => Array.from((function*() {
    for (let i = 0; i < len; ++i) {
        from = cups.get(from) ?? -1;
        yield from;
    }
})());

const wrapPred = (num: number, len: number): number => {
    const x = mod(num - 1, len);
    return x === 0 ? len : x;
}

function* extra(): Iterable<number> {
    for (let x = 10; x <= 1000000; ++x) {
        yield x;
    }
}

const run = (nums: number[], times: number): Cups => {
    let [cups, curr] = init(nums);
    for (let i = 0; i < times; ++i) {
        const a = cups.get(curr) ?? -1;
        const b = cups.get(a) ?? -1;
        const c = cups.get(b) ?? -1;

        let dest = wrapPred(curr, cups.size);
        while (dest === a || dest === b || dest === c) {
            dest = wrapPred(dest, cups.size);
        }

        const next = cups.get(c) ?? -1;
        cups.set(curr, next);
        curr = next;

        const temp = cups.get(dest) ?? -1;
        cups.set(dest, a);
        cups.set(c, temp);
    }

    return cups;
}

const part1 = (nums: number[]): string => {
    const cups = run(nums, 100);
    return toArray(cups, 1, cups.size - 1).join('');
};

const part2 = (nums: number[]): number => {
    const cups = run([...nums, ...extra()], 10000000);
    return toArray(cups, 1, 2).reduce((acc, curr) => acc * curr);
};

(async () => {
    const lines = await readInputLines('day23');
    const nums = lines[0].split('').map(x => parseInt(x, 10));

    console.log(part1(nums));
    console.log(part2(nums));
})();