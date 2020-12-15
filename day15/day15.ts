import { readInputLines } from "../shared/utils";

type State = {
    turn: number;
    prev: number;
    spoken: Map<number, readonly number[]>;
}

function* sequence(start: number[]): Iterable<readonly [number, number]> {
    yield* start.map((x, i) => [x, i + 1] as const);

    const state: State = {
        prev: start[start.length - 1],
        turn: start.length + 1,
        spoken: new Map(start.map((x, i) => [x, [i + 1]] as const)),
    };

    while (true) {
        const turns = state.spoken.get(state.prev) ?? [];
        const val = turns.length <= 1 ? 0 : turns[0] - turns[1];
        yield [val, state.turn];

        const valTurns = state.spoken.get(val);
        state.prev = val;
        state.spoken.set(val, valTurns
            ? [state.turn, valTurns[0]]
            : [state.turn]
        );
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