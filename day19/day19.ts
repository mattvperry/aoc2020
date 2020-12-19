import { countBy, isDefined, memoize, readInputLines, splitOn } from "../shared/utils";

type Rule = string;
type Rules = Map<number, Rule>;

const parse = (lines: string[]): [Rules, string[]] => {
    const [rs, input] = splitOn(lines, '');
    const entries = rs.map(r => {
        const [idx, rule] = r.split(': ');
        return [parseInt(idx, 10), rule] as const;
    });
    return [new Map(entries), input];
};

const expand = (overrides?: Map<number, (go: (id: number) => string) => string>) => {
    const go = memoize((id: number, rules: Rules): string => {
        const rule = rules.get(id);
        if (!isDefined(rule)) {
            throw new Error(`Undefined rule id '${id}'`);
        }

        const override = overrides?.get(id);
        if (isDefined(override)) {
            return override(x => go(x, rules));
        }

        const leaf = /"(\w+)"/.exec(rule);
        if (leaf) {
            return leaf[1];
        }

        const ors = rule
            .split(' | ')
            .map(o => o.split(' ').map(r => {
                const x = parseInt(r, 10);
                return go(x, rules);
            }).join(''));

        return `(${ors.join('|')})`;
    }, (i, rs) => rs.get(i) ?? '');

    return go;
};

const match = (id: number, rules: Rules, input: string, overrides?: Parameters<typeof expand>[0]): boolean => {
    const regex = new RegExp(`^${expand(overrides)(id, rules)}$`);
    return regex.test(input);
};

const part1 = (rules: Rules, input: string[]): number =>
    countBy(input, i => match(0, rules, i));

const part2 = (rules: Rules, input: string[]): number => {
    const overrides = new Map([
        [8, (go: (id: number) => string) => `(${go(42)})+`],
        [11, (go: (id: number) => string) => {
            const regexes = [];
            for (let i = 1; i <= 40; ++i) {
                regexes.push(`(${go(42)}){${i}}(${go(31)}){${i}}`);
            }

            return `(${regexes.join('|')})`;
        }]
    ]);

    return countBy(input, i => match(0, rules, i, overrides));
};

(async () => {
    const lines = await readInputLines('day19');
    const [rules, input] = parse(lines);

    console.log(part1(rules, input));
    console.log(part2(rules, input));
})();