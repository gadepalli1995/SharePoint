
//import {TaskPlabberWebPart} from './../webparts/taskPlabber';
import 'jquery';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from '../webparts/taskPlabber/TaskPlabberWebPart.module.scss';
var $: any = (window as any).$;
declare var SP: any;
var currentCard;
var columns;
var response;
var _this;
var currentTaskCard;
var currentColumn;
var draggedItem;
var projectId;
require('sharepoint');
require('sp-runtime');
require('microsoft-ajax');
require('sp-init');
require('sharepointservice');

var siteUrl = 'https://trianz365.sharepoint.com/sites/tri001';
var mainSite= 'https://trianz365.sharepoint.com/sites/test001';
var bucket = {
  // appendSampleCards:function(){
    // var ele1 = $('<div >', {
    //   "class": styles.testStyle
    //   })[0]
    // ele1.addEventListener("dragover", function(){
    //   alert('sample test')
    // });
    // var parEle = document.getElementById('sampleCard');
    // parEle.className = styles.testStyle;
    // parEle.addEventListener("dragenter", function(){
    //   alert('sample test')
    // });
    // var parEle1 = document.getElementById('sampleCard1');
    // parEle1.className = styles.testStyle;
    // $(parEle1).draggable();
    // parEle.appendChild(ele1);
  // },
  setButtonEventHandlers: function (SP) {
    this.domElement.querySelector("#newPlanForm").addEventListener('click',()=>{
      openModelDialogPopup("https://trianz365.sharepoint.com/sites/Test001/Lists/ProjectPlanner/NewForm.aspx");
    })
    this.domElement.querySelector('#addBucket').addEventListener('click', (event) => {
      //event.stopPropagation();
      bucket.showAddBucket()

    }, true)
    this.domElement.querySelector("#closeDiv").addEventListener('click', (event) => {
      //event.stopPropagation();
      bucket.showInputField()

    }, true)
    this.domElement.querySelector("#addToBucket").addEventListener('click', () => {
      var bucketName = $("#bucketname").val();
      if(bucketName.length ==0)
      {
        alert("Please enter the bucketname")
      }else{
      bucket.insertintoBucketList.apply(this, [bucketName,projectId]);
      }
    }, true);
  
  },

  showAddBucket: function () {
    $('#inputtext').css('display', 'inline-block');
    $('#addBucket b').css('display', 'none');
  },
  showInputField: function () {
    $('#addBucket b').css('display', 'inline-block');
    $('#inputtext').css('display', 'none');
  },
  insertintoBucketList: function (name,projectId) {
    const body: string = JSON.stringify({
      'Title': name,
      'v9hh':projectId
    });
    this.context.spHttpClient.post(mainSite + `/_api/web/lists/GetByTitle('BucketList')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'odata-version': ''
        },
        body: body
      })
      .then((response: SPHttpClientResponse): Promise<any> => {
        return response.json();
      })
    bucket.showInputField();
    bucket.createColumnCard(name)
  },
  fetchBucketList: function () {
   return this.context.spHttpClient.get(mainSite + `/_api/web/lists/GetByTitle('BucketList')/items?$select=Title&$filter=v9hh eq '${projectId}'`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'odata-version': ''
        }
      })
      .then((response: SPHttpClientResponse): Promise<any> => {
        return response.json();
      })
  },

  prepareBucketList:function(){
    _this = this;
    var currentUrl= window.location.href;
    projectId=getProjectId(currentUrl,'/sites/')
  
    bucket.fetchBucketList.apply(this).then((result)=>{
      columns=result.value;
      result.value.forEach(element => {
        bucket.createColumnCard(element.Title);
      });
     
      bucket.fetchCardList();
    })
  },
  fetchCardList:function(){
    $.ajax({
      async: true,
      url: "https://trianz365.sharepoint.com/sites/test001/_api/web/lists/GetByTitle('ProjectTaskList')/items",
      method: "GET",

      headers: {
          "accept": "application/json;odata=verbose",
          "content-type": "application/json;odata=verbose"

      },
      success: function (data) {
          response = data.d.results;
          prepareCards(response);

      }
  })
  },

  createColumnCard: function (column) {
    
    var element = $('<div >', {
      "class": styles.columStyle
      })[0]
    // makeDroppable(element);
    $(element).attr('id', column);

    $(element).html(`<div id="title" class="${styles.title}">${column}</div>`);
   $(element).append(`<div >
  <button type="button" class="btn btn-primary ${styles.addTask}" id="addTask"><i class="fa fa-plus" aria-hidden="true"></i>Add Task</button>
  <div class="${styles.addTaskCard}" id="addTaskCard">
<div id="close" class="${styles.close}"><i class="fal fa-window-close"></i></div>      
        <div class="newcard">
          <div>
       <label for="taskname"></label>
       <input class="${styles.taskname}"type="text" id="newTask"/>
      </div>
       <p class="${styles.btnpara}"><button type="button" id="submitTaskBtn" class="${styles.btncard}">Add Task</button></p>
      </div>
      </div>
     </div>
  
   </div>`);
  
  if(element){
    $(element).on('click','#addTask',(event)=>{
     
  
    var ele = element.querySelectorAll('#addTaskCard');
     
      if(ele && ele[0]){
        currentTaskCard = ele[0];
        $(currentTaskCard).css('display','inline-block');
        $(currentTaskCard).on('click','#close',(event)=>{
          var parents =  getParents(event.currentTarget,2);
         currentTaskCard = parents[parents.length-1];

          $(currentTaskCard).css('display','none');
        })

        $(currentTaskCard).on('click','#submitTaskBtn',()=>{
        var newTask =currentTaskCard.querySelectorAll('#newTask')[0].value;
         var column =  getParents(currentTaskCard,3);
         currentColumn = column[column.length-1];
          insertintoTaskList(newTask)
        })
      }
    })
   

 
  }
  var getParents = function (elem,num) {

    // Set up a parent array
    var parents = [];
  
    // Push each parent element to the array
    for ( let count=1; elem && count<=num ; elem = elem.parentNode ) {
      parents.push(elem);
      count++;
    }
  
    // Return our parent array
    return parents;
  
  };
 
   element.addEventListener('mousedown',  (event)=> {
    var element = event.currentTarget;
    draggedItem= event.currentTarget;
    var id = $(element).attr('id');
    if (checkWithColumn(id)) {
      $(draggedItem).draggable();
      $(draggedItem).on('dragstart', function (event) {
        console.log('data transfer ::',event)
        //event.originalEvent.dataTransfer.setData('...', '...');
    });
    }
  },true);
  $(element).on('mouseup', function (event) {
    var element = event.currentTarget;
    var id = $(element).attr('id');
    if (checkWithColumn(id)) {
      makeDroppable(element);
    }
  });
    // $(parentElement).draggable();
    // $(parentElement).append(element);
    var containerElement = document.getElementById("cardContainer")
    containerElement.appendChild(element);




  }



}
function insertintoTaskList(taskName){
  // console.log('TaskName',taskName);
  var col = $(currentColumn).attr('id')
  // console.log('column',col);
}

function checkDraggedItem(){
  if(draggedItem){
  
    var className =$(draggedItem).attr('class');
    //var classListnames =$(draggedItem).attr('class');
    
    return className.startsWith('card')
    
    
  }
  return false;
}

function makeDroppable(element) {
  $(element).droppable({
      drop: function (event, ui) {
        if(checkDraggedItem()){
          var id = $(currentCard).attr('id');
          var fromStatus = $(currentCard).attr('status');
          var toStatus = $(event.target).attr('id');
          $(currentCard).remove();
          
          createUpdatedCard(toStatus);
          
          updateItem(id, fromStatus, toStatus);
        }
         

      } 
  });
  // element.addEventListener('dragover',function(event){
  //   console.log('dragover :::',event);
  // })
}
function checkWithColumn(id) {
  if (id) {
      return columns.some(col => {
          return col.Title === id;
      })
  }
  return false;
}
function openModelDialogPopup(siteUrl){
  var dialogOptions = {
    url: siteUrl,
    title: 'ModalDialog',
    allowMaximize: false,
    showClose: true,
    width: 800,
    height: 330
  };
  SP.SOD.execute('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', dialogOptions);
  return false;

}

function prepareCards(response) {
  response.forEach(record => {
      createCardFromList(record);
  })
}
function createCardFromList(record) {
  var element = $('<div>', {
    "class": styles.card
    })[0]
  var id = record.Id;
  var statusType = record.dl3c;
  var title = record.Title;
  var criteria = record.AcceptanceCriteria;
  
  $(element).draggable();
  $(element).attr('id', id);
  $(element).attr('status', statusType);
  $(element).attr('title',title);
  $(element).attr('criteria',criteria);
  // $(element).on('click',function(event){
  //   alert('clicked on card')
  // })
  element.addEventListener('mousedown',(event)=>{
        console.log('evnet:::', event)
      currentCard = event.currentTarget;
      draggedItem= event.currentTarget;
  },true);
  // $(element).on('mousedown', function (event) {
  //     console.log('evnet:::', event)
  //     currentCard = event.currentTarget;
  //     draggedItem= event.currentTarget;
  // })
  prepareInnerText(record, element);
  var parentEle = document.getElementById(statusType);
  parentEle.appendChild(element);
}
function prepareInnerText(record, element) {
  $(element).append(`<div class="innerText"><p>${record.Title}</p>
  <p>${record.dl3c}</p></div>`);


}
function createUpdatedCard(toStatus){
  var title =$(currentCard).attr('title');
  var criteria =$(currentCard).attr('criteria');
  var id =$(currentCard).attr('id');
  var element = $('<div>', {
    "class": styles.card
    })[0];
  $(element).attr('id',id);

  $(element).draggable();
  $(element).attr('status',toStatus);  
  $(element).attr('title',title);
  $(element).attr('criteria',criteria);
  // $(element).on('click',function(event){
  //   alert('clicked on card')
  // })
  element.addEventListener('mousedown',(event)=>{
      currentCard = event.currentTarget;
      draggedItem =currentCard;
  },true)
  prepareInnerText({Title:title,AcceptanceCriteria:criteria,dl3c:toStatus},element);
  var parentEle = document.getElementById(toStatus);
  parentEle.appendChild(element);
}

function updateItem(id,fromStatus,toStatus) {  
  var obj = response.find(record => {
    return record.Id == id;
});
obj.dl3c = toStatus;        
      _this.context.spHttpClient.get(mainSite +`/_api/web/lists/getbytitle('ProjectTaskList')/items(${id})`,  
        SPHttpClient.configurations.v1,  
        {  
          headers: {  
            'Accept': 'application/json;odata=nometadata',  
            'odata-version': ''  
          }  
        })
      
    .then((response: SPHttpClientResponse): Promise<any> => {  
      return response.json();  
    })  
    .then((item: any): void => {  
      //_this.updateStatus(`Item ID: ${item.Id}, Status: ${item.Status}`);  
  
      const body: string = JSON.stringify({  
        //'Title': `Updated Item ${new Date()}`,
        'dl3c': toStatus,
      });  
  
      _this.context.spHttpClient.post(mainSite + `/_api/web/lists/getbytitle('ProjectTaskList')/items(${item.Id})`,  
        SPHttpClient.configurations.v1,  
        {  
          headers: {  
            'Accept': 'application/json;odata=nometadata',  
            'Content-type': 'application/json;odata=nometadata',  
            'odata-version': '',  
            'IF-MATCH': '*',  
            'X-HTTP-Method': 'MERGE'  
          },  
          body: body  
        })  
        .then((response: SPHttpClientResponse): void => {  
          //_this.updateStatus(`Item with ID: ${id} successfully updated`);  
          alert(`Task updated from ${fromStatus} to ${toStatus}`);
        }, (error: any): void => {  
          //_this.updateStatus(`Error updating item: ${error}`);  
        });  
    });  
}  
function getProjectId(url,char){
  return url.substring(url.indexOf(char)+1).split('/')[1];

}
export default bucket;
