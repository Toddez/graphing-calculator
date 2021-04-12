import { evaluate } from 'mathjs';

export function processData(data: string): string {
    const parsedData = JSON.parse(data);

    const expressions = parsedData.expressions;
    const scope = parsedData.scope;

    const outData = {
        results: new Array(expressions.length).fill([])
    };

    // TODO: Expressions which doesn't depend on x or y should only be evaluated once
    try {
        console.time('Expression evaluation');
        const scopeVars = Object.keys(scope);
        let min = Infinity;
        let max = -Infinity;
        let step = Infinity;
        for (const variable of scopeVars) {
            min = Math.min(min, scope[variable].min);
            max = Math.max(max, scope[variable].max);
            step = Math.min(step, scope[variable].step);
            scope[variable].value = scope[variable].min;
        }

        for (let i = min; i <= max; i += step) {
            varLoop: for (const key of scopeVars) {
                const variable = scope[key];
                if (variable.min > i)
                    continue varLoop;

                if (variable.max < i)
                    continue varLoop;

                if (i % variable.step !== 0)
                    continue varLoop;

                variable.value = i;
            }

            const evalScope = { x: i, y: i };
            const results = evaluate(expressions.map((expr: Expression) => expr.code), evalScope);
            for (let index = 0; index < expressions.length; index++)
                outData.results[index] = [...outData.results[index], results[index]];
        }

        console.timeEnd('Expression evaluation');
    } catch {
        console.warn('Failed to evaluate expressions');
    }

    return JSON.stringify(outData);
}
