import React from 'react';
import { Main } from './components/Main';
import { Footer } from './components/Footer';
import './style/app.scss';

const App: React.FunctionComponent = () => {
    return (
        <div className='app'>
            <Main />
            <Footer />
        </div>
    );
};

export default App;
