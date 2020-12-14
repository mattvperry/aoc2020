import { fromEntries, isDefined, map, readInputLines } from "../shared/utils";

type Mask = ('X' | '1' | '0')[];
type State = {
    mask: Mask;
    memory: { [addr: string]: number | undefined };
};
type SetMem = { type: 'set', param: [number, number] };
type SetMask = { type: 'mask', param: Mask };
type Instr = SetMem | SetMask;

const parse = (line: string): Instr | undefined => {
    const mask = /mask = ([X01]{36})/.exec(line);
    if (mask) {
        return {
            type: 'mask',
            param: mask[1].split('') as Mask,
        };
    }

    const set = /mem\[(\d+)\] = (\d+)/.exec(line);
    if (set) {
        return {
            type: 'set',
            param: [parseInt(set[1], 10), parseInt(set[2], 10)]
        };
    }

    return undefined;
};

const bits = (x: number): string[] =>
    x.toString(2).padStart(36, '0').split('');

const bitAt = (x: number, at: number): '0' | '1' =>
    (x & (1 << (at - 1))) === 0 ? '0' : '1';

function* expand(mask: Mask, addr: number): Iterable<string> {
    const target = bits(addr).map((x, i) => mask[i] === '1' ? '1' : x);
    const idx = mask.map((x, i) => x === 'X' ? i : undefined).filter(isDefined);
    for (let c = 0; c < (2 ** idx.length); ++c) {
        const changes = fromEntries(idx.map((x, i) => [x, bitAt(c, idx.length - i)] as [number, string]));
        yield Object.assign([], target, changes).join('');
    }
}

const solve = (is: Instr[], setter: (m: Mask, i: SetMem['param']) => State['memory']): number => {
    const init: State = {
        mask: Array(36).fill('X'),
        memory: {},
    };

    const final = is.reduce(({ mask, memory }, curr) => {
        return curr.type === 'set'
            ? { mask, memory: { ...memory, ...setter(mask, curr.param) } }
            : { mask: curr.param, memory }
    }, init);

    return Object
        .values(final.memory)
        .filter(isDefined)
        .reduce((acc, curr) => acc + curr, 0);
};

const part1 = (is: Instr[]): number => solve(is, (mask, [addr, value]) => {
    const bs = bits(value).map((x, i) => mask[i] !== 'X' ? mask[i] : x);
    return {
        [`${addr}`]: parseInt(bs.join(''), 2),
    };
});

const part2 = (is: Instr[]): number => solve(is, (mask, [addr, value]) => {
    return fromEntries(map(expand(mask, addr), a => [a, value]));
});

(async () => {
    const lines = await readInputLines('day14');
    const is = lines.map(parse).filter(isDefined);

    console.log(part1(is));
    console.log(part2(is));
})();