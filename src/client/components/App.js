import React from 'react';
import {BrowserRouter, Match, Miss, Link} from 'react-router';

import Home from './Home';
import Login from './Login';
import NoMatch from './NoMatch';
import LoginButton from './LoginButton';

export default () => (
    <BrowserRouter>
        <div>
            <div className="wrapper">
                <div className="sidebar" data-color="purple" data-image="assets/img/sidebar-5.jpg">
                    <div className="sidebar-wrapper">
                        <div className="logo">
                            <Link to="/" className="simple-text">REST-ON-COUCH</Link>
                        </div>
                        <ul className="nav">
                            <li>
                                <Link to="/login" activeClassName="active">
                                    <i className="pe-7s-graph"/>
                                    <p>Login</p>
                                </Link>
                            </li>
                            <li>
                                <Link to="/logout" activeClassName="active">
                                    <i className="pe-7s-user"/>
                                    <p>Logout</p>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="main-panel">
                    <nav className="navbar navbar-default navbar-fixed">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <a className="navbar-brand" href="#">Dashboard</a>
                            </div>
                            <div className="collapse navbar-collapse">
                                <ul className="nav navbar-nav navbar-right">
                                    <li>
                                        <LoginButton/>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    
                    <div className="content">
                        <div className="container-fluid">
                            <Match exactly pattern="/" component={Home}/>
                            <Match pattern="/login" component={Login}/>
                            <Miss component={NoMatch}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BrowserRouter>
);
