import { readInputLines } from '../shared/utils';

const helper = (data: Set<number>, target: number, test: (x: number) => [boolean, number]): number => {
    for (const n of data) {
        const [use, num] = test(target - n);
        if (use) {
            return n * num;
        }
    }

    return -1;
}

const part1 = (data: Set<number>): number => helper(data, 2020, x => [data.has(x), x]);

const part2 = (data: Set<number>): number => helper(data, 2020, x => {
    const other = helper(data, x, x => [data.has(x), x]);
    return [other !== -1, other];
});

(async () => {
    const input = await readInputLines('day1');
    const set = new Set(input.map(l => parseInt(l, 10)));

    console.log(part1(set));
    console.log(part2(set));
})();