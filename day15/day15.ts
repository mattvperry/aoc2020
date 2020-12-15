import { readInputLines } from "../shared/utils";

function* sequence(start: number[]): Iterable<readonly [number, number]> {
    const init = start.map((x, i) => [x, i + 1] as const);
    yield* init;

    let next = 0;
    let turn = start.length + 1;
    let spoken = new Map(init);

    while (true) {
        const curr = next;
        next = turn - (spoken.get(next) ?? turn);

        yield [curr, turn];
        spoken.set(curr, turn);

        turn = turn + 1;
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