const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.node
    .decodeJpeg(image)
    .resizeNearestNeighbor([224, 224])
    .expandDims()
    .toFloat()

    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = score[0] * 100;
    // const confidenceScore = Math.max(...score) * 100;

    // const classes = ['Cancer','Non-cancer'];

    // const classResult = tf.argMax(prediction, 1).dataSync()[0];
    // const label = classes[classResult];

    const label = score[0] > 0.5 ? 'Cancer' : 'Non-cancer';

    if (label === 'Cancer') {
      suggestion = "Segera periksa ke dokter!"
      // suggestion = `Ini dari kolom Cancer: ${prediction}`
    }

    if (label === 'Non-cancer') {
      suggestion = "Penyakit kanker tidak terdeteksi."
      // suggestion = `Ini dari kolom Non-cancer: ${prediction}`
    }

    return { confidenceScore, label, suggestion };
  } catch (error) {
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
  }
}

module.exports = predictClassification;