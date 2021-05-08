var jwt = require('jsonwebtoken')
var axios = require('axios')
var express = require('express');
var router = express.Router();

var api = require('./api')
var crudController = require('../controllers/crud.controller')
var userController = require('../controllers/user.controller')

router.post('/fb', async (req, res, next) => {
  axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`)
    .then(response => {
      const { data } = response;
      if (data.error) return api.responseUnauthorized(res, data.error.message);
      
      let account = crudController.readByUniqueField('loginAccounts', 'fbId', data.id)
      if(!account) {
        const user = {
          name: data.name
        }
        const userRef = await crudController.create('users', user)
        account = {
          fbId: data.id,
          userId: userRef.id
        }
        crudController.create('loginAccounts', account)
        return api.responseOk(res, user)

      } else {
        const user = await crudController.readById('users', account.userId)
        return api.responseOk(res, user)
      }
      
  
  
      /*return ok({
        ...account,
        token: generateJwtToken(account)
      });*/
    });
})

router.post('/email', async () => {

})

router.post('/login', async (req, res, next) => {
  const user = await userController.getUserByEmailPassword(req.body.email, req.body.password)
  if (user) {
    // Generate an access token
    const accessToken = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, {expiresIn: 60});
    res.cookie('accesstoken', accessToken, { expires: new Date(Date.now() + 900000), httpOnly: true, secure: true })
    api.responseOk(res, {accessToken})
  } else {
    api.responseError(res, 'login not success')
  }
});

router.get('/devlogin/:userId', async (req, res, next) => {
  //hNqOKzYwhJjZTIDLUkf5
  const userId = req.params.userId
  const accessToken = jwt.sign({ userId }, process.env.TOKEN_SECRET, {expiresIn: 60});
  res.cookie('accesstoken', accessToken, { expires: new Date(Date.now() + 900000), httpOnly: true, secure: true })
  api.responseOk(res, {accessToken})
});

router.get('/session', async (req, res, next) => {
  api.responseOk(res,req.session)
});

router.post('/logout', async (req, res, next) => {
  req.user = null
  api.responseOk(res)
});

function generateJwtToken(userId) {
  const accessToken = jwt.sign({ userId }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
  return accessToken;
  
  res.cookie('accesstoken', accessToken, { expires: new Date(Date.now() + 900000), httpOnly: true, secure: true })
  api.responseOk(res, { accessToken })
}



module.exports = router;

module.exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};