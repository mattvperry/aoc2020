import { Entries, fromEntries, isDefined, streamInputLinesAsync, reduceAsync } from "../shared/utils";

const digitsInRange = (min: number, max: number): (x: string) => boolean => x => {
    if (!/^\d+$/.test(x)) {
        return false;
    }

    const val = parseInt(x, 10);
    return val >= min && val <= max;
};

const hgt = (x: string): boolean => {
    const ranges = {
        cm: [150, 193],
        in: [59, 76],
    };

    const match = x.match(/^(\d+)(cm|in)$/);
    if (match === null) {
        return false;
    }

    const [min, max] = ranges[match[2] as ('cm' | 'in')];
    return digitsInRange(min, max)(match[1]);
};

const hcl = (x: string): boolean => /^#[\da-f]{6}$/.test(x);

const ecl = (x: string): boolean => /^(amb|blu|brn|gry|grn|hzl|oth)$/.test(x);

const pid = (x: string): boolean => /^\d{9}$/.test(x);

const fields = [
    { type: 'byr', required: true, valid: digitsInRange(1920, 2002) },
    { type: 'iyr', required: true, valid: digitsInRange(2010, 2020) },
    { type: 'eyr', required: true, valid: digitsInRange(2020, 2030) },
    { type: 'hgt', required: true, valid: hgt },
    { type: 'hcl', required: true, valid: hcl },
    { type: 'ecl', required: true, valid: ecl },
    { type: 'pid', required: true, valid: pid },
    { type: 'cid', required: false, valid: (_: string) => true },
] as const;

type Field = (typeof fields)[number];
type RequiredField = Exclude<Field, { required: false }>;
type FieldType = Field['type'];
type Passport = Partial<Record<FieldType, string>>;
type PassportEntry = Entries<Passport>;

const fieldNames = new Set<string>(fields.map(f => f.type));
const isFieldType = (key: string): key is FieldType => fieldNames.has(key);
const parse = (str: string): Passport => fromEntries(str
    .split(' ')
    .map((p): PassportEntry | undefined => {
        const [key, value] = p.split(':');
        return isFieldType(key) ? [key, value] : undefined;
    })
    .filter(isDefined));

async function* reader(lines: AsyncIterableIterator<string>): AsyncIterableIterator<Passport> {
    let current = '';
    for await (const line of lines) {
        if (line === '') {
            yield parse(current);
            current = '';
        } else {
            current = `${current} ${line}`;
        }
    }

    yield parse(current);
}

const day4 = (input: AsyncIterableIterator<Passport>): Promise<[number, number]> => {
    const requiredFields = fields.filter((f): f is RequiredField => f.required);
    return reduceAsync(input, [0, 0], ([part1, part2], curr) => {
        const present = requiredFields.every(({ type }) => isDefined(curr[type]));
        const valid = fields.every(({ type, valid }) => valid(curr[type] ?? ''));
        return Promise.resolve([part1 + (present ? 1 : 0), part2 + (valid ? 1 : 0)]);
    });
};

(async () => {
    const lines = streamInputLinesAsync('day4');
    const [part1, part2] = await day4(reader(lines));
    console.log(part1, part2);
})();