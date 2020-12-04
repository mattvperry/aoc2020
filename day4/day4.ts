import { countBy, readInputLines } from "../shared/utils";

const digitsInRange = (length: number, min: number, max: number): (x: string) => boolean => x => {
    const match = x.match(`^\\d{${length}}$`);
    if (match === null) {
        return false;
    }

    const val = parseInt(match[0], 10);
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

    const val = parseInt(match[1], 10);
    const [min, max] = ranges[match[2] as ('cm' | 'in')];
    return val >= min && val <= max;
};

const hcl = (x: string): boolean => x.match(/^#[\da-f]{6}$/) !== null;

const ecl = (x: string): boolean => x.match(/^(amb|blu|brn|gry|grn|hzl|oth)$/) !== null;

const pid = (x: string): boolean => x.match(/^\d{9}$/) !== null;

const fields = [
    { type: 'byr', required: true, valid: digitsInRange(4, 1920, 2002) },
    { type: 'iyr', required: true, valid: digitsInRange(4, 2010, 2020) },
    { type: 'eyr', required: true, valid: digitsInRange(4, 2020, 2030) },
    { type: 'hgt', required: true, valid: hgt },
    { type: 'hcl', required: true, valid: hcl },
    { type: 'ecl', required: true, valid: ecl },
    { type: 'pid', required: true, valid: pid },
    { type: 'cid', required: false, valid: (_: string) => true },
] as const;

type Field = (typeof fields)[number];
type RequiredField = Exclude<Field, { required: false }>;
type FieldType = Field['type'];
type Passport = Record<FieldType, string | undefined>;

const requiredFields = fields.filter((f): f is RequiredField => f.required);

const parse = (str: string): Passport => str
    .split(' ')
    .map(p => p.split(':'))
    .reduce((acc, [type, value]) => ({ ...acc, [type]: value }), {} as Passport);

function* reader(lines: string[]): IterableIterator<Passport> {
    let current = '';
    for (const line of lines) {
        if (line === '') {
            yield parse(current);
            current = '';
        } else {
            current = `${current} ${line}`;
        }
    }

    yield parse(current);
}

const part1 = (input: Passport[]) => countBy(input, passport => requiredFields.every(({ type }) => passport[type] !== undefined));

const part2 = (input: Passport[]) => countBy(input, passport => fields.every(({ type, valid }) => valid(passport[type] ?? '')));

(async () => {
    const lines = await readInputLines('day4');
    const input = Array.from(reader(lines));

    console.log(part1(input));
    console.log(part2(input));
})();