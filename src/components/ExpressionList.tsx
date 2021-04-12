import React, { useState } from 'react';
import { Expression } from './Expression';
import MathExpression from 'math-expressions';
import '../style/expression.scss';

const builtinVariables = new Set<Variable>(['x', 'y']);

const emptyExpression: Expression = {
    latex: '',
    code: '',
    defines: null,
    references: new Set<Variable>([]),
    weight: 0,
    valid: false
};

const initialExpressions: Array<Expression> = [
    {} as Expression
];
Object.assign(initialExpressions[0], emptyExpression);

export const ExpressionList: React.FunctionComponent = () => {
    const [expressions, setExpressions] = useState<Array<Expression>>(initialExpressions);

    const orderExpressions = () => {
        for (const expression of expressions) {
            let insertionWeight = 0;
            let validExpr = true;
            for (const reference of Array.from(expression.references)) {
                let weight = 0;
                let noRef = !builtinVariables.has(reference);
                compare: for (const other of expressions) {
                    if (other === expression)
                        continue compare;

                    if (other.defines === reference) {
                        noRef = false;
                        break compare;
                    }

                    weight++;
                }

                insertionWeight = Math.max(insertionWeight, weight);

                // FIXME: doesn't find self references because of defines and references parsing
                if (reference === expression.defines) {
                    // TODO: display error
                    console.warn('EXPRESSION', expression.code, 'HAS REFERENCE TO SELF', reference);
                    validExpr = false;
                }

                if (noRef == true) {
                    // TODO: display error
                    console.warn('EXPRESSION', expression.code, 'HAS REFERENCE TO UNDEFINED VARIABLE:', reference);
                    validExpr = false;
                }
            }

            expression.valid = validExpr;
            expression.weight = insertionWeight;
        }

        const orderedExpressions = [...expressions];
        orderedExpressions.sort((a, b) => {
            return a.weight > b.weight ? 1 : -1;
        });

        return orderedExpressions;
    };

    const updateExpression: ExpressionChange = (expression, latex) => {
        expression.latex = latex;

        try {
            const latexNodes = MathExpression.fromLatex(latex);
            const variables = latexNodes.variables();
            // FIXME: Should really check if node tree has assignment operator
            if (variables.length < 1)
                expression.defines = null;
            else
                expression.defines = variables[0];

            // FIXME: Should also check for assignment operator
            if (variables.length < 2)
                expression.references = new Set<Variable>([]);
            else
                expression.references = new Set<Variable>(variables.slice(1));

            expression.code = latexNodes.toString();
        } catch {
            expression.code = '';
            expression.defines = null;
            expression.references = new Set<Variable>([]);
        }

        expressions[expressions.indexOf(expression)] = expression;
        setExpressions(expressions);
        orderExpressions(); // TODO: should be moved
    };

    const deleteExpression: ExpressionDelete = (expression) => {
        const newExpressions = expressions.filter((expr) => {
            return expr !== expression;
        });
        setExpressions(newExpressions);
    };

    const createExpression: ExpressionCreate = () => {
        const newExpression = {} as Expression;
        Object.assign(newExpression, emptyExpression);
        setExpressions([...expressions, newExpression]);
    };

    return (
        <div className='expression-list'>
            {expressions.map((expression: Expression, index) => {
                return (
                    <Expression
                        key={index}
                        label={(index + 1) as unknown as string}
                        expression={expression}
                        expressionChange={updateExpression}
                        expressionDelete={deleteExpression}
                        expressionCreate={null} />
                );
            })}
            <Expression
                key={expressions.length}
                label={(expressions.length + 1) as unknown as string}
                expression={emptyExpression}
                expressionChange={null}
                expressionDelete={null}
                expressionCreate={createExpression} />
        </div>
    );
};
