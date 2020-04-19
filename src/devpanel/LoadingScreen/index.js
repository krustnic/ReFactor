import React from 'react';
import PropTypes from 'prop-types';

import SpinnerIcon from './assets/spinner.svg';
import styles from './styles.module.css';

export class LoadingScreen extends React.PureComponent {
    static propTypes = {
        isInProcess: PropTypes.bool.isRequired
    };
    
    render () {
        const { isInProcess } = this.props;
        
        if (! isInProcess) return null;
        
        return (
            <div className={styles.container}>
                <div className={styles.spinner} dangerouslySetInnerHTML={{__html: SpinnerIcon}} />
            </div>
        )
    }
}