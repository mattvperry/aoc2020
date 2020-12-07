import { countBy, Entries, fromEntries, readInputLines } from "../shared/utils";

type BagColor = string;
type ColorGraph = Record<BagColor, (readonly [BagColor, number])[]>;

const parse = (line: string): Entries<ColorGraph> => {
    const [first, ...rest] = line.split(',');
    const [bag, contains] = first.split('contain');
    const [keyColor1, keyColor2] = bag.split(' ');
    const key = `${keyColor1} ${keyColor2}`;
    if (contains.endsWith('no other bags.')) {
        return [key, []];
    }

    const value = [contains, ...rest].map(x => {
        const [num, color1, color2] = x.trim().split(' ');
        return [`${color1} ${color2}`, parseInt(num, 10)] as const;
    });
    return [key, value];
};

const hasPath = (graph: ColorGraph, from: BagColor, to: BagColor): boolean => {
    let explore = graph[from];
    while (explore.length !== 0) {
        const [[node], ...tail] = explore;
        if (node === to) {
            return true;
        }

        const children = explore.flatMap(([node]) => graph[node] ?? []);
        explore = tail.concat(children);
    }

    return false;
};

const part1 = (graph: ColorGraph): number =>
    countBy(Object.keys(graph), key => hasPath(graph, key, 'shiny gold'));

(async () => {
    const lines = await readInputLines('day7');
    const graph = fromEntries(lines.map(parse));

    console.log(part1(graph));
    console.log();
})();