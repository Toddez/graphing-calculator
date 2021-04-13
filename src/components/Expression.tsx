import React from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import ClearIcon from '@material-ui/icons/Clear';
import LineIcon from '@material-ui/icons/ShowChart';


addStyles();

interface ExpressionProps {
    expression: Expression,
    label: string
    expressionChange?: ExpressionChange,
    expressionDelete?: ExpressionDelete,
    expressionCreate?: ExpressionCreate,
}

const Expression: React.FunctionComponent<ExpressionProps> = ({ expression, label, expressionChange, expressionDelete, expressionCreate }) => {
    return (
        <div className={`expression${expressionCreate ? ' expression-create' : ''}`} onClick={expressionCreate ?? undefined}>
            <div className='expression-label'>
                <span className='label-text'>{label}</span>
                <span className='label-icon'>
                    {expression.valid && expression.defines && ['x', 'y'].includes(expression.defines) ?
                        <LineIcon style={{ color: expression.color }}/> : null
                    }
                </span>
            </div>
            {expressionChange ?
                <EditableMathField
                    className='expression-text'
                    latex={expression.latex}
                    mathquillDidMount={(mathField) => {
                        if (expression.latex === '')
                            mathField.focus();
                    }}
                    onChange={(mathField) => {
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

export { Expression };
