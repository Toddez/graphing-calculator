import React from 'react';
import { Header } from './components/Header';
import { Main } from './components/Main';
import { Footer } from './components/Footer';
import './style/app.scss';

const App: React.FunctionComponent = () => {
    return (
        <div className='app'>
            <Header />
            <Main />
            <Footer />
        </div>
    );
};

export default App;
