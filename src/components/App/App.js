import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";

import "./App.scss";

import reducers from "../../redux";
import Header from "../Header";
import LeftNav from "../Main/LeftNav";
import PlayBar from "../PlayBar";
import Search from "../Search";
import PlayList from "../Main/PlayList";
import MusicDetail from "../MusicDetail";
import PlayListDetail from "../PlayListDetail";

const store = createStore(reducers, applyMiddleware(thunk, logger));

class App extends Component {
  render() {
    return (
      <Router>
        <Provider store={store}>
          <div className="navAndHeader">
            <LeftNav />
            <Header />
            <PlayBar />

            <Switch>
              <Route path='/search/:type/:keywords' component={Search} />
              <Route path="/(musicdetail|search)" component={MusicDetail} />
              <Route exact path="/:type(find|collect)" component={PlayList} />
              <Route path="/playlistdetail/:type/:id" component={PlayListDetail} />
              <Redirect from="*" to="/find" />
            </Switch>
          </div>
        </Provider>
      </Router>
    );
  }
}

export default App;
