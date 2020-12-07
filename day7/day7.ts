import { countBy, Entries, fromEntries, memoize, readInputLines } from "../shared/utils";

type BagColor = string;
type ColorGraph = Record<BagColor, (readonly [BagColor, number])[]>;

const parse = (line: string): Entries<ColorGraph> => {
    const [first, ...rest] = line.split(',');
    const [bag, contains] = first.split('contain');
    const [keyColor1, keyColor2] = bag.split(' ');
    const key = `${keyColor1} ${keyColor2}`;
    const value = !contains.endsWith('no other bags.') ? [contains, ...rest].map(x => {
        const [num, color1, color2] = x.trim().split(' ');
        return [`${color1} ${color2}`, parseInt(num, 10)] as const;
    }) : [];
    return [key, value];
};

const hasPath = memoize(
    (graph: ColorGraph, from: BagColor, to: BagColor): boolean =>
        from !== to
            ? graph[from].some(([node]) => hasPath(graph, node, to))
            : true,
    (_, f, __) => f);

const countBags = memoize(
    (graph: ColorGraph, bag: BagColor): number =>
        1 + graph[bag].reduce((acc, [color, num]) => acc + (num * countBags(graph, color)), 0),
    (_, c) => c);

const target = 'shiny gold';

const part1 = (graph: ColorGraph): number =>
    countBy(Object.keys(graph), key => key !== target && hasPath(graph, key, target));

const part2 = (graph: ColorGraph): number =>
    countBags(graph, target) - 1;

(async () => {
    const lines = await readInputLines('day7');
    const graph = fromEntries(lines.map(parse));

    console.log(part1(graph));
    console.log(part2(graph));
})();