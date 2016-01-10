import {Route} from 'backbone-routing';
import View from '../show/view';
import Model from 'shared/recordings/model';

export default Route.extend({
  initialize(options = {}) {
    this.container = options.container;
  },

  render(params) {
    var that = this;
    function renderPage(_model){
      that.view = new View({
        model: _model,
      });
      that.container.show(that.view);
    }
    function retrieveListAndRender(_model){
      var listxhr = new XMLHttpRequest();
      listxhr.onreadystatechange = function(){
        var list = JSON.parse(listxhr.responseText)["data"]
        _model.attributes["organizationList"] = list;
        renderPage(_model);
      }
      listxhr.open("GET", "http://localhost:6543/organizations");
      listxhr.send();
    }
    var _model = new Model();
    var hostName;
    if(params){
      params = params.split("&").map(function(pair){
        return pair.split("=");
      });
      for(var i = 0; i < params.length; i++){
        switch(params[i][0]){
          case "title":
            _model.attributes["title"] = params[i][1];
            break;
          case "url":
            _model.attributes["url"] = params[i][1];
            hostName = new URL(params[i][1]).host;
            break;
        }
      }
    } else {
      retrieveListAndRender(_model);
    }


    if(hostName){
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "http://localhost:6543/organizations?url=" + hostName, false);
      xhr.onreadystatechange = function(){
          if(true){//xhr.responseText == "{}"
            //retrieve full list from server
            retrieveListAndRender(_model);
          } else {
            var organizationData = JSON.parse(xhr.responseText);
            _model.attributes["organizationName"] = organizationData["name"];
            _model.attributes["organization_id"] = organizationData["id"];
            renderPage(_model);
          }
        }
        xhr.send();
      }
    }

});
