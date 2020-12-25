import { readInputLines, repeatFn } from "../shared/utils";

const loop = (curr: number, sub: number): number => (curr * sub) % 20201227;

const findSize = (curr: number, goal: number, sub: number): number => {
    let size = 0;
    while (curr !== goal) {
        [size, curr] = [size + 1, loop(curr, sub)];
    }

    return size;
};

const day25 = ([pk1, pk2]: [number, number]): number =>
    repeatFn(1, findSize(1, pk1, 7), c => loop(c, pk2));

(async () => {
    const lines = await readInputLines('day25');
    const [pk1, pk2] = lines.map(x => parseInt(x, 10));

    console.log(day25([pk1, pk2]));
})();