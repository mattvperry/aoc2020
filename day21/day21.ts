import { countBy, difference, intersect, readInputLines } from "../shared/utils";

type Ingredient = string;
type Allergen = string;
type Input = [Set<Ingredient>, Set<Allergen>][];

const parse = (line: string): Input[number] => {
    const [is, as] = line.replace('(', '').replace(')', '').split(' contains ');
    return [new Set(is.split(' ')), new Set(as.split(', '))];
};

const solve = (input: Input): Map<Ingredient, Allergen> => {
    const map = new Map<Allergen, Set<Ingredient>>();
    for (const [is, as] of input) {
        for (const a of as) {
            const old = map.get(a);
            map.set(a, old ? intersect(old, is) : is);
        }
    }

    let entries = [...map];
    while (entries.some(([, is]) => is.size !== 1)) {
        const settled = new Set(entries
            .filter(([, is]) => is.size === 1)
            .flatMap(([, is]) => [...is]));

        entries = entries.map(([a, is]) => [a, is.size === 1 ? is : difference(is, settled)]);
    }

    return new Map(entries.map(([a, [i]]) => [i, a]));
};

const part1 = (input: Input, list: Map<Ingredient, Allergen>): number => {
    const all = input.flatMap(([is]) => [...is]);
    const notPossible = difference(new Set(all), new Set(list.keys()));
    return countBy(all, i => notPossible.has(i));
};

const part2 = (list: Map<Ingredient, Allergen>): string => [...list]
    .sort(([, a], [, b]) => a.localeCompare(b))
    .map(([a]) => a).join(',');

(async () => {
    const lines = await readInputLines('day21');
    const input = lines.map(parse);
    const list = solve(input);

    console.log(part1(input, list));
    console.log(part2(list));
})();