import React, { useState } from 'react';
import { Expression } from './Expression';
import '../style/expression.scss';

const initialExpressions = [
    {
        latex: ''
    }
];

export const ExpressionList: React.FunctionComponent = () => {
    const [expressions, setExpressions] = useState<Array<Expression>>(initialExpressions);

    let label = 1;
    const newExpression = {} as Expression;
    return (
        <div className='expression-list'>
            {expressions.map((expression: Expression) => {
                return (
                    <Expression key={label++} label={label as unknown as string} expression={expression} expressionChange={() => {console.log('Change', expression.latex);}} expressionDelete={() => {console.log('Delete');}} expressionCreate={null} />
                );
            })}
            <Expression key={label} label={label as unknown as string} expression={newExpression} expressionChange={null} expressionDelete={null} expressionCreate={() => {
                console.log('Create');
                newExpression.latex = '';
                setExpressions([...expressions, newExpression]);
            }} />
        </div>
    );
};
