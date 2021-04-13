import React from 'react';
import { Canvas } from './Canvas';
import '../style/graph.scss';

interface GraphProps {
    expressionResults: Array<ExpressionResult>,
    updateResolution: UpdateResolution
}

export const Graph: React.FunctionComponent<GraphProps> = ({ expressionResults, updateResolution }) => {
    return (
        <div className='graph-container'>
            <Canvas expressionResults={expressionResults} updateResolution={updateResolution} />
        </div>
    );
};
