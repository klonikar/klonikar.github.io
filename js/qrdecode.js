var gCtx = null;
var gCanvas = null;
var c=0;
var stype=0;
var gUM=false;
var webkit=false;
var moz=false;
var v=null;

var imghtml='<div id="qrfile"><canvas id="out-canvas" width="320" height="240"></canvas>'+
    '<div id="imghelp">drag and drop a QRCode here'+
	'<br>or select a file'+
	'<input type="file" onchange="handleFiles(this.files)"/>'+
	'</div>'+
'</div>';

var vidhtml = '<video id="v" autoplay></video>';

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}
function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;
  if(files.length>0)
  {
	handleFiles(files);
  }
  else
  if(dt.getData('URL'))
  {
	qrcode.decode(dt.getData('URL'));
  }
}

function handleFiles(f)
{
	var o=[];
	
	for(var i =0;i<f.length;i++)
	{
        var reader = new FileReader();
        reader.onload = (function(theFile) {
        return function(e) {
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

			qrcode.decode(e.target.result);
        };
        })(f[i]);
        reader.readAsDataURL(f[i]);	
    }
}

function initCanvas(w,h)
{
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        try{
            gCtx.drawImage(v,0,0);
            try{
                qrcode.decode();
                setTimeout(captureToCanvas, 500);
            }
            catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
    else
    {
        console.log("Media not captured yet or error in capturing media");
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    window.stream = stream;
    if(webkit) {
        if(window.URL)
            v.src = window.URL.createObjectURL(stream);
        else if(window.webkitURL)
            v.src = window.webkitURL.createObjectURL(stream);

        v.play();
    }
    else if(moz)
    {
        v.mozSrcObject = stream;
        v.play();
    }
    else {
	console.log("starting to play selected webcam...", stream);
        v.srcObject = stream;
	v.src = stream;
        v.onloadedmetadata = function(e) {
	    console.log("video metadata loaded. now playing...");
            v.play();
        };
    }

    gUM=true;
    setTimeout(captureToCanvas, 500);
    // Refresh button list in case labels have become available
    // return navigator.mediaDevices.enumerateDevices();
}
		
function error(error) {
    gUM=false;
    console.log("Error in accessing webcam", error);
    alert("Failed to access webcam: " + error.toString());
    return;
}

function gotSources(sourceInfos) {
  var videoSelect = document.querySelector('select#videoSource');
  //var audioSelect = document.querySelector('select#audioSource');
  while(videoSelect.firstChild)
    videoSelect.removeChild(videoSelect.firstChild);

  // Run the loop in the reverse order to get rear camera first
  for (var i = sourceInfos.length - 1; i >= 0; --i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.value = sourceInfo.deviceId;
    if (sourceInfo.kind === 'audioinput' || sourceInfo.kind === 'audiooutput') {
      //option.text = sourceInfo.label || 'microphone ' + (audioSelect.length + 1);
      //audioSelect.appendChild(option);
    } else if (sourceInfo.kind === 'videoinput') {
      option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
  setwebcam();
}

function load()
{
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800, 600);
		qrcode.callback = processQRDecode;
		document.getElementById("mainbody").style.display="inline";
		//setwebcam();
		var videoSelect = document.querySelector('select#videoSource');
		videoSelect.onchange = setwebcam;
		if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		  console.log("enumerateDevices() not supported.");
		  return;
		}

		// List cameras and microphones.

		navigator.mediaDevices.enumerateDevices()
		.then(function(devices) {
		  devices.forEach(function(device) {
		    console.log(device.kind + ": " + device.label +
				" id = " + device.deviceId);
		  });
		  gotSources(devices);
		})
		.catch(function(err) {
		  console.log(err.name + ": " + err.message);
		});
		/*if (typeof MediaStreamTrack === 'undefined'){
  			alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
		} else {
  			MediaStreamTrack.getSources(gotSources);
		}*/
	}
	else
	{
		document.getElementById("mainbody").style.display="inline";
		document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
	}
}

function setwebcam()
{
    document.getElementById("result").innerHTML="- scanning -";
    if(stype==1)
    {
        //setTimeout(captureToCanvas, 500);    
        //return;
    }
    var videoSelect = document.querySelector('select#videoSource');
    var videoSource = videoSelect.value;
    //alert("selected " + videoSource);
    var constraints = {
        audio: false,
        video: {
            //optional: [{sourceId: videoSource}]
            deviceId: {exact: videoSource}
        }
    };
    var n=navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v=document.getElementById("v");
    if (window.stream) {
      v.src = null;
      //window.stream.stop();
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    if(n.mediaDevices.getUserMedia)
        n.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    else if(n.mediaDevices.webkitGetUserMedia)
    {
        webkit=true;
        n.mediaDevices.webkitGetUserMedia(constraints).then(success).catch(error);
    }
    else if(n.mediaDevices.mozGetUserMedia)
    {
        moz=true;
        n.mediaDevices.mozGetUserMedia(constraints).then(success).catch(error);
    }

    //document.getElementById("qrimg").src="qrimg2.png";
    //document.getElementById("webcamimg").src="webcam.png";
    document.getElementById("qrimg").style.opacity=0.2;
    document.getElementById("webcamimg").style.opacity=1.0;

    stype=1;
    //setTimeout(captureToCanvas, 500);
}

function setimg()
{
	document.getElementById("result").innerHTML="";
    if(stype==2)
        return;
    document.getElementById("outdiv").innerHTML = imghtml;
    //document.getElementById("qrimg").src="qrimg.png";
    //document.getElementById("webcamimg").src="webcam2.png";
    document.getElementById("qrimg").style.opacity=1.0;
    document.getElementById("webcamimg").style.opacity=0.2;
    var qrfile = document.getElementById("qrfile");
    qrfile.addEventListener("dragenter", dragenter, false);  
    qrfile.addEventListener("dragover", dragover, false);  
    qrfile.addEventListener("drop", drop, false);
    stype=2;
}

