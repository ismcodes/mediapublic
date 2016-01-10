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
      renderPage(_model);
    }


    if(hostName){
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "http://localhost:6543/organizations?url=" + hostName, false);
      xhr.onreadystatechange = function(){
          if(true){//xhr.responseText == "{}"
            //retrieve full list from server
            xhr.onreadystatechange = function(){
                var list = JSON.parse(xhr.responseText)["data"]
                _model.attributes["organizationList"] = list;
                renderPage(_model);
            }
            xhr.open("GET", "http://localhost:6543/organizations");
            xhr.send();
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
