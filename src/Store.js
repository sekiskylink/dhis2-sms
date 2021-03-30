import { action, configure, decorate, observable, computed } from "mobx";
import { Button, Modal } from "antd";
import { Dialog } from "./Dialog";
import { EventModal} from './EventDialog';
import { flatten, uniq } from "lodash";

configure({ enforceActions: "observed" });

class Store {
  d2;
  inboundsmss = [];
  userGroups = [];
  selectedGroups = ["Y1wNsABGXtK"];
  districts = [];
  actionsTaken = [];
  followupActions = [];
  rumorSources = [];
  eventTypes = [];
  currentEventValues = [];
  eventConfs = {
    program: "iaN1DovM5em",
    eventType: "ILmx9NZX5GK",
    dateOfOnset: "KyQqGXUzThE",
    location: "MaR0lvrRkvR",
    nameOfSubmitter: "C8rAfbgOZir",
    phone: "fb9Fs09UNN8",
    rumorSource: "nvYHp4qr35Q",
    actionTaken: "Y9ahw4POban",
    followupAction: "sapRdA8sojg",
    comment: "MYIDtPnvepJ"
  }

  setInboundSms = (val) => (this.inboundsmss = val);
  setUserGroups = (val) => (this.userGroups = val);
  setSelectedGroups = (val) => (this.selectedGroups = val);
  setDistricts = (val) => (this.districts = val);
  setActionsTaken = (val) => (this.actionsTaken = val);
  // setFollowupActions = (val) => (this.followupActions = val);
  setRumorSources = (val) => (this.rumorSources = val);
  setEventTypes = (val) => (this.eventTypes = val);
  setCurrentEventValues = (val) => (this.currentEventValues = val);

  handleChange = (value) => {
    this.setSelectedGroups(value);
  };

  setD2 = (d2) => {
    this.d2 = d2;
  };

  formateDate = (dateString) => {
    let options = {
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric', second:'numeric'
    };
    return new Date(Date.parse(dateString)).toLocaleString('en-GB', options);
  }

  fetchUserGroups = async () => {
    const api = this.d2.Api.getApi();
    const url = `userGroups`;
    const { userGroups } = await api.get(url, {
      fields: "id,name,users[phoneNumber,email]",
      paging: false,
    });
    this.setUserGroups(userGroups);
  };

  fetchView = async () => {
    const api = this.d2.Api.getApi();
    const url = `sms/inbound`;
    const { inboundsmss } = await api.get(url, {
      fields: "id,text,originator,receiveddate,smsstatus,sentdate",
      order: "receiveddate:desc"
    });
    this.setInboundSms(inboundsmss.map((a)=>{
      a.receiveddate = this.formateDate(a.receiveddate);
      return a;
    })
    );
  };

  fetchDistricts = async () => {
    const api = this.d2.Api.getApi();
    const url = `organisationUnits.json`;
    const { organisationUnits } = await api.get(url, {
      level: "3",
      fields: "id,name",
      paging: false
    });
    this.setDistricts(organisationUnits);
  };

  fetchActionsTaken = async () => {
    const api = this.d2.Api.getApi();
    const url = `optionSets/GNTX1AnCPEL.json`;
    const { options } = await api.get(url, {
      fields: "id,options[id,name,code]",
      paging: false
    });
    this.setActionsTaken(options);
  };

 fetchFollowupActions = async () => {
    const api = this.d2.Api.getApi();
    const url = `optionSets/ntjsL4UMoNW.json`;
    const { options } = await api.get(url, {
      fields: "id,options[id,name,code]",
      paging: false
    });
    this.setFollowupActions(options);
  }; 
  
  fetchRumorSources = async () => {
    const api = this.d2.Api.getApi();
    const url = `optionSets/x7kVdpPf6ry.json`;
    const { options } = await api.get(url, {
      fields: "id,options[id,name,code]",
      paging: false
    });
    this.setRumorSources(options);
  }; 
  
  fetchEventTypes = async () => {
    const api = this.d2.Api.getApi();
    const url = `optionSets/stZ0w17GD28.json`;
    const { options } = await api.get(url, {
      fields: "id,options[id,name,code]",
      paging: false
    });
    this.setEventTypes(options);
  };

  sendSMS = async (message) => {
    const payload = {
      message,
      recipients: this.numbers,
    };
    const api = this.d2.Api.getApi();

    await api.post("sms/outbound", payload);
  };

  saveEvent = async (eventPayload) => {
    // eventPayload should be valid JSON object required by events api
    const api = this.d2.Api.getApi();
    await api.post("events", eventPayload);
  }

  fetchEvent = async (eventID) => {
    const api = this.d2.Api.getApi();
    const url = "events/" + eventID + ".json";
    try {
    const {orgUnit,dataValues} = await api.get(url, {fields: "orgUnit,dataValues[dataElement,value]"});
    if (dataValues instanceof Object){
      var cValues = {};
      const eValues = dataValues.map(i => {
        // var x = {};
        // x[i['dataElement']] = i['value'];
        var y = {};
        const k = Object.keys(this.eventConfs).find(
          key => this.eventConfs[key] === i['dataElement'])
        y[k] = i['value'];
        cValues[k] = i['value'];
        return y;
      })
      cValues['district'] = orgUnit;
      console.log("Event Values", cValues);
      this.setCurrentEventValues(cValues);
    }
  } catch {
    console.log("Couldn't fetch event with id:", eventID);
  }
    // this.setCurrentEventValues(dataValues);
  }

  get columns() {
    return [
      // {name: "id", column: "ID"},
      {name: "originator", column: "Reporter"},
      {name: "receiveddate", column: "Date Received"},
      {name: "text", column: "Message"},
      { name: "groups", column: "Notification Groups" },
      { name: "smsstatus", column: "Status" },
      { name: "actions", column: "Actions" },
    ]
      .map((a) => {
        return {
          key: a.name,
          title: a.column,
          dataIndex: a.name,
          render: (text, row) => {
            if ("groups" === a.name) {
              return <div>Workers</div>;
            } else if ("smsstatus" === a.name) {
              return <div>Status</div>;
            } else if ("actions" === a.name) {
              return (
                <>
                  <EventModal msgObj={row}/>
                  {/*
                  <Dialog
                    message={row["text"]}
                    originator={row["originator"]}
                    sentdate={row["sentdate"]}
                  />
                  */}
                </>
              );
            } else {
              return <div>{text}</div>;
            }
          },
        };
      })
      .filter((col) => {
        return (
          [
            "id",
            "originator",
            "sentdate",
            "receiveddate",
            "text",
            // "smsstatus",
            "actions",
          ].indexOf(col.key) !== -1
        );
      });
  }

  get numbers() {
    const currentGroups = this.userGroups
      .filter((e) => this.selectedGroups.indexOf(e.id) !== -1)
      .map((gp) => {
        return gp.users
          .map((u) => u.phoneNumber || null)
          .filter((n) => n !== null);
      });
    return uniq(flatten(currentGroups));
  }
}

decorate(Store, {
  d2: observable,
  inboundsmss: observable,
  userGroups: observable,
  districts: observable,
  actionsTaken: observable,
  selectedGroups: observable,
  eventConfs: observable,
  currentEventValues: observable,
  setD2: action,
  fetchView: action,
  fetchUserGroups: action,
  fetchDistricts: action,
  fetchEvent: action,
  setInboundSms: action,
  setUserGroups: action,
  setSelectedGroups: action,
  setDistricts: action,
  setActionsTaken: action,
  // setFollowupActions: action,
  setRumorSources: action,
  setEventTypes: action,
  setCurrentEventValues: action,
  handleChange: action,
  columns: computed,
  numbers: computed,
});
export default new Store();
