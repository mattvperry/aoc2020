import { readInputLines, splitAt } from "../shared/utils";

const findRange = (nums: number[], target: number): number[] => {
    for (let i = 0; i < nums.length; ++i) {
        let sum = 0;
        let arr: number[] = [];
        for (let j = i; j < nums.length; ++j) {
            sum = sum + nums[j];
            arr = [...arr, nums[j]];
            if (sum === target) {
                return arr;
            } else if (sum > target) {
                break;
            }
        }
    }

    return [];
};

const part1 = (nums: number[]): number => {
    let [set, rest] = splitAt(nums, 25);
    for (const n of rest) {
        if (!set.some(x => set.includes(n - x))) {
            return n;
        }

        const [_, ...next] = set;
        set = [...next, n];
    }

    return -1;
};

const part2 = (nums: number[], target: number): number => {
    const [min, max] = findRange(nums, target).reduce(([min, max], curr) => [
        curr < min ? curr : min,
        curr > max ? curr : max
    ], [Infinity, -Infinity]);
    return min + max;
};

(async () => {
    const lines = await readInputLines('day9');
    const numbers = lines.map(l => parseInt(l, 10));

    const p1 = part1(numbers);
    console.log(p1);
    console.log(part2(numbers, p1));
})();