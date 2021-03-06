var express = require('express');
var router = express.Router();

var api = require('./api')
var crudController = require('../controllers/crud.controller')
var coursesController = require('../controllers/courses.controller')



router.post('/', async (req, res, next) => {
  const title = req.body.title
  const description = req.body.description
  const schoolLevel = req.body.schoolLevel
  const subject = req.body.subject
  const price = req.body.price
  const tutorId = req.user.userId

  const payload = { title, description, schoolLevel, subject, price, tutorId }

  const course = await crudController.create('Courses', payload)

  api.ok(res, course)

});

router.put('/:id', async (req, res, next) => {
  const courseId = req.params.id
  const title = req.body.title
  const description = req.body.description
  const schoolLevel = req.body.schoolLevel
  const subject = req.body.subject
  const price = req.body.price
  const tutorId = req.user.userId

  const payload = { title, description, schoolLevel, subject, price, tutorId }

  const course = await crudController.update('Courses', courseId, payload)

  api.ok(res, course)

});

router.get('/', async (req, res, next) => {
  var userId = req.user.id
  var courses = await coursesController.listByOwner(userId)
  api.ok(res, courses)
});

router.get('/:id', async (req, res, next) => {
  var id = req.params.id
  var course = await coursesController.get(id)
  api.responseOk(res, course)
});

module.exports = router