import { readInputLines, splitAt } from "../shared/utils";

const decode = (code: string): number => {
    const binary = Array.from(code, x => /(L|F)/.test(x) ? 0 : 1).join('');
    const [row, col] = splitAt(binary, 7);
    return parseInt(row, 2) * 8 + parseInt(col, 2);
};

const part1 = (ids: number[]): number => 
    ids.reduce((acc, curr) => curr > acc ? curr : acc);

const part2 = (ids: number[]): number => {
    let [prev, ...rest] = ids.sort();
    for (const id of rest) {
        if (id !== prev + 1) {
            return prev + 1;
        }

        prev = id;
    }

    return -1;
};

(async () => {
    const lines = await readInputLines('day5');
    const seatIds = lines.map(decode);

    console.log(part1(seatIds));
    console.log(part2(seatIds));
})();