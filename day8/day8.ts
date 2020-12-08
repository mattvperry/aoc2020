import { readInputLines } from "../shared/utils";

type Op = 'nop' | 'acc' | 'jmp';
type Instr = [Op, number];

interface Result extends Pick<ProgramState, 'accumulator'> {
    success: boolean;
}

interface ProgramState {
    instructions: Instr[];
    ptr: number;
    accumulator: number;
    seen: Set<number>;
}

const parse = (line: string): Instr => {
    const [op, num] = line.split(' ');
    return [op as Op, parseInt(num, 10)];
};

const step = (program: ProgramState): ProgramState => {
    const [op, num] = program.instructions[program.ptr];
    switch (op) {
        case 'acc':
            return {
                ...program,
                accumulator: program.accumulator + num,
                ptr: program.ptr + 1,
                seen: program.seen.add(program.ptr),
            }
        case 'jmp':
            return {
                ...program,
                ptr: program.ptr + num,
                seen: program.seen.add(program.ptr),
            }
        case 'nop':
            return {
                ...program,
                ptr: program.ptr + 1,
                seen: program.seen.add(program.ptr),
            }
    }
};

const run = (instructions: Instr[]): Result => {
    let program: ProgramState = {
        instructions,
        ptr: 0,
        accumulator: 0,
        seen: new Set<number>(),
    };

    while (true) {
        if (program.ptr === instructions.length) {
            return {
                accumulator: program.accumulator,
                success: true,
            }
        }

        if (program.ptr < 0
            || program.ptr > instructions.length
            || program.seen.has(program.ptr)) {
            return {
                accumulator: program.accumulator,
                success: false,
            }
        }

        program = step(program);
    }
}

function* modify(instructions: Instr[]): IterableIterator<Instr[]> {
    let past: Instr[] = [];
    let [[op, num], ...tail] = instructions;
    while (tail.length > 0) {
        switch (op) {
            case 'nop':
                yield [...past, ['jmp', num], ...tail];
                break;
            case 'jmp':
                yield [...past, ['nop', num], ...tail];
                break;
        }

        past = [...past, [op, num]];
        [[op, num], ...tail] = tail;
    }
};

const part1 = (instructions: Instr[]): number => run(instructions).accumulator;

const part2 = (instructions: Instr[]): number => {
    for (const is of modify(instructions)) {
        const result = run(is);
        if (result.success) {
            return result.accumulator;
        }
    }

    return -1;
}

(async () => {
    const lines = await readInputLines('day8');
    const instructions = lines.map(parse);

    console.log(part1(instructions));
    console.log(part2(instructions));
})();