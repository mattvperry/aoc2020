import { readInputLines } from "../shared/utils";

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

type Precedence = Record<'add' | 'mul', number>;

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

const parsePrimary = (tokens: Token[], p: Precedence): [Expr, Token[]] => {
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
            const expr = parse(rest.slice(0, idx), p);
            return [expr, rest.slice(idx + 1)];
        }
    }

    throw new SyntaxError();
};

const parseExpr = (tokens: Token[], min: number, p: Precedence): [Expr, Token[]] => {
    let [lhs, [lookahead, ...rest]] = parsePrimary(tokens, p);
    while ((lookahead?.type === 'add' || lookahead?.type === 'mul') && p[lookahead.type] >= min) {
        const op = lookahead;
        const expr = parseExpr(rest, p[op.type], p);
        let rhs = expr[0];
        [lookahead, ...rest] = expr[1];
        lhs = { type: op.type, left: lhs, right: rhs };
    }

    return [lhs, rest];
};

const parse = (tokens: Token[], p: Precedence): Expr => {
    return parseExpr(tokens, 0, p)[0];
};

const shunting = (tokens: Token[], p: Precedence): Expr => {
    let output: Expr[] = [];
    let ops: (Exclude<Token['type'], 'lit'>)[] = [];
    for (const token of tokens) {
        switch (token.type) {
            case 'lit':
                output = [{ type: 'lit', value: BigInt(token.value) }, ...output];
                break;
            case 'add':
            case 'mul':
                let op = ops[0];
                while ((op === 'add' || op === 'mul') && p[op] >= p[token.type]) {
                    const [left, right, ...rest] = output;
                    output = [{ type: op, left, right }, ...rest];
                    [, ...ops] = ops;
                    op = ops[0];
                }

                ops = [token.type, ...ops];
                break;
            case 'lpar':
                ops = [token.type, ...ops];
                break;
            case 'rpar':
                let top = ops[0];
                while (top !== 'lpar' && top !== 'rpar') {
                    const [left, right, ...rest] = output;
                    output = [{ type: top, left, right }, ...rest];
                    [, ...ops] = ops;
                    top = ops[0];
                }

                if (top === 'lpar') {
                    [, ...ops] = ops;
                }
                break;
        }
    }

    for (const op of ops) {
        if (op !== 'add' && op !== 'mul') {
            continue;
        }

        const [left, right, ...rest] = output;
        output = [{ type: op, left, right }, ...rest];
    }

    return output[0]
};

const read = (line: string): Expr => shunting(tokenize(line), { 'add': 1, 'mul': 0 });

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

const part2 = (exprs: Expr[]): bigint =>
    exprs.map(run).reduce((acc, curr) => acc + curr);

(async () => {
    const lines = await readInputLines('day18');
    const exprs = lines.map(read);

    console.log(part2(exprs));
})();