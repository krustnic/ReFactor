import React from 'react';
import PropTypes from 'prop-types';

import FilterIcon from '../ControlsPanel/assets/filter.svg';
import { ControlButton } from '../ControlsPanel/ControlButton';
import { JSONTree } from '../JSONTree';
import styles from './styles.module.css';

export class FilterTree extends React.PureComponent {
    static propTypes = {
        tree: PropTypes.object.isRequired,
        filter: PropTypes.string.isRequired,
        filterData: PropTypes.object.isRequired,
        changeFilter: PropTypes.func.isRequired,
        handleFilter: PropTypes.func.isRequired
    };
    
    handleChange = e => {
        this.props.changeFilter(e.target.value);
    };
    
    handleKeyPress = e => {
        if (e.key === 'Enter') {
            this.props.handleFilter();
        }
    };
    
    render () {
        const { filter, filterData } = this.props;
        
        return (
            <div className={styles.container}>
                <div className={styles.controls}>
                    <input
                        className={styles.input}
                        value={filter}
                        onChange={this.handleChange}
                        onKeyPress={this.handleKeyPress}
                        type="text"
                    />
                    <ControlButton
                        icon={FilterIcon}
                        onClick={this.props.handleFilter}
                    />
                </div>
                <JSONTree
                    data={filterData}
                    labelRenderer={this.labelRenderer}
                    getItemString={this.getItemString}
                />
            </div>
        )
    }
    
    labelRenderer = ([key, ...rest], nodeType, expanded) => {
        return (
            <span>{key === 'root' ? 'state' : key}</span>
        )
    };
    
    getItemString = () => {
        return null;
    };
}