import { isDefined, readInputLines } from "../shared/utils";

type Token
    = { type: 'lit', value: string }
    | { type: 'add' }
    | { type: 'mul' }
    | { type: 'lpar' }
    | { type: 'rpar' }

type Expr
    = { type: 'lit', value: bigint }
    | { type: 'add', left: Expr, right: Expr }
    | { type: 'mul', left: Expr, right: Expr }

const tokenize = (line: string): Token[] => {
    return line.split(' ').flatMap<Token>(w => {
        if (w === '+') {
            return [{ type: 'add' }];
        }

        if (w === '*') {
            return [{ type: 'mul' }];
        }

        if (w.startsWith('(')) {
            return [{ type: 'lpar' }, ...tokenize(w.slice(1))];
        }

        if (w.endsWith(')')) {
            return [...tokenize(w.slice(0, w.length - 1)), { type: 'rpar' }];
        }

        return [{ type: 'lit', value: w as `${number}` }];
    });
};

const findRpar = (tokens: Token[]): number => {
    let lefts = 1;
    for (let i = 0; i < tokens.length; ++i) {
        const curr = tokens[i];
        if (curr.type === 'lpar') {
            lefts = lefts + 1;
        }

        if (curr.type === 'rpar') {
            lefts = lefts - 1;
        }

        if (lefts === 0) {
            return i;
        }
    }

    return -1;
};

const parseSub = (tokens: Token[]): [Expr | undefined, Token[]] => {
    const [top, ...rest] = tokens;
    if (top.type === 'lit') {
        return [
            { type: 'lit', value: BigInt(top.value) },
            rest
        ];
    }

    if (top.type === 'lpar') {
        const idx = findRpar(rest);
        if (idx !== -1) {
            const [expr] = parseExpr(rest.slice(0, idx));
            if (isDefined(expr)) {
                return [expr, rest.slice(idx + 1)];
            }
        }
    }

    return [undefined, tokens];
};

const parseExpr = (tokens: Token[]): [Expr | undefined, Token[]] => {
    const [left, a] = parseSub(tokens);
    if (!isDefined(left)) {
        throw new SyntaxError(`Syntax error`);
    }

    if (a.length === 0) {
        return [left, a];
    }

    const [op, ...b] = a;
    if (op.type !== 'add' && op.type !== 'mul') {
        throw new SyntaxError(`Syntax error`);
    }

    const [right, c] = parseExpr(b);
    if (!isDefined(right)) {
        throw new SyntaxError(`Syntax error`);
    }

    return [{ type: op.type, left, right }, c];
};

const parse = (tokens: Token[]): Expr => {
    const [expr] = parseExpr(tokens);
    if (!isDefined(expr)) {
        throw new SyntaxError(`Syntax Error`);
    }

    return expr;
};

const read = (line: string): Expr => parse(tokenize(line));

const run = (expr: Expr): bigint => {
    switch (expr.type) {
        case 'lit':
            return expr.value;
        case 'add':
            return run(expr.left) + run(expr.right);
        case 'mul':
            return run(expr.left) * run(expr.right);
    }
};

const part1 = (exprs: Expr[]): bigint =>
    exprs.map(run).reduce((acc, curr) => acc + curr);

(async () => {
    const lines = await readInputLines('day18');
    const exprs = lines.map(read);

    exprs.map(run).forEach(console.log.bind(console));
    console.log(part1(exprs));
})();