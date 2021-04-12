import React, { useState } from 'react';
import { Expression } from './Expression';
import MathExpression from 'math-expressions';
import '../style/expression.scss';

const emptyExpression: Expression = {
    latex: '',
    text: '',
    variables: []
};

const initialExpressions: Array<Expression> = [
    {} as Expression
];
Object.assign(initialExpressions[0], emptyExpression);

export const ExpressionList: React.FunctionComponent = () => {
    const [expressions, setExpressions] = useState<Array<Expression>>(initialExpressions);

    const updateExpression: ExpressionChange = (expression, latex) => {
        expression.latex = latex;

        try {
            const latexNodes = MathExpression.fromLatex(latex);
            expression.variables = latexNodes.variables();
            expression.text = latexNodes.toString();
        } catch {
            expression.text = '';
            expression.variables = [];
        }

        expressions[expressions.indexOf(expression)] = expression;
        setExpressions(expressions);
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
