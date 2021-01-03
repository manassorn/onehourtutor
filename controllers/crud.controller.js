var firestore = require('../services/firestore.service')

module.exports.create = (collection, payload) => {
    firestore.create(collection, payload)
}

module.exports.update = (collection, id, payload) => {
    firestore.update(collection, id, payload)
}

module.exports.read = async (collection) => {
  const snapshot = await firebase.firestore().collection(collection).get()
  return snapshot.docs.map(doc => doc.data());
}