import { charFrequency, reduceAsync, streamInputLinesAsync } from "../shared/utils";

type Answers = string;
type Group = Answers[];

async function* reader(lines: AsyncIterableIterator<string>): AsyncIterableIterator<Group> {
    let current: string[] = [];
    for await (const line of lines) {
        if (line === '') {
            yield current;
            current = [];
        } else {
            current = [...current, line];
        }
    }

    yield current;
}

const day6 = (input: AsyncIterableIterator<Group>): Promise<[number, number]> => {
    return reduceAsync(input, [0, 0], async ([part1, part2], group) => {
        const values = Object.values(charFrequency(group.join('')));
        return [
            part1 + values.length,
            part2 + values.filter(v => v === group.length).length
        ];
    });
}

(async () => {
    const lines = streamInputLinesAsync('day6');
    const [part1, part2] = await day6(reader(lines));
    console.log(part1, part2);
})();