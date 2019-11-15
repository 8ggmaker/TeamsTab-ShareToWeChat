import React, { Component } from "react";
// import UserTile from "./UserTile";
// import authService from "../services/auth.service";
import * as microsoftTeams from "@microsoft/teams-js";
import { DefaultButton } from "office-ui-fabric-react";
export class IConfig{
    history:any
}
/**
 * This component is responsible for:
 * 1. Displaying configuration settings
 */
export class Config extends Component {
  constructor(props) {
    super(props);

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

  }

  componentDidMount() {
    microsoftTeams.initialize();
    microsoftTeams.settings.registerOnSaveHandler(saveEvent => {
      let contentUrl = `${window.location.origin}/files/`;
      let removeUrl = `${window.location.origin}/remove/`;


      microsoftTeams.settings.setSettings({
        entityId: "TeamFiles",
        suggestedDisplayName: "Team Files",
        contentUrl: contentUrl,
        removeUrl: removeUrl,
        websiteUrl: `${window.location.origin}/`
      });

      saveEvent.notifySuccess();
    });

    // this.setState({ loading: true });
    // authService
    //   .getUser()
    //   .then(user => {
    //     this.setState({ user, loading: false });
    //   })
    //   .catch(err => {
    //     this.setState({ loading: false });
    //   });
  }

  validate = () => {
    microsoftTeams.settings.setValidityState(true);
  };

  render() {
    return (
      <div className="App-content">
        <div className="App-header">
          <h1 className="App-header-title">Config</h1>
        </div>
        <div>
          <DefaultButton primary={true} onClick={this.validate}>
            <span className="ms-Button-label label-46">Validate</span>
          </DefaultButton>
        </div>
      </div>
    );
  }
}
