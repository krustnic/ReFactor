import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { ControlButton } from './ControlButton';
import RecordIcon from './assets/record.svg';
import ReloadIcon from './assets/reload.svg';
import EventsIcon from './assets/events.svg';
import ClearIcon from './assets/clear.svg';
import ListIcon from './assets/list.svg';
import FilterIcon from './assets/filter.svg';

import styles from './styles.module.css';

export class ControlsPanel extends React.PureComponent {
    static propTypes = {
        isTracingEnabled: PropTypes.bool.isRequired,
        isInProcess: PropTypes.bool.isRequired,
        count: PropTypes.number.isRequired,
        activeTab: PropTypes.oneOf([ 'fields', 'filter' ]).isRequired,
        setTracingStatus: PropTypes.func.isRequired,
        handleReload: PropTypes.func.isRequired,
        handleLoad: PropTypes.func.isRequired,
        handleClear: PropTypes.func.isRequired,
        changeTab: PropTypes.func.isRequired,
        isReducerWrapped: PropTypes.bool.isRequired
    };
    
    render () {
        const {
            isTracingEnabled,
            isInProcess,
            count,
            setTracingStatus,
            handleReload,
            handleLoad,
            handleClear,
            activeTab,
            isReducerWrapped
        } = this.props;
        
        return (
            <div className={styles.container}>
                <div className={styles.tabs}>
                    <ControlButton
                        icon={ListIcon}
                        onClick={this.props.changeTab('fields')}
                        className={classnames(styles.tab, {
                            [styles.active]: activeTab === 'fields'
                        })}>
                        Fields
                    </ControlButton>
                    <ControlButton
                        icon={FilterIcon}
                        onClick={this.props.changeTab('filter')}
                        className={classnames(styles.tab, {
                            [styles.active]: activeTab === 'filter'
                        })}>
                        Filter
                    </ControlButton>
                </div>
                <div className={styles.delimiter} />
                <ControlButton
                    icon={RecordIcon}
                    onClick={setTracingStatus}
                    className={classnames({
                        [styles.recording]: isTracingEnabled
                    })}
                />
                <ControlButton
                    icon={ReloadIcon}
                    onClick={handleReload}
                />
                <ControlButton
                    icon={EventsIcon}
                    onClick={handleLoad}
                    className={styles.eventsControl}
                >
                    {count}
                </ControlButton>
                <div className={styles.delimiter} />
                <ControlButton
                    icon={ClearIcon}
                    onClick={handleClear}
                    disabled={isInProcess}
                />
                <div className={styles.status}>
                    {! isReducerWrapped && <span className={styles.danger}>Reducer not wrapped</span>}
                </div>
            </div>
        )
    }
}