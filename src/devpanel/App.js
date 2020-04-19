import React from 'react';
import minimatch from "minimatch";
import merge from "lodash/merge";

import { ControlsPanel } from './ControlsPanel';
import { UsageTree } from './UsageTree';
import { FilterTree } from './FilterTree';
import { LoadingScreen } from './LoadingScreen';

import { ChromeWrapper, isInExtension } from '../utils/chrome';
import * as message from '../utils/messageTypes';
import styles from './styles.module.css';

export class App extends React.PureComponent {
    state = {
        isTracingEnabled: false,
        count: 0,
        isInProcess: false,
        tree: isInExtension() ? {} : {
            'users.0.location.name': {},
            'users.1.location.name': {},
            'users.length.location.name': {}
        },
        filter: '',
        filterData: {},
        activeTab: 'fields'
    };
    
    componentDidMount() {
        this.getTracingStatus(({ isTracingEnabled }) => {
            this.setState({
                isTracingEnabled
            })
        });
        
        window.dispatch = this.handleMessage;
    }
    
    changeTab = activeTab => () => {
        this.setState({
            activeTab
        })
    };
    
    handleMessage = msg => {
        if (msg.type === message.INIT) {
            const { isTracingEnabled } = msg.payload;
        
            this.setState({
                isTracingEnabled,
                count: 0
            });
        } else if (msg.type === message.TRACES_COUNT) {
            const count = msg.payload;
    
            this.setState({
                count
            });
        }
    };
    
    getTracingStatus = callback => {
        ChromeWrapper.devtools.inspectedWindow.eval(
            'window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED === true;',
            null,
            isTracingEnabled => {
                callback({ isTracingEnabled })
            }
        );
    };
    
    setTracingStatus = () => {
        const { isTracingEnabled } = this.state;
        
        ChromeWrapper.devtools.inspectedWindow.eval(
            `window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED = ${! isTracingEnabled};`,
            null,
            () => {
                this.getTracingStatus(({ isTracingEnabled }) => {
                    this.setState({
                        isTracingEnabled
                    })
                });
            }
        );
    };
    
    handleReload = () => {
        ChromeWrapper.devtools.inspectedWindow.reload({
            injectedScript: 'window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED = true;'
        })
    };
    
    handleLoad = () => {
        this.setState({
            isInProcess: true
        });
    
        window?.toBG({
            type: message.GET_TRACES,
            payload: {
                contentTabId: chrome.devtools.inspectedWindow.tabId
            }
        }, (msg = {}) => {
            const { payload = {} } = msg;
    
            this.setState({
                isInProcess: false,
                count: 0,
                tree: payload,
                filterData: {},
                activeTab: 'fields'
            });
        });
    };
    
    handleClear = () => {
        this.setState({
            count: 0,
            isInProcess: false,
            tree: {},
            filter: '',
            filterData: {}
        })
    };
    
    changeFilter = (filter, callback) => {
        this.setState({
            filter,
            activeTab: 'filter'
        }, () => {
            callback?.();
        })
    };
    
    handleFilter = () => {
        const { tree, filter } = this.state;
        
        if (filter === '') {
            return this.setState({
                filterData: {}
            });
        }
        
        const data = {};
        
        for(const path in tree) {
            if (minimatch(path.replace('.', '/'), filter.replace('.', '/'))) {
                merge(data, tree[path]);
            }
        }
        
        this.setState({
            filterData: data
        })
    };
    
    render () {
        const { isTracingEnabled, count, isInProcess, tree, filter, filterData, activeTab } = this.state;
        
        return (
            <div className={styles.container}>
                <LoadingScreen isInProcess={isInProcess} />
                <ControlsPanel
                    isTracingEnabled={isTracingEnabled}
                    isInProcess={isInProcess}
                    count={count}
                    activeTab={activeTab}
                    setTracingStatus={this.setTracingStatus}
                    handleReload={this.handleReload}
                    handleLoad={this.handleLoad}
                    handleClear={this.handleClear}
                    changeTab={this.changeTab}
                />
                <div className={styles.content}>
                    { activeTab === 'fields' &&
                    <UsageTree
                        tree={tree}
                        changeFilter={this.changeFilter}
                        handleFilter={this.handleFilter}
                    />
                    }
                    { activeTab === 'filter' &&
                    <FilterTree
                        tree={tree}
                        filter={filter}
                        filterData={filterData}
                        changeFilter={this.changeFilter}
                        handleFilter={this.handleFilter}
                    />}
                </div>
            </div>
        )
    }
}