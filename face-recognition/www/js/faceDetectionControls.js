const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'


let selectedFaceDetector = SSD_MOBILENETV1

// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5

let maxFRThreshold = 0.55

function round(num, prec) {
    if (prec === void 0) { prec = 2; }
    var f = Math.pow(10, prec);
    return Math.floor(num * f) / f;
}

async function onIncreaseFRThreshold() {
  maxFRThreshold = Math.min(round(maxFRThreshold + 0.05), 1.0)
  $('#maxFRThreshold').val(maxFRThreshold)
  await updateResults()
}

async function onDecreaseFRThreshold() {
  maxFRThreshold = Math.max(round(maxFRThreshold - 0.05), 0.1)
  $('#maxFRThreshold').val(maxFRThreshold)
  await updateResults()
}

async function onIncreaseMinConfidence() {
  minConfidence = Math.min(round(minConfidence + 0.05), 1.0)
  $('#minConfidence').val(minConfidence)
  await  updateResults()
}

async function onDecreaseMinConfidence() {
  minConfidence = Math.max(round(minConfidence - 0.05), 0.1)
  $('#minConfidence').val(minConfidence)
  await updateResults()
}

async function onInputSizeChanged(e) {
  changeInputSize(e.target.value)
  await updateResults()
}

function changeInputSize(size) {
  inputSize = parseInt(size)

  const inputSizeSelect = $('#inputSize')
  inputSizeSelect.val(inputSize)
}

async function onIncreaseScoreThreshold() {
  scoreThreshold = Math.min(round(scoreThreshold + 0.05), 1.0)
  $('#scoreThreshold').val(scoreThreshold)
  await updateResults()
}

async function onDecreaseScoreThreshold() {
  scoreThreshold = Math.max(round(scoreThreshold - 0.05), 0.1)
  $('#scoreThreshold').val(scoreThreshold)
  await updateResults()
}

function onIncreaseMinFaceSize() {
  minFaceSize = Math.min(round(minFaceSize + 20), 300)
  $('#minFaceSize').val(minFaceSize)
}

function onDecreaseMinFaceSize() {
  minFaceSize = Math.max(round(minFaceSize - 20), 50)
  $('#minFaceSize').val(minFaceSize)
}

function getCurrentFaceDetectionNet() {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector
  }
}

function isFaceDetectionModelLoaded() {
  return !!getCurrentFaceDetectionNet().params
}

async function changeFaceDetector(detector, loadSelectedModel = true) {
  ['#ssd_mobilenetv1_controls', '#tiny_face_detector_controls']
    .forEach(id => {
      console.log('hiding ', id)
      $(id).hide()
    })

  selectedFaceDetector = detector
  const faceDetectorSelect = $('#selectFaceDetector')
  faceDetectorSelect.val(detector)

  $('#loader').show()
  if (loadSelectedModel && !isFaceDetectionModelLoaded()) {
    await getCurrentFaceDetectionNet().load("weights/")
  }

  $(`#${detector}_controls`).show()
  $('#loader').hide()
}

async function onSelectedFaceDetectorChanged(e) {
  selectedFaceDetector = e.target.value

  await changeFaceDetector(e.target.value, typeof faceapi != 'undefined')
  await updateResults()
}

function initFaceDetectionControls() {
  const faceDetectorSelect = $('#selectFaceDetector')
  faceDetectorSelect.val(selectedFaceDetector)
  faceDetectorSelect.on('change', onSelectedFaceDetectorChanged)

  const inputSizeSelect = $('#inputSize')
  inputSizeSelect.val(inputSize)
  inputSizeSelect.on('change', onInputSizeChanged)
}