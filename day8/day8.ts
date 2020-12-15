import { map, readInputLines } from "../shared/utils";

type Op = 'nop' | 'acc' | 'jmp';
type Instr = [Op, number];

interface ProgramState {
    ptr: number;
    accumulator: number;
}

const parse = (line: string): Instr => {
    const [op, num] = line.split(' ');
    return [op as Op, parseInt(num, 10)];
};

const run = (instructions: Instr[]): ProgramState => {
    const seen = new Set<number>();
    let state: ProgramState = {
        ptr: 0,
        accumulator: 0,
    };

    while (state.ptr >= 0 && state.ptr < instructions.length && !seen.has(state.ptr)) {
        seen.add(state.ptr);
        const [op, num] = instructions[state.ptr];
        state = {
            ptr: state.ptr + (op === 'jmp' ? num : 1),
            accumulator: state.accumulator + (op === 'acc' ? num : 0),
        };
    }

    return state;
}

function* modify(instructions: Instr[]): IterableIterator<Instr[]> {
    for (let i = 0; i < instructions.length; ++i) {
        const [op, num] = instructions[i];
        if (op === 'acc') {
            continue;
        }

        yield Object.assign([], instructions, { [i]: [op === 'jmp' ? 'nop' : 'jmp', num] });
    }
};

const part1 = (instructions: Instr[]): number => run(instructions).accumulator;

const part2 = (instructions: Instr[]): number | undefined => {
    for (const result of map(modify(instructions), run)) {
        if (result.ptr === instructions.length) {
            return result.accumulator;
        }
    }
}

(async () => {
    const lines = await readInputLines('day8');
    const instructions = lines.map(parse);

    console.log(part1(instructions));
    console.log(part2(instructions));
})();