const zip2 = (a, b) => a.map((k, i) => [k, b[i]]);

async function requestExternalImage(imageUrl) {
  const res = await fetch(imageUrl, {
    method: 'GET',
    headers: {
      mode: 'no-cors'
    }
  })
  if (!(res.status < 400)) {
    console.error(res.status + ' : ' + await res.text())
    throw new Error('failed to fetch image from url: ' + imageUrl)
  }

  let blob
  try {
    blob = await res.blob()
    return await faceapi.bufferToImage(blob)
  } catch (e) {
    console.error('received blob:', blob)
    console.error('error:', e)
    throw new Error('failed to load image from url: ' + imageUrl)
  }
}

function renderNavBar(navbarId, exampleUri) {
  const examples = [
    {
      uri: 'index.html',
      name: 'AI Based Interrogation System'
    },
    {
      uri: 'editDetails.html',
      name: 'Edit Details'
    },
    {
      uri: 'settings.html',
      name: 'Settings'
    },
    {
      uri: 'webcamTest.html',
      name: 'Camera Diagnostics'
    }

  ]

  const navbar = $(navbarId).get(0)
  const pageContainer = $('.page-container').get(0)

  const header = document.createElement('h5')
  const matchingExample = examples.find(ex => ex.uri === exampleUri)
  header.innerHTML = matchingExample ? matchingExample.name : exampleUri
  pageContainer.insertBefore(header, pageContainer.children[0])
  //pageContainer.insertBefore(navbar, pageContainer.children[0])

  const menuContent = document.createElement('ul')
  menuContent.id = 'slide-out'
  menuContent.classList.add('side-nav')
  navbar.appendChild(menuContent)

  const menuButton = document.createElement('a')
  menuButton.href='#'
  menuButton.classList.add('button-collapse', 'show-on-large')
  menuButton.setAttribute('data-activates', 'slide-out')
  const menuButtonIcon = document.createElement('img')
  menuButtonIcon.src = 'images/menu_icon.png'
  menuButton.appendChild(menuButtonIcon)
  navbar.appendChild(menuButton)

  const li = document.createElement('li')
  const githubLink = document.createElement('a')
  githubLink.classList.add('waves-effect', 'waves-light', 'side-by-side')
  githubLink.id = 'github-link'
  githubLink.href = 'https://parachutetech.ai'
  const h5 = document.createElement('h5')
  h5.innerHTML = 'Satyapan.ai'
  githubLink.appendChild(h5)
  const githubLinkIcon = document.createElement('img')
  githubLinkIcon.src = 'images/logo_36x36.png'
  githubLink.appendChild(githubLinkIcon)
  li.appendChild(githubLink)
  menuContent.appendChild(li)

  examples
    .forEach(ex => {
      const li = document.createElement('li')
      if (ex.uri === exampleUri) {
        li.style.background='#b0b0b0'
      }
      const a = document.createElement('a')
      a.classList.add('waves-effect', 'waves-light', 'pad-sides-sm')
      a.href = ex.uri
      const span = document.createElement('span')
      span.innerHTML = ex.name
      span.style.whiteSpace = 'nowrap'
      a.appendChild(span)
      li.appendChild(a)
      menuContent.appendChild(li)
    })

  $('.button-collapse').sideNav({
    menuWidth: 260
  })
}

function renderSelectList(selectListId, onChange, initialValue, renderChildren) {
  const select = document.createElement('select')
  $(selectListId).get(0).appendChild(select)
  renderChildren(select)
  $(select).val(initialValue)
  $(select).on('change', (e) => onChange(e.target.value))
  $(select).material_select()
}

function renderOption(parent, text, value) {
  const option = document.createElement('option')
  option.innerHTML = text
  option.value = value
  parent.appendChild(option)
}

document.addEventListener('deviceready', onDeviceReady, false);

async function onDeviceReady() {
    // Cordova is now initialized. Have fun!

      let MODEL_URL;
      if (window.device.platform === "Android") {
        MODEL_URL =
          window.cordova.file.applicationDirectory + "/www/weights/";
          console.log('model url: ', MODEL_URL);
        if(typeof faceapi == 'undefined') {
          return;
        }
        faceapi.env.monkeyPatch({
          readFile: filePath =>
            new Promise(resolve => {
              window.resolveLocalFileSystemURL(
                filePath,
                function(fileEntry) {
                  fileEntry.file(
                    function(file) {
                      var reader = new FileReader();

                      let fileExtension = filePath
                        .split("?")[0]
                        .split(".")
                        .pop();
                      console.log('filePath: ', filePath, 'ext:', fileExtension, ', file: ', file);
                      if (fileExtension === "json") {
                        reader.onloadend = function() {
                          resolve(this.result);
                        };
                        reader.readAsText(file);
                      } else {
                        reader.onloadend = function() {
                          resolve(new Uint8Array(this.result));
                        };

                        reader.readAsArrayBuffer(file);
                      }
                    },
                    function() {
                      resolve(false);
                    }
                  );
                },
                function() {
                  resolve(false);
                }
              );
            }),
          Canvas: HTMLCanvasElement,
          CanvasRenderingContext2D: CanvasRenderingContext2D,
          Image: HTMLImageElement,
          ImageData: ImageData,
          Video: HTMLVideoElement,
          createCanvasElement: () => document.createElement("canvas"),
          createImageElement: () => document.createElement("img"),
          fetch: function(url, options) {
            if(url.startsWith('data:image')) {
              return window['fetch'](url, options);
            }
            console.log('fetch: ', url, options);
            modifiedUrl = 'https://localhost/__cdvfile_assets__/www/' + url;
            return window['fetch'](modifiedUrl, options);
          }
        });
        //await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
        //await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
      } else {
        MODEL_URL = "./weights";
        //await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
        //await faceapi.loadFaceRecognitionModel(MODEL_URL);
      }
}

/*
// From https://stackoverflow.com/questions/56544635/using-face-api-js-in-cordova-with-android
export default {
  data: () => ({}),
  mounted() {
    let cls = this;
    document.addEventListener(
      "deviceready",
      function() {
        cls.loadFaceDetectModels();
      },
      false
    );
  },
  methods: {
    async loadFaceDetectModels() {
      let MODEL_URL;
      if (window.device.platform === "Android") {
        MODEL_URL =
          window.cordova.file.applicationDirectory + "www/static/models/";
        faceapi.env.monkeyPatch({
          readFile: filePath =>
            new Promise(resolve => {
              window.resolveLocalFileSystemURL(
                filePath,
                function(fileEntry) {
                  fileEntry.file(
                    function(file) {
                      var reader = new FileReader();

                      let fileExtension = filePath
                        .split("?")[0]
                        .split(".")
                        .pop();
                      if (fileExtension === "json") {
                        reader.onloadend = function() {
                          resolve(this.result);
                        };
                        reader.readAsText(file);
                      } else {
                        reader.onloadend = function() {
                          resolve(new Uint8Array(this.result));
                        };

                        reader.readAsArrayBuffer(file);
                      }
                    },
                    function() {
                      resolve(false);
                    }
                  );
                },
                function() {
                  resolve(false);
                }
              );
            }),
          Canvas: HTMLCanvasElement,
          Image: HTMLImageElement,
          ImageData: ImageData,
          Video: HTMLVideoElement,
          createCanvasElement: () => document.createElement("canvas"),
          createImageElement: () => document.createElement("img")
        });
        await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
      } else {
        MODEL_URL = "./static/models";
        await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
      }

      this.testFaceDetector();
    },
    testFaceDetector() {
      let cls = this;
      let baseImage = new Image();
      baseImage.src = "./static/img/faceWillSmith.jpg";
      baseImage.onload = function() {
        faceapi
          .detectSingleFace(baseImage, new faceapi.TinyFaceDetectorOptions())
          .run()
          .then(res => {
            alert(JSON.stringify(res));
          });
      };
    }
  }
};
*/
