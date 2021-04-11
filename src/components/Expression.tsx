import React, { useState } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import ClearIcon from '@material-ui/icons/Clear';

addStyles();

export const Expression: React.FunctionComponent = () => {
    const [latex, setLatex] = useState<string>('');

    return (
        <div className='expression'>
            <div className='expression-label'>1</div>
            <EditableMathField
                className='expression-text'
                latex={latex}
                onChange={(mathField) => {
                    setLatex(mathField.latex());
                }}
            />
            <div className='expression-delete'><ClearIcon /></div>
        </div>
    );
};
