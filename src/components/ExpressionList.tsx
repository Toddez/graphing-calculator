import React, { useEffect, useState } from "react";
import { Expression } from "./Expression";
import MathExpression from "math-expressions/lib/math-expressions";
import "../style/expression.scss";
import { newExpression, saveExpressions, loadExpressions } from "../utils";
interface ExpressionListProps {
  expressionsChange: ExpressionsChange;
}

export const ExpressionList: React.FunctionComponent<ExpressionListProps> = ({
  expressionsChange,
}) => {
  const [emptyExpression] = useState<Expression>(newExpression(-1));
  const [expressions, setExpressions] = useState<Array<Expression> | null>(
    null
  );
  const [style, setStyle] = useState("");

  const reservedVariables = new Set<Variable>(["e"]);
  const builtinVariables = new Set<Variable>(["x", "y", ...reservedVariables]);

  const selectColor = (index: number, max: number): string => {
    if (max < 1) max = 1;
    return `hsl(${(index * (360 / max)) % 360}, 100%, 80%)`;
  };

  const expressionProperties = (
    exprs: Array<Expression>,
    expr: Expression
  ): { valid: boolean; weight: number } => {
    let valid = expr.code !== "";
    let sumWeight = 0;

    try {
      for (const reference of Array.from(expr.references)) {
        if (reference === expr.defines) throw new Error("Self reference");
        let defined = builtinVariables.has(reference);
        let weight = 1;

        if (!defined)
          for (const other of exprs) {
            if (other.id !== expr.id && other.defines === reference) {
              defined = true;

              if (other.references.includes(expr.defines || ""))
                throw new Error("Recursive references");

              const visit = (
                expression: Expression,
                visited: Array<string> = []
              ) => {
                if (visited.includes(expression.defines || ""))
                  throw new Error("Deep recursive references");

                if (expression.defines) {
                  visited.push(expression.defines);
                  expression.references.forEach((ref) =>
                    exprs
                      .filter(
                        (ex) =>
                          ex.defines === ref &&
                          !builtinVariables.has(ex.defines)
                      )
                      .map((value) => visit(value, Array.from(visited)))
                  );
                }
              };

              visit(expr);

              const otherRes = expressionProperties(exprs, other);

              if (!otherRes.valid) throw new Error("Invalid reference");

              weight = Math.max(weight, otherRes.weight + 1);
            }
          }

        if (!defined) throw new Error("Undefined reference");

        sumWeight = Math.max(sumWeight, weight);
      }
    } catch {
      valid = false;
    }

    return { weight: sumWeight, valid };
  };

  const expressionsWithPropertiesAndColor = (exprs: Array<Expression>) => {
    const expressionsWithProperties = exprs.map((expr) => {
      const { valid, weight } = expressionProperties(exprs, expr);

      return {
        ...expr,
        valid,
        weight,
      };
    });

    const validExpresions = expressionsWithProperties.filter(
      (expr) => expr.valid
    );

    return expressionsWithProperties.map((expr) => {
      return {
        ...expr,
        color: selectColor(
          validExpresions.map((expr) => expr.id).indexOf(expr.id),
          validExpresions.length
        ),
      };
    });
  };

  const updateExpression: ExpressionChange = (id, latex) => {
    if (!expressions) return;

    const newExpressions = expressions.map((expression) => {
      if (expression.id === id) {
        let defines: Variable | null = null;
        let references: Array<Variable> = [];
        let code = "";
        try {
          const latexNodes = MathExpression.fromLatex(latex);
          if (latexNodes.tree.indexOf("=") !== 0)
            throw new Error("No assignment operator");

          if (latexNodes.tree[1].length > 1)
            throw new Error("Invalid left-side of assignment operator");

          const variables = latexNodes.variables();
          if (variables.length < 1) defines = null;
          else defines = variables[0];

          if (defines && reservedVariables.has(defines))
            throw new Error("Defining reserved variable");

          if (
            defines &&
            (
              (latexNodes.tree[2].length > 1
                ? latexNodes.tree[2].flat(Infinity)
                : [latexNodes.tree[2]]) as Array<string>
            ).includes(defines)
          )
            throw new Error("Self reference");

          if (variables.length < 2) references = new Array<Variable>();
          else references = Array.from(new Set(variables.slice(1)));

          code = latexNodes.toString();
        } catch {
          code = "";
          defines = null;
          references = new Array<Variable>();
        }

        return {
          ...expression,
          latex: latex,
          discontinuities: new Array<number>(),
          code: code,
          defines: defines,
          references: references,
        };
      }

      return {
        ...expression,
      };
    }) as Array<Expression>;

    setExpressions(expressionsWithPropertiesAndColor(newExpressions));
  };

  const deleteExpression: ExpressionDelete = (id) => {
    if (!expressions) return;

    const newExpressions = expressions.filter((expression) => {
      return id !== expression.id;
    });

    setExpressions(expressionsWithPropertiesAndColor(newExpressions));
  };

  const createExpression: ExpressionCreate = () => {
    if (!expressions) return;

    setExpressions([...expressions, newExpression()]);
  };

  useEffect(() => {
    if (!expressions) setExpressions(loadExpressions());
    else saveExpressions(expressions);
  }, [expressions]);

  useEffect(() => {
    if (!expressions) return;

    expressionsChange(expressions);

    const varElements = Array.from(
      document.querySelectorAll(
        ".expression-text.mq-editable-field.mq-math-mode var"
      )
    );

    const variables = [
      ...new Set(
        expressions
          .map((expr) => [expr.defines, ...expr.references])
          .flat()
          .filter((variable) => variable)
      ),
    ] as unknown as Array<string>;

    const variableIds: { [key: string]: Array<string> } = {};
    variables.forEach((variable) => {
      const elements = varElements
        .filter((element) => element.innerHTML === variable)
        .map((element) => element.getAttribute("mathquill-command-id") || "");

      variableIds[variable] = elements;
    });

    let resStyle = "";
    expressions.forEach((expr) => {
      if (!expr.defines) return;
      if (!variableIds[expr.defines]) return;
      if (!expr.valid) return;
      if (builtinVariables.has(expr.defines)) return;

      variableIds[expr.defines].forEach((id) => {
        resStyle += `.expression-text.mq-editable-field.mq-math-mode var[mathquill-command-id="${id}"]:not(.mq-operator-name) { background-color: ${expr.color}; color: #171717; }\n`;
      });
    });

    for (const key of Object.keys(variableIds)) {
      let defined = builtinVariables.has(key);
      for (const expr of expressions) {
        if (expr.defines === key && expr.valid) defined = true;
      }

      if (!defined) {
        for (const id of variableIds[key]) {
          resStyle += `.expression-text.mq-editable-field.mq-math-mode > .mq-root-block > var[mathquill-command-id="${id}"]:not(:first-child):not(.mq-operator-name), .expression-text.mq-editable-field.mq-math-mode > .mq-root-block > * var[mathquill-command-id="${id}"]:not(.mq-operator-name) { border-bottom: 1px solid #ff5370; }\n`;
        }
      }
    }

    setStyle(resStyle);
  }, [expressions]);

  useEffect(() => {
    const head = document.head;
    const element = document.createElement("style");
    element.innerHTML = style;
    head.appendChild(element);

    return () => {
      head.removeChild(element);
    };
  }, [style]);

  let label = 1;
  return (
    <div className="expression-list">
      {expressions &&
        expressions.map((expression: Expression) => {
          return (
            <Expression
              key={expression.id}
              label={
                expression.valid &&
                ["x", "y"].includes(expression.defines || "")
                  ? (label++ as unknown as string)
                  : ""
              }
              expression={expression}
              expressionChange={updateExpression}
              expressionDelete={deleteExpression}
            />
          );
        })}
      <Expression
        key={emptyExpression.id}
        label=""
        expression={emptyExpression}
        expressionCreate={createExpression}
      />
    </div>
  );
};
