import React from 'react';
import { ExpressionList } from './components/ExpressionList';
import { Graph } from './components/Graph';

const App: React.FunctionComponent = () => {
    const expressionsChanged: ExpressionsChange = (expressions) => {
        console.log('Expressions changed:', expressions);
        evaluateExpressions(expressions);
    };

    const evaluateExpressions = (expressions: Array<Expression>) => {
        console.log('EVAL');
    };

    return (
        <div className='app'>
            <ExpressionList expressionsChange={expressionsChanged} />
            <Graph />
        </div>
    );
};

export default App;
