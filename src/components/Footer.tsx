import React from 'react';
import Icon from '@material-ui/icons/ShowChart';
import '../style/footer.scss';

export const Footer: React.FunctionComponent = () => {
    return (
        <footer className='footer'>
            <a className='icon' href="/">
                <Icon />
            </a>
            <div className='links'>
                <div className='item copyright'>&copy; {(new Date()).getFullYear()} <a href="https://github.com/Toddez">Teo Carlsson</a></div>
                <div className='item'><a href="/">About</a></div>
                <div className='item'><a href="/">Privacy</a></div>
                <div className='item'><a href="/">Status</a></div>
            </div>
        </footer>
    );
};
