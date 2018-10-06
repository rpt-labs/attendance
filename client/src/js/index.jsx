import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import '../css/main.css';

ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('app'));


