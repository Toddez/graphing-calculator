import React from 'react';
import { ExpressionList } from './components/ExpressionList';
import { Graph } from './components/Graph';

const App: React.FC = () => {
    return (
        <div className='app'>
            <ExpressionList />
            <Graph />
        </div>
    );
};

export default App;
