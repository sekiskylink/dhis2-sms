import React from "react";
import { D2Shim } from "@dhis2/app-runtime-adapter-d2";
import { Home } from "./Home";
import { Provider } from "./context/context";
import store from "./Store";

import 'antd/dist/antd.css';

const appConfig = {
  schemas: [],
};

const authorization = process.env.REACT_APP_DHIS2_AUTHORIZATION || null;
if (authorization) {
  appConfig.headers = { Authorization: authorization };
}

const MyApp = () => {
  return (
    <D2Shim appConfig={appConfig} i18nRoot="./i18n">
      {({ d2 }) => {
        if (!d2) {
          return null;
        } else {
          store.setD2(d2);
          return (
            <Provider value={store}>
              <Home />
            </Provider>
          );
        }
      }}
    </D2Shim>
  );
};

export default MyApp;
