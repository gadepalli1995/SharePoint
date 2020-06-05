import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';

import styles from './TaskPlabberWebPart.module.scss';
import * as strings from 'TaskPlabberWebPartStrings';
//Load Jquery
import 'jquery';
var $: any = (window as any).$;
import 'jqueryui';


//require('sharepointservice');

//const bucket = require('bucket');
import bucket from '../../ExternalJs/Bucket';
declare var SP: any;
require('sharepoint');
require('sp-runtime');
require('microsoft-ajax');
require('sp-init');
export interface ITaskPlabberWebPartProps {
  description: string;
}

export default class TaskPlabberWebPart extends BaseClientSideWebPart <ITaskPlabberWebPartProps> {
public constructor(){
  super();
  SPComponentLoader.loadCss('https://pro.fontawesome.com/releases/v5.10.0/css/all.css');
}
  public render(): void {
    this.domElement.innerHTML = `
  <div class="${styles.draggablecontainer}">
    <div class="${styles.leftsection}">
      <button type="button" id="newPlanForm">+ New Plan</button>
    </div>
    <div class="${styles.rightsection}">
      <div class="${styles.addBucket}" id="addBucket">
        <div class="${styles.container}"><b>Add New Bucket</b>
        <div class="${styles.inputtext}" id="inputtext"><input type="text" id="bucketname"><span id="addToBucket"><i class="fas fa-check-square"></i>  </span><span id="closeDiv"><i class="fal fa-window-close"></i> </span></div>
        </div>
      </div>
      <div id="cardContainer" class="${styles.mainContainer}">
     
      

    </div>

    </div>
    
  </div>`
  //this._setButtonEventHandlers();
  bucket.setButtonEventHandlers.apply(this,[SP]);
  bucket.prepareBucketList.apply(this)
  //bucket.appendSampleCards.apply(this)
 
  }


  protected get dataVersion(): Version {
  return Version.parse('1.0');
}

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
  return {
    pages: [
      {
        header: {
          description: strings.PropertyPaneDescription
        },
        groups: [
          {
            groupName: strings.BasicGroupName,
            groupFields: [
              PropertyPaneTextField('description', {
                label: strings.DescriptionFieldLabel
              })
            ]
          }
        ]
      }
    ]
  };
}
}
