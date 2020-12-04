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
        in: digitsInRange(59, 76),
        cm: digitsInRange(150, 193),
    };

    const unit = x.slice(x.length - 2, x.length);
    return ranges.hasOwnProperty(unit)
        ? ranges[unit as keyof typeof ranges](x.slice(0, x.length - 2))
        : false;
};

const regexTest = (regex: RegExp): (x: string) => boolean => x => regex.test(x);

const fields = [
    { type: 'byr', required: true, valid: digitsInRange(1920, 2002) },
    { type: 'iyr', required: true, valid: digitsInRange(2010, 2020) },
    { type: 'eyr', required: true, valid: digitsInRange(2020, 2030) },
    { type: 'hgt', required: true, valid: hgt },
    { type: 'hcl', required: true, valid: regexTest(/^#[\da-f]{6}$/) },
    { type: 'ecl', required: true, valid: regexTest(/^(amb|blu|brn|gry|grn|hzl|oth)$/) },
    { type: 'pid', required: true, valid: regexTest(/^\d{9}$/) },
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