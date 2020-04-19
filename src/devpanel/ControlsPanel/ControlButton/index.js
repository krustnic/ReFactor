import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.css';

export const ControlButton = ({ icon, className, ...props }) => {
    return (
        <button className={classnames(styles.button, className)} {...props}>
            <div className={styles.icon} dangerouslySetInnerHTML={{__html: icon}} />
            <span>{props.children}</span>
        </button>
    )
};