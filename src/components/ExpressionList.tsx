import React, { useEffect, useState } from "react";
import { Expression } from "./Expression";
import MathExpression from "math-expressions/lib/math-expressions";
import "../style/expression.scss";
import { id } from "../utils";
interface ExpressionListProps {
  expressionsChange: ExpressionsChange;
}

export const ExpressionList: React.FunctionComponent<ExpressionListProps> = ({
  expressionsChange,
}) => {
  const [expressions, setExpressions] = useState<Array<Expression>>([]);
  const [style, setStyle] = useState("");

  const builtinVariables = new Set<Variable>(["x", "y", "e"]);

  const newExpression = () => ({
    id: id(),
    latex: "",
    code: "",
    defines: null,
    references: new Array<Variable>(),
    weight: 0,
    valid: false,
    color: "#ff0000",
    discontinuities: new Array<number>(),
  });

  const emptyExpression = newExpression();

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

              const visited: Array<string> = [];
              const visit = (expression: Expression) => {
                if (visited.includes(expression.defines || ""))
                  throw new Error("Deep recursive references");

                if (expression.defines) {
                  visited.push(expression.defines);
                  expression.references.forEach((ref) =>
                    exprs
                      .filter(
                        (ex) =>
                          ex.defines === ref && !["x", "y"].includes(ex.defines)
                      )
                      .map(visit)
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

  const orderExpressions = (): Array<Expression> => {
    const orderedExpressions = [...expressions];
    orderedExpressions.sort((a, b) => {
      return a.weight > b.weight ? 1 : -1;
    });

    return orderedExpressions;
  };

  const updateExpression: ExpressionChange = (id, latex) => {
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
    const newExpressions = expressions.filter((expression) => {
      return id !== expression.id;
    });

    setExpressions(expressionsWithPropertiesAndColor(newExpressions));
  };

  const createExpression: ExpressionCreate = () => {
    setExpressions([...expressions, newExpression()]);
  };

  useEffect(() => {
    expressionsChange(orderExpressions());

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
      if (["x", "y"].includes(expr.defines)) return;

      variableIds[expr.defines].forEach((id) => {
        resStyle += `.expression-text.mq-editable-field.mq-math-mode var[mathquill-command-id="${id}"]:not(.mq-operator-name) { background-color: ${expr.color}; color: #171717; }\n`;
      });
    });

    for (const key of Object.keys(variableIds)) {
      let defined = ["x", "y"].includes(key);
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
    if (expressions.length === 0) setExpressions([newExpression()]);
  }, []);

  useEffect(() => {
    const head = document.head;
    const element = document.createElement("style");
    element.innerHTML = style;
    head.appendChild(element);

    return () => {
      head.removeChild(element);
    };
  }, [style]);

  return (
    <div className="expression-list">
      {expressions.map((expression: Expression, index) => {
        return (
          <Expression
            key={expression.id}
            label={(index + 1) as unknown as string}
            expression={expression}
            expressionChange={updateExpression}
            expressionDelete={deleteExpression}
          />
        );
      })}
      <Expression
        key={emptyExpression.id}
        label={(expressions.length + 1) as unknown as string}
        expression={emptyExpression}
        expressionCreate={createExpression}
      />
    </div>
  );
};
