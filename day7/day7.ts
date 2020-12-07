import { countBy, Entries, fromEntries, memoize, readInputLines } from "../shared/utils";

type BagColor = string;
type ColorGraph = Record<BagColor, (readonly [BagColor, number])[]>;

const parse = (line: string): Entries<ColorGraph> => {
    const [color, rest] = line.split(' bags contain ');
    const value = rest === 'no other bags.' ? [] : rest.split(', ').map(x => {
        const [num, color1, color2] = x.split(' ');
        return [`${color1} ${color2}`, parseInt(num, 10)] as const;
    });

    return [color, value];
};

const hasPath = memoize(
    (graph: ColorGraph, from: BagColor, to: BagColor): boolean => from !== to
        ? graph[from].some(([color]) => hasPath(graph, color, to))
        : true,
    (_, f, __) => f);

const countBags = memoize(
    (graph: ColorGraph, bag: BagColor): number =>
        1 + graph[bag].reduce((acc, [color, num]) => acc + (num * countBags(graph, color)), 0),
    (_, c) => c);

const day7 = (graph: ColorGraph): [number, number] => {
    const target = 'shiny gold';
    return [
        countBy(Object.keys(graph), color => color !== target && hasPath(graph, color, target)),
        countBags(graph, target) - 1,
    ];
};

(async () => {
    const lines = await readInputLines('day7');
    const graph = fromEntries(lines.map(parse));
    console.log(...day7(graph));
})();