import React from 'react';
import PropTypes from 'prop-types';
import setWith from 'lodash/setWith';

import { JSONTree } from '../JSONTree';
import styles from './styles.module.css';

export class UsageTree extends React.PureComponent {
    static propTypes = {
        tree: PropTypes.object.isRequired,
        changeFilter: PropTypes.func.isRequired,
        handleFilter: PropTypes.func.isRequired
    };
    
    render () {
        const { tree } = this.props;
        
        const data = {};
        for(const path in tree) {
            setWith(data, path.split('.'), {}, Object);
        }
        
        return (
            <div className={styles.container}>
                <JSONTree
                    data={data}
                    labelRenderer={this.labelRenderer}
                    getItemString={this.getItemString}
                />
            </div>
        )
    }
    
    handleUsageClick = filter => e => {
        e.stopPropagation();
        
        this.props.changeFilter(filter, () => {
            this.props.handleFilter();
        });
    };
    
    labelRenderer = ([key, ...rest], nodeType, expanded) => {
        let filter = [ key ].concat(rest).filter(item => item !== 'root').reverse().join('.');
        
        // TODO: Need to check
        if (nodeType === 'Array') {
            filter += '.*'
        }
        
        if (key === 'root') {
            return <span>state</span>
        }
        
        return <span>{key} (<span className={styles.link} onClick={this.handleUsageClick(filter)}>➔</span>)</span>
    };
    
    getItemString = () => {
        return null;
    };
}