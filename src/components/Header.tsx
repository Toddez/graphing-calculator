import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import '../style/header.scss';

export const Header: React.FunctionComponent = () => {
    return (
        <header className='header'>
            <div className='menu'><MenuIcon /></div>
            <div className='graph-name'>Unnamed graph</div>
        </header>
    );
};
