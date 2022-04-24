import { evaluate } from "mathjs";
import memoize from "memoizee";

const evaluateExpressions = memoize(
  (
    expressions: Array<string>,
    scope: Record<string, number>
  ): Array<number> => {
    try {
      return evaluate(expressions, scope);
    } catch {
      return [];
    }
  },
  {
    primitive: true,
    normalizer: (args) => {
      return args[0].join() + JSON.stringify(args[1]);
    },
  }
);

let evalPromise: Promise<string> | null = null;
export const processData = async (data: string): Promise<string> => {
  if (evalPromise) return await evalPromise;

  evalPromise = new Promise<string>((resolve) => {
    const { expressions, scope } = JSON.parse(data) as {
      expressions: Array<Expression>;
      scope: {
        [key: string]: {
          min: number;
          max: number;
          step: number;
          value: number;
          defines: Array<Expression>;
        };
      };
    };

    const outData = {
      expressionResults: new Array<ExpressionResult>(),
    };
    for (const expression of expressions) {
      outData.expressionResults.push({
        expression: expression as Expression,
        result: new Array<Result>(),
      });
    }

    const scopeVars = Object.keys(scope);
    for (const variable of scopeVars) {
      scope[variable].value = scope[variable].min;
      scope[variable].defines = [];

      for (const expression of expressions) {
        if (expression.references.includes(variable)) {
          if (expression.valid) scope[variable].defines.push(expression);
        }
      }
    }

    for (const variable of scopeVars) {
      const scopeVar = scope[variable];

      let evalExpressions = [...scopeVar.defines];
      let insertionIndex = 0;
      extraExpressions: for (const expression of expressions) {
        if (expression.defines === variable) continue extraExpressions;

        if (
          expression.references.some((value: string) =>
            scopeVars.includes(value)
          )
        )
          continue extraExpressions;

        if (expression.valid)
          evalExpressions.splice(insertionIndex++, 0, expression);
      }

      evalExpressions = evalExpressions.sort((a, b) =>
        a.weight > b.weight ? 1 : -1
      );

      const doesDefine = evalExpressions.filter(
        (expr) => expr.defines === (variable === "x" ? "y" : "x")
      );

      const dependencies = (exprs: Array<Expression>, expr: Expression) => {
        const deps = exprs.filter((e) =>
          expr.references.includes(e.defines || "")
        );

        deps.push(...deps.map((e) => dependencies(exprs, e)).flat());

        return deps;
      };

      const expressionsToEval = [];
      for (let k = 0; k < doesDefine.length; k++) {
        expressionsToEval.push(
          [...dependencies(evalExpressions, doesDefine[k]), doesDefine[k]].sort(
            (a, b) => (a.weight > b.weight ? 1 : -1)
          )
        );
      }

      try {
        for (let i = scopeVar.min; i <= scopeVar.max; i += scopeVar.step) {
          const evalScope: Record<string, number> = {};

          evalScope[variable] = Math.round(i / scopeVar.step) * scopeVar.step;

          expressionsToEval.forEach((exprs) => {
            const results = evaluateExpressions(
              exprs.map((expr) => expr.code),
              evalScope
            );

            for (let j = 0; j < exprs.length; j++) {
              const index = outData.expressionResults.findIndex(
                (exprRes) => exprRes.expression.id === exprs[j].id
              );
              outData.expressionResults[index].result.push({
                value: results[j],
                scope: evalScope,
              });
            }
          });
        }
      } catch {
        console.warn("Failed to evaluate expressions");
      }
    }

    resolve(JSON.stringify(outData));
  }).finally(() => (evalPromise = null));

  return await evalPromise;
};
