import * as React from 'react';
import authService from '../service/sso.auth.service';
import teamfileService from '../service/team.file.service';
import { Async } from 'office-ui-fabric-react/lib/Utilities';
import { IColumn, buildColumns, SelectionMode, IconButton, IIconProps, Modal, MessageBar, MessageBarButton,DefaultButton, MessageBarType, Icon, Button } from 'office-ui-fabric-react/lib/index';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import * as microsoftTeams from "@microsoft/teams-js";
import { ConsentConsumer } from './ConsentContext';
import { initializeIcons } from '@uifabric/icons';
initializeIcons();
var QRCode = require('qrcode.react');

const shareIconProps: IIconProps = { iconName: 'Share' };


interface ITeamFileItem{
  type:string;
  name:string;
  driveId:string;
  driveItemId:string;
  thumbnail:string;
  displaySize:string;
  lastModifiedBy:string;
  size:number;
}

export interface IShimmerApplicationExampleState {
  items: ITeamFileItem[]; // DetailsList `items` prop is required so it expects at least an empty array.
  columns?: IColumn[];
  isDataLoaded?: boolean;
  isInited:boolean;
  currentSharingItem?: ITeamFileItem;
  showSharingModal:boolean;
  sharingUrl?:string;
}

interface ITeamFileProps{
  consentRequired?: boolean,
  setConsentRequired?: (consentRequired:boolean) => {},
  requestConsent?: () => {}
}

export class TeamFiles extends React.Component<ITeamFileProps, IShimmerApplicationExampleState> {
  private _async: Async;

  constructor(props: {}) {
    super(props);

    this.state = {
      items: [],
      columns: buildTeamFileColumns(),
      isDataLoaded: false,
      isInited:false,
      showSharingModal:false
    };

    this._async = new Async(this);
  }

  public componentWillUnmount(): void {
    this._async.dispose();
  }

  componentDidMount(){
    this.loadData();
  }

  private async loadData():Promise<void>{
    if(this.state.isInited && !this.state.isDataLoaded){
      return;
    }
    microsoftTeams.getContext(async (context)=>{
      var files = await teamfileService.getTeamsFiles(context.groupId);
      try{
        if(files.data)
        {
          const tempItems:ITeamFileItem[] = [];
          files.data.forEach(f=>{
            const teamFileItem:ITeamFileItem = 
            {
              thumbnail: this.getFileIcon(f.fileType||f.extension),
              name: f.name,
              driveId:f.driveId,
              driveItemId:f.driveItemId,
              size:f.size,
              displaySize:this.getFileSize(f.size),
              lastModifiedBy:f.lastModifiedBy,
              type:f.fileType || f.extension
            }
            tempItems.push(teamFileItem);
          });
          this.setState({
            isDataLoaded:true,
            isInited:true,
            items:tempItems
          })
        }else{
          this.setState({
            isDataLoaded:true,
            isInited:true,
            items:[]
          })
        }
      }
      catch(e){
        this.props.setConsentRequired && this.props.setConsentRequired(true);
      }

    })
  }



  private getFileSize(size: number): string {
    let ret: string = "";
    if (size === 0) {
        ret = 0 + `KB`;
    }
    let floorLog: number = parseInt(((Math.log(size) * Math.LOG2E) / 10).toString(), 10);
    let num: string = parseFloat((size / Math.pow(1024, floorLog)).toString()).toFixed(2);
    if (floorLog === 0) {
        ret = num + `B`;
    } else if (floorLog === 1) {
        ret = num + `KB`;
    } else if (floorLog === 2) {
        ret = num + `MB`;
    } else if (floorLog === 3) {
        ret = num + `GB`;
    }
    return ret;
}
  public render(): JSX.Element {
    const { items, columns, isDataLoaded } = this.state;

    return (
      <div className="App">
      <Modal
          isOpen={(this.state.showSharingModal)}
          onDismiss={()=>{this.closeModal()}}
          isBlocking={false}
        >
        <div>{this.state.currentSharingItem ? this.state.currentSharingItem.name : ''}</div>
        <DefaultButton onClick={()=>{this.closeModal()}} text="Close" />
        <QRCode value = {this.state.sharingUrl}/>
      </Modal>
      <ConsentConsumer>
            {({ consentRequired, requestConsent }) =>
              consentRequired && (
                <MessageBar
                  messageBarType={MessageBarType.warning}
                  isMultiline={false}
                  dismissButtonAriaLabel="Close"
                  actions={
                    <div>
                      <MessageBarButton onClick={requestConsent}>
                        Go
                      </MessageBarButton>
                    </div>
                  }
                >
                  TeamFiles needs your consent in order to do its work.
                </MessageBar>
              )
            }
          </ConsentConsumer>
        {(isDataLoaded && items.length==0) ? 
        (<div>No files now</div>) :
          (<ShimmeredDetailsList
            setKey="items"
            items={items}
            columns={columns}
            selectionMode={SelectionMode.none}
            onRenderItemColumn={this._onRenderItemColumn}
            enableShimmer={!isDataLoaded}
            ariaLabelForShimmer="Content is being fetched"
            ariaLabelForGrid="Item details"
            listProps={{ renderedWindowsAhead: 0, renderedWindowsBehind: 0 }}
          />)
        }
          </div>   
    );
  }

  private _onRenderItemColumn = (item: ITeamFileItem, index: number, column: IColumn): JSX.Element | string | number => {
    if (column.key === 'thumbnail') {
      return <img src={item.thumbnail} />;
    }else if(column.key==='sharetowechat'){
      return <IconButton iconProps={shareIconProps} onClick={()=>{this.share(item)}}/>
    }

    return item[column.key as keyof ITeamFileItem];
  };

  private share(item:ITeamFileItem){
    const sharingUrl = `https://o.o365cn.com/open?did=${item.driveId}&iid=${item.driveItemId}&dtype=business&fn=${item.name}&fs=${item.size}`;
    this.setState({
      showSharingModal:true,
      sharingUrl:sharingUrl,
      currentSharingItem:item
    })
  }

  private closeModal(){
    this.setState({
      showSharingModal:false,
    })
  }

  private getFileIcon(docType:string): string {
    if(docType.startsWith('.')){
      docType = docType.substr(1);
    }
    return `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${docType}_16x1.svg`;
  }
}

function buildTeamFileColumns(): IColumn[] {
  const item: ITeamFileItem = {
    type:"docx",
    name:"test.docx",
    driveId:"testId",
    driveItemId:"testItemId",
    thumbnail:"thumbnail",
    displaySize:"1KB",
    lastModifiedBy:"testUser",
    size:100
  }
  const columns: IColumn[] = buildColumns([item],true);
  const displayColums:IColumn[] = columns.filter(c=>c.key!="driveId"&&c.key!="driveItemId"&&c.key!="type"&&c.key!="size");
  for (const column of displayColums) {
    if (column.key === 'thumbnail') {
      column.name = 'File Type';
      column.minWidth = 16;
      column.maxWidth = 16;
      column.isIconOnly = true;
      column.iconName = 'Page';
      column.isResizable = false;
    }else if(column.key==='name'){
      column.name = 'File Name';
    }else if(column.key === 'displaySize'){
      column.name = 'File Size';
    }else if(column.key==='lastModifiedBy'){
      column.name = 'Modified'
    }

  }
  
  displayColums.push({
    name:'Share to WeChat',
    key: 'sharetowechat',
    minWidth:16,
    maxWidth:16,
    isResizable:false
  })

  return displayColums;
}
