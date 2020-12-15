import { fromEntries, readInputLines } from "../shared/utils";

type State = {
    turn: number;
    prev: number;
    spoken: Partial<Record<number, number[]>>;
}

function* sequence(start: number[]): Iterable<[number, number]> {
    yield* start.map((x, i) => [x, i + 1] as [number, number]);

    const state: State = {
        prev: start[start.length - 1],
        turn: start.length + 1,
        spoken: fromEntries(start.map((x, i) => [x, [i + 1]] as [number, number[]])),
    };

    while (true) {
        const turns = state.spoken[state.prev] ?? [];
        const val = turns.length <= 1 ? 0 : turns[0] - turns[1];
        yield [val, state.turn];

        const valTurns = state.spoken[val];
        state.prev = val;
        state.spoken[val] = valTurns
            ? [state.turn, valTurns[0]]
            : [state.turn];
        state.turn = state.turn + 1;
    };
}

(async () => {
    const lines = await readInputLines('day15');
    const start = lines[0].split(',').map(x => parseInt(x, 10));

    for (const [x, i] of sequence(start)) {
        if (i === 2020) {
            console.log(x);
        }

        if (i === 30000000) {
            console.log(x);
            break;
        }
    }
})();