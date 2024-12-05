const { Firestore } = require('@google-cloud/firestore');
const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { confidenceScore, label, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data);

  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data
  })
  response.code(201);
  return response;
}

async function getPredictHistoryHandler(request, h) {
  const db = new Firestore();

  try {
    const predictCollection = db.collection('prediction');
    const predictData = await predictCollection.get();

    if(predictData.empty) {
      const response = h.response({
        status: 'success',
        data: [],
      })
      response.code(200);
      return response;
    } else {
      const history = predictData.docs.map(doc => ({
        id: doc.id,
        history: doc.data(),
      }));
  
      const response = h.response({
        status: 'success',
        data: history,
      })
      response.code(200);
      return response;
    }

  } catch (err) {
    console.error('Error fetching prediction history:', err);
    const response = h.response({
      status: 'fail',
      message: 'Unable to get predict history'
    })
    response.code(500);
    return response;
  }
} 

module.exports = { postPredictHandler, getPredictHistoryHandler };