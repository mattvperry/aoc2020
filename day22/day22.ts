import { readInputLines, splitOn } from "../shared/utils";

type Player = 'p1' | 'p2';
type Hand = number[];

const parse = (lines: string[]): [Hand, Hand] => {
    const [[, ...p1], [, ...p2]] = splitOn(lines, '');
    return [p1.map(c => parseInt(c, 10)), p2.map(c => parseInt(c, 10))];
};

const toStr = (hand: Hand): string => hand.map(c => c.toString()).join(',');

const play = (
    [p1, p2]: [Hand, Hand],
    [p1Mem, p2Mem]: [Set<string>, Set<string>],
    winner: (x: number, xs: Hand, y: number, ys: Hand) => Player
): [Player, Hand] => {
    while (p1.length !== 0 && p2.length !== 0) {
        if (p1Mem.has(toStr(p1)) || p2Mem.has(toStr(p2))) {
            return ['p1', p1];
        }

        p1Mem.add(toStr(p1));
        p2Mem.add(toStr(p2));

        const [[p1Top, ...p1Rest], [p2Top, ...p2Rest]] = [p1, p2];
        const w = winner(p1Top, p1Rest, p2Top, p2Rest);
        [p1, p2] = [
            [...p1Rest, ...(w === 'p1' ? [p1Top, p2Top] : [])],
            [...p2Rest, ...(w === 'p2' ? [p2Top, p1Top] : [])],
        ];
    }

    return p1.length !== 0 ? ['p1', p1] : ['p2', p2];
};

const score = (hand: Hand): number =>
    hand.reduce((acc, curr, i) => acc + (curr * (hand.length - i)), 0);

const part1 = (x: number, xs: Hand, y: number, ys: Hand): Player =>
    x >= y ? 'p1' : 'p2';

const part2 = (x: number, xs: Hand, y: number, ys: Hand): Player => {
    if (xs.length < x || ys.length < y) {
        return part1(x, xs, y, ys);
    }

    const [winner] = play(
        [xs.slice(0, x), ys.slice(0, y)],
        [new Set<string>(), new Set<string>()],
        part2
    );

    return winner;
};

const day22 = (hands: [Hand, Hand]): number[] => [part1, part2]
    .map(fn => play(hands, [new Set<string>(), new Set<string>()], fn))
    .map(([, hand]) => score(hand));

(async () => {
    const lines = await readInputLines('day22');
    const hands = parse(lines);

    const [part1, part2] = day22(hands);
    console.log(part1);
    console.log(part2);
})();