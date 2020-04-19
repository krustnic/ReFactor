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
            'users.0.location.name': {
                'filepath:23:34': {}
            },
            'users.1.location.name': {},
            'users.length.location.name': {}
        },
        filter: '',
        filterData: {},
        activeTab: 'fields',
        isReducerWrapped: false
    };
    
    componentDidMount() {
        this.getTracingStatus();
        this.getWrapperStatus();
        
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
                count: 0,
                isReducerWrapped: false
            });
        } else if (msg.type === message.WRAPPED) {
            this.setState({
                isReducerWrapped: true
            });
        } else if (msg.type === message.TRACES_COUNT) {
            const count = msg.payload;
    
            this.setState({
                count
            });
        }
    };
    
    getTracingStatus = () => {
        ChromeWrapper.devtools.inspectedWindow.eval(
            'window.__REFACTOR_EXTENSION_IS_TRACING_ENABLED === true;',
            null,
            isTracingEnabled => {
                this.setState({
                    isTracingEnabled
                })
            }
        );
    };
    
    getWrapperStatus = () => {
        ChromeWrapper.devtools.inspectedWindow.eval(
            'window.__REFACTOR_EXTENSION_IS_REDUCER_WRAPPED === true;',
            null,
            isReducerWrapped => {
                this.setState({
                    isReducerWrapped
                })
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
        const {
            isTracingEnabled,
            count,
            isInProcess,
            tree,
            filter,
            filterData,
            activeTab,
            isReducerWrapped
        } = this.state;
        
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
                    isReducerWrapped={isReducerWrapped}
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