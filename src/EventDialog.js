import React, { useState } from 'react';
import { observer } from "mobx-react";
import { Modal, Form, Button, Input, DatePicker, Space, Select } from 'antd';
import { useStore } from "./context/context";
import moment from 'moment';

const {Option} = Select;
const FormItem = Form.Item;
const TextArea = Input.TextArea;

export const EventModal = observer(({msgObj}) => {
  const store = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = async () => {
    await store.fetchEvent(msgObj.id);
    console.log("Current Event Values =>", store.currentEventValues);
    setIsModalVisible(true);
  };

  const getInitialValue = (field) => {
    if (field in store.currentEventValues) {
      return store.currentEventValues[field];
    }
    return "";
  }

  const handleOk = async (values) => {
    console.log("Submitted values:", values);
    const completeDate = new Date().toISOString().slice(0, 10);
    let dataValues = [];
    for (let i in values) {
        if (i === 'dateOfOnset' && values[i] instanceof Object){
            // Only add dateOfOnset if defined
            const onsetDate = values[i].toISOString().slice(0, 10);
            dataValues.push({dataElement: store.eventConfs[i], value: onsetDate});
          }
          else{
            if (i in store.eventConfs){ // Let's only add those dateElements in our configuration
                dataValues.push({dataElement: store.eventConfs[i], value: values[i]});
            }
          }
    }
    const eventPayload = {
        event: values["event"],
        program: store.eventConfs["program"],
        orgUnit: values["district"],
        eventDate: values["alertDate"]["_d"].toISOString().slice(0, 10),
        status: "COMPLETED",
        completeDate: completeDate,
        // storedBy: '',
        dataValues: dataValues
    }
    console.log(JSON.stringify(eventPayload));
    await store.saveEvent(eventPayload);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    store.setSelectedGroups(["Y1wNsABGXtK"]);
    store.setCurrentEventValues({});
    setIsModalVisible(false);
  };
  const [form] = Form.useForm();
  const alertDate = moment(msgObj.sentdate, moment.HTML5_FMT.DATE);
  
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  return (
    <>
      <Button type="default" onClick={showModal}>
        Log Event
      </Button>
      <Modal title="Create Alert Event" visible={isModalVisible} 
        onOk={form.submit} onCancel={handleCancel} width="60%" 
       >
        <Space direction="vertical">
                
        </Space>
        <Form form={form} onFinish={handleOk}>
            <FormItem hidden={true} name="event" initialValue={msgObj.id}>
                <Input/>
            </FormItem>
            <FormItem   
                {...formItemLayout} label="District" name="district"
                  initialValue={getInitialValue('district')}>
                <Select style={{width:"100%"}} placeholder="Select District" id="district">
                  {
                    store.districts.map((d) => (
                      <Option key={d.id} value={d.id}>
                        {d.name}
                      </Option>
                    ))
                  }
                </Select>
                    
            </FormItem>

            <FormItem
              {...formItemLayout} label="Notify Users" name="notifyusers" initialValue={store.selectedGroups}>
            <Select
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
            </FormItem>

            <FormItem   
                {...formItemLayout} label="Date Alert Received" 
                name="alertDate" initialValue={alertDate}
                hidden={true}>
                    
                    <DatePicker style={{width: "60%"}} 
                        placeholder="Date Alert Received" format="YYYY-MM-DD"/>
            </FormItem>
            <FormItem
                {...formItemLayout} label="Case/Event Type" name="eventType"
                initialValue={getInitialValue('eventType')}
                rules={[{required: true, message: "Case Type is required"}]}>
                <Select style={{ width: "100%" }} placeholder="Event Type">
                    {
                        store.eventTypes.map((e) => (
                            <Option key={e.id} value={e.code}>
                                {e.name}
                            </Option>
                        ))
                    }
                </Select>
            </FormItem>
            <FormItem   
                {...formItemLayout} label="Date of Onset" name="dateOfOnset"
                rules={[{required: true, message: "Date of Oneset required"}]}>
                    
                    <DatePicker style={{width: "60%"}} 
                      placeholder={getInitialValue('dateOfOnset')} format="YYYY-MM-DD"
                      value={moment(getInitialValue('dateOfOnset'), "YYYY-MM-DD")}/>
            </FormItem>
            <FormItem
                {...formItemLayout} label="Location" name="location"
                initialValue={getInitialValue('location')}>
                <Input placeholder="Location (Village/Parish/Sub-county/District)"/>
            </FormItem>
            <FormItem
                {...formItemLayout} label="Name of Submitter" name="nameOfSubmitter"
                  initialValue ={getInitialValue('nameOfSubmitter')}>
                <Input placeholder="Name of Submitter" />
            </FormItem>

            <FormItem
                {...formItemLayout} 
                label="Phone Number of Submitter" hidden={true} 
                name="phone" initialValue={msgObj.originator}>
                <Input placeholder="Phone Number of the Submitter"/>
            </FormItem>

            <FormItem
                {...formItemLayout} label="Source of Rumor" name="rumorSource"
                  initialValue={getInitialValue('rumorSource')}>
                <Select style={{ width: "100%" }} placeholder="Source of Rumor">
                    {
                        store.rumorSources.map((e) => (
                            <Option key={e.id} value={e.code}>
                                {e.name}
                            </Option>
                        ))
                    }
                </Select>
            </FormItem>
            <FormItem
                {...formItemLayout} label="Action Taken" name="actionTaken"
                  initialValue={getInitialValue('actionTaken')}>
                <Select style={{ width: "100%" }} placeholder="Action Taken">
                    {
                        store.actionsTaken.map((e) => (
                            <Option key={e.id} value={e.code}>
                                {e.name}
                            </Option>
                        ))
                    }
                </Select>
            </FormItem>
            <FormItem
                {...formItemLayout} 
                label="Comment"  
                name="comment">
                <TextArea  placeholder="Comment" rows={2}/>
            </FormItem>
            {/*
            <FormItem
                {...formItemLayout} label="Follow up Action" name="followupAction">
                <Select style={{ width: "100%" }} placeholder="Follow up Action" id="sapRdA8sojg">
                    {
                        store.followupActions.map((e) => (
                            <Option key={e.id} value={e.id}>
                                {e.name}
                            </Option>
                        ))
                    }
                </Select>
            </FormItem>
            */}
            
        </Form>
      </Modal>
    </>
  );
});