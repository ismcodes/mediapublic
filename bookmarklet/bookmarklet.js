javascript:(function(){
var MEDIAPUBLIC_URL = "localhost:4567";
var requestInProgress = false;
var host = document.location.host;
var audioUrl = gatherRecordingUrl();
var playlistID = prompt("playlist id?");
var displayArea = document.getElementsByClassName("mediapublic-display-area")[0];
var displayText;
if (displayArea === undefined) {
  displayArea = document.createElement("div");
  displayArea.classList.add("mediapublic-display-area");
  displayArea.style.top = "10px";
  displayArea.style.right = "10px";
  displayArea.style.position = "absolute";
  displayArea.style.color = "#ecf0f1";
  displayArea.style.zIndex = 999;
  displayText = document.createTextNode("");
  displayArea.appendChild(displayText);
  document.body.appendChild(displayArea);
} else {
  displayText = displayArea.childNodes[0];
}
function flashMessage(color, message){
  displayArea.style.backgroundColor = color;
  displayText.textContent = message;
  displayArea.style.display = "block";
  setTimeout(function(){
    displayArea.style.display = "none";
  }, 2000);
}
function getRecordingIDFromUrl(){
  return window.location.href.match(/recordings\/:(\d+)/)[1]
}
function gatherRecordingInformation(){
   var info;
   if (host == "www.npr.org") {
     info =
     {
       'title': document.getElementsByClassName("storytitle")[0].children[0].innerHTML,
       'organization_id': 123,
       'recorded_datetime': document.getElementsByTagName("time")[1].getAttribute("datetime")
      }
   } else if (host == MEDIAPUBLIC_URL) {

   }
   return info;
}
function gatherRecordingUrl(){
  if (host == "www.npr.org") {
return encodeURI(document.getElementsByClassName("download")[0].href.replace("?dl=1",""));
  } else if (host == MEDIAPUBLIC_URL) {
    return "pending";
  }
}
function postToServer() {
  console.log("hi");
  if (requestInProgress) {
    return false;
  }

  var xhr = new XMLHttpRequest();
  var xhrTarget;
  if (host == MEDIAPUBLIC_URL){
    xhrTarget = "http://" + MEDIAPUBLIC_URL + "/playlists/"+playlistID+"?recording_id="+getRecordingIDFromUrl();
  }
  else{
    xhrTarget = "http://" + MEDIAPUBLIC_URL + "/playlists/"+playlistID+"?url="+audioUrl;
  }
  xhr.open("POST", xhrTarget, true);
  xhr.onreadystatechange = checkResponse;

  xhr.send();
  requestInProgress = true;
}
function checkResponse(r) {
  if (this.readyState == 4) {
    requestInProgress = false;
    if (this.status == 200) {
      if (this.responseText == "success") {
        flashMessage("#27ae60", "Successfully added!");
      } else {
        flashMessage("#ec5e00", "Adding recording to database..");
        var xhradd = new XMLHttpRequest();
        var recording = gatherRecordingInformation();
        var rString = "title="+recording.title+"&organization_id="+recording.organization_id+"&recorded_datetime="+recording.recorded_datetime;
        xhradd.open("POST", "http://" + MEDIAPUBLIC_URL + "/recordings?" + rString, true);
        xhradd.onreadystatechange = responseFromAdding;
        xhradd.send();
        requestInProgress = true;
      }
    } else {
      flashMessage("#e74c3c", "Error " + this.status);
    }
  }
}
function responseFromAdding(r){
  if (this.readyState == 4) {
    requestInProgress = false;
    if (this.status == 200) {
      postToServer();
    } else {
      flashMessage("#e74c3c", "Error " + this.status);
    }
  }
}
postToServer();
})();
