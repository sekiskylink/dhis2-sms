import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { Table } from "antd";
import { useStore } from "./context/context";

export const Home = observer(() => {
  const store = useStore();
  useEffect(() => {
    store.fetchView();
    store.fetchUserGroups();
    store.fetchDistricts();
    store.fetchActionsTaken();
    // store.fetchFollowupActions();
    store.fetchRumorSources();
    store.fetchEventTypes();
  }, [store]);

  useEffect(() => {
    const interval = setInterval(() => {
      store.fetchView();
    }, 6 * 10 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Table
      dataSource={store.inboundsmss}
      columns={store.columns}
      rowKey={(row) => row["id"]}
    />
  );
});
