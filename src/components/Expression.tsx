import React from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import ClearIcon from '@material-ui/icons/Clear';

addStyles();

interface ExpressionProps {
    expression: Expression,
    label: string
    expressionChange: ExpressionChange | null,
    expressionDelete: ExpressionDelete | null,
    expressionCreate: ExpressionCreate | null,
}

export const Expression: React.FunctionComponent<ExpressionProps> = ({ expression, label, expressionChange, expressionDelete, expressionCreate }) => {
    return (
        <div className={`expression${expressionCreate ? ' expression-create' : ''}`} onClick={expressionCreate ?? undefined}>
            <div className='expression-label'>{label}</div>
            {expressionChange ?
                <EditableMathField
                    className='expression-text'
                    latex={expression.latex}
                    mathquillDidMount={(mathField) => {
                        if (expression.latex === '')
                            mathField.focus();
                    }}
                    onChange={(mathField) => {
                        console.dir(mathField);
                        if (expressionChange)
                            expressionChange(expression, mathField.latex());
                    }}
                /> : <div className='expression-text'></div>
            }
            {expressionDelete ?
                <div className='expression-delete' onClick={() => {
                    if (expressionDelete)
                        expressionDelete(expression);
                }}><ClearIcon /></div> : null
            }
        </div>
    );
};
