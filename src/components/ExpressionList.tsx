import React from 'react';
import { Expression } from './Expression';
import '../style/expression.scss';

export const ExpressionList: React.FunctionComponent = () => {
    return (
        <div className='expression-list'>
            <Expression />
            <Expression />
            <Expression />
            <Expression />
        </div>
    );
};
