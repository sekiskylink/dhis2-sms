import { Button, Modal, Select } from "antd";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { useStore } from "./context/context";

const { Option } = Select;

export const Dialog = observer(({ message, originator, sentdate }) => {
  const store = useStore();
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async (e) => {
    await store.sendSMS(message + " from " + originator + " " + sentdate);
    store.setSelectedGroups(["Y1wNsABGXtK"]);
    setVisible(false);
  };

  const handleCancel = (e) => {
    store.setSelectedGroups(["Y1wNsABGXtK"]);
    setVisible(false);
  };
  return (
    <>
      <Button type="primary" onClick={showModal}>
        Forward
      </Button>
      <Modal
        title="Forward Message"
        visible={visible}
        onOk={handleOk}
        width="50%"
        bodyStyle={{ overflow: "auto" }}
        forceRender={true}
        mask={true}
        onCancel={handleCancel}
      >
        <Select
          size="large"
          showSearch
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Please select"
          onChange={store.handleChange}
          value={store.selectedGroups}
          filterOption={(input, option) => {
            return (
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
              option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }}
        >
          {store.userGroups.map((g) => (
            <Option key={g.id} value={g.id}>
              {g.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
});
