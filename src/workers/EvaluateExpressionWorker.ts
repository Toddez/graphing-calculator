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

export const processData = (data: string): string => {
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

  console.time("eval");

  for (const variable of scopeVars) {
    const scopeVar = scope[variable];

    let evalExpressions = [...scopeVar.defines];
    let insertionIndex = 0;
    extraExpressions: for (const expression of expressions) {
      if (expression.defines === variable) continue extraExpressions;

      if (
        expression.references.some((value: string) => scopeVars.includes(value))
      )
        continue extraExpressions;

      if (expression.valid)
        evalExpressions.splice(insertionIndex++, 0, expression);
    }

    evalExpressions = evalExpressions.sort((a, b) =>
      a.weight > b.weight ? 1 : -1
    );

    try {
      for (let i = scopeVar.min; i <= scopeVar.max; i += scopeVar.step) {
        const evalScope: Record<string, number> = {};
        evalScope[variable] = i;

        const results = evaluateExpressions(
          evalExpressions.map((expr: Expression) => expr.code),
          evalScope
        );

        for (let i = 0; i < evalExpressions.length; i++) {
          const index = outData.expressionResults.findIndex(
            (exprRes) => exprRes.expression.id === evalExpressions[i].id
          );
          outData.expressionResults[index].result.push({
            value: results[i],
            scope: evalScope,
          });
        }
      }
    } catch {
      console.warn("Failed to evaluate expressions");
    }
  }

  console.timeEnd("eval");

  return JSON.stringify(outData);
};
