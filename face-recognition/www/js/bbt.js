const classes = ['amy', 'bernadette', 'howard', 'leonard', 'penny', 'raj', 'sheldon', 'stuart']

function getFaceImageUri(className, idx) {
  return `images/${className}/${className}${idx}.png`
}

function renderFaceImageSelectList(selectListId, onChange, initialValue) {
  const indices = [1, 2, 3, 4, 5]
  function renderChildren(select) {
    classes.forEach(className => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = className
      select.appendChild(optgroup)
      indices.forEach(imageIdx =>
        renderOption(
          optgroup,
          `${className} ${imageIdx}`,
          getFaceImageUri(className, imageIdx)
        )
      )
    })
  }

  renderSelectList(
    selectListId,
    onChange,
    getFaceImageUri(initialValue.className, initialValue.imageIdx),
    renderChildren
  )
}

async function docExists(db, docId) {
  let ret = await db.get(docId).then((doc) => doc).catch(() => false)
  return ret
}

async function attachmentExists(db, docId, attachmentId) {
  let ret = await db.getAttachment(docId, attachmentId).then((doc) => doc).catch(() => false)
  return ret
}

// doc returned by allDocs when include_docs and attachments is not specified
async function removeFromDb(db, doc) { await db.remove(doc.id, doc.value.rev) }

async function clearFacesDB(db) {
    let alldocs = await db.allDocs()
    await Promise.all(alldocs.rows.map(
      async doc => {
        removeFromDb(db, doc)
      }))
}

async function buildFacesDB(numImagesForTraining = 1, clearDb = false) {
  const maxAvailableImagesPerClass = 5
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass)

  let db = new PouchDB('faces_db');

  if(clearDb) {
    console.log('Clearing existing face embedding DB...')
    await clearFacesDB(db)
  }

  const labeledFaceDescriptors = await Promise.all(classes.map(
    async className => {
      let doc = {
        '_id': className,
        'name': className
      }
      let existingDoc = await docExists(db, className)
      if(existingDoc) {
        console.log('doc for ' + className + ' exists.', existingDoc)
        doc = existingDoc
      }
      doc._attachments = {}
      for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const imageUri = getFaceImageUri(className, i)
        let attachmentId = imageUri.split('/')[1]
        let embeddingAttachmentId = `${attachmentId.split(".")[0]}.bin`
        let exists = await attachmentExists(db, className, attachmentId)
        if(exists) {
          console.log('Embedding exists for ' + className + ' and ' + attachmentId)
          continue
        }
        console.log('Embedding will be created for ' + className + ' and ' + attachmentId)
        const img = await faceapi.fetchImage(imageUri)
        let embedding = await faceapi.computeFaceDescriptor(img)
        let embeddingType = 'application/octet-stream'
        // Strip off "data:image/png;base64," from data url
        doc._attachments[attachmentId] = {
          'content_type': 'text/png',
          'data': img.src.split('base64,')[1]
        }
        doc._attachments[embeddingAttachmentId] = {
          'content_type': embeddingType,
          'data': new Blob([embedding], {'type': embeddingType})
        }
      }
      let savedDoc = await db.put(doc)
      console.log('Saved embedding and image: ', savedDoc)
    }
  ))
}

// From https://gist.github.com/sketchpunk/f5fa58a56dcfe6168a9328e7c32a4fd4
function base64_to_float32Array(attachment) {
  let blob  = window.atob(attachment),
      fLen  = blob.length / Float32Array.BYTES_PER_ELEMENT,           // How many floats can be made, but be even
      dView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)),  // ArrayBuffer/DataView to convert 4 bytes into 1 float.
      fAry  = new Float32Array(fLen),                     // Final Output at the correct size
      p     = 0;                                // Position

  for(let j=0; j < fLen; j++){
    p = j * 4;
    dView.setUint8(0,blob.charCodeAt(p));
    dView.setUint8(1,blob.charCodeAt(p+1));
    dView.setUint8(2,blob.charCodeAt(p+2));
    dView.setUint8(3,blob.charCodeAt(p+3));
    fAry[j] = dView.getFloat32(0,true);
  }
  return fAry;
}

// fetch first image of each class and compute their descriptors
async function createBbtFaceMatcher() {
  let db = new PouchDB('faces_db');

  let alldocs = await db.allDocs({include_docs: true, attachments: true})
  const labeledFaceDescriptors = alldocs.rows.map(row => {
    let descriptors = Object.keys(row.doc._attachments).filter(k => k.endsWith('.bin')).map(k => {
      let attachment = row.doc._attachments[k]
      return base64_to_float32Array(attachment.data)
    })
    return new faceapi.LabeledFaceDescriptors(
        row.doc.name,
        descriptors
      )
  })

  return new faceapi.FaceMatcher(labeledFaceDescriptors)
}