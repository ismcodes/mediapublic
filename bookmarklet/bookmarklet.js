javascript:(function(){
  var MEDIAPUBLIC_URL = "localhost:4567";
  var requestInProgress = false;
  var host = document.location.host;
  var locationWithHTTPS = document.location.href.replace(/^http:/,"https:");
  var displayArea = document.getElementsByClassName("mediapublic-display-area")[0];
  var displayText;
  if (displayArea === undefined) {
    displayArea = document.createElement("div");
    displayArea.classList.add("mediapublic-display-area");
    displayArea.style.top = "10px";
    displayArea.style.right = "10px";
    displayArea.style.position = "absolute";
    displayArea.style.color = "#ecf0f1";
    displayArea.style.padding = "20px";
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
  function gatherRecordingInformation(){
    /*TODO allow archiving/adding to podcast.*/
    var info;
    if (host == "www.npr.org") {
      info =
      {
        'title': document.getElementsByClassName("storytitle")[0].children[0].innerHTML,
        'recorded_datetime': document.getElementsByTagName("time")[1].getAttribute("datetime"),
        'url': document.getElementsByClassName("download")[0].href.replace("?dl=1","")
      };
      if(confirm(
        "Is this data correct?\n" +
        "Title: " + info["title"] + "\n" +
        "Recording date: " + info["recorded_datetime"] + "\n" +
        "Recording source url: " + info["url"]
      )){
        return info;
      }
    }
    info =
    {
      'title': prompt("Recording title:"),
      'recorded_datetime': prompt("Date the recording was made(published?)"),
      /*It seems weird to ask "Date the recording was recorded" but also want to make it clear.
        TODO specify date format*/
      'url': prompt("URL of the recording source file:")
    };
    /*TODO what if the user wants to cancel these prompts? Right now it would send empty data to the server.
      If someone accidentally clicks this and keeps pressing escape to exit, they would have to press that four times.*/
    /*TODO user cannot copy text from page or even move around when the prompts are on screen. HTML interface would give user more freedom.*/
    return info;
  }
  function postToServer() {
    /*TODO What should happen if the recording is already archived and verified? Should there be a request before this to check and let the user know?*/
    if (requestInProgress) {
      return;
    }
    var xhr = new XMLHttpRequest();
    var recording = gatherRecordingInformation();
    var infoString = "title="+recording["title"]+"&recorded_datetime="+recording["recorded_datetime"]+"&url="+recording["url"]+"&page_url="+locationWithHTTPS;
    infoString += "&client_key="+"to be implemented";
    /*TODO implement client key/identifier in backend and front end*/
    /*TODO implement verified vs. unverified archives*/
    xhr.open("POST", document.location.protocol+"//" + MEDIAPUBLIC_URL + "/recordings?" + encodeURIComponent(infoString), true);
    /*Is it a problem to wrap the whole params string in encodeURIComponent?*/
    /*Did document.location.protocol b/c thought it was a problem with mock server (it wasn't).
      Should it stay like this or be switched to just plain https?*/
    xhr.onreadystatechange = checkResponse;
    xhr.send();
    requestInProgress = true;
  }
  function checkResponse(r) {
    if (this.readyState == 4) {
      requestInProgress = false;
      if (this.status == 200) {
        flashMessage("#27ae60", "Successfully archived. Thanks for the help!");
      } else {
        flashMessage("#e74c3c", "Error " + this.status);
      }
    }
  }
  postToServer();
})();
