var jwt = require('jsonwebtoken')
var axios = require('axios')
var express = require('express');
var router = express.Router();

var api = require('./api')
var crudController = require('../controllers/crud.controller')
var userController = require('../controllers/user.controller')
var authenController = require('../controllers/authen.controller')


router.post('/fb', async (req, res, next) => {
  axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`)
    .then(async (response) => {
      const { data } = response;
      if (data.error) return api.responseUnauthorized(res, data.error.message);
      
      let account = crudController.readByUniqueField('loginAccounts', 'fbId', data.id)
      let user = undefined
      if(!account) {
        user = {
          name: data.name
        }
        const userRef = await crudController.create('users', user)
        user.id = userRef.id
        account = {
          fbId: data.id,
          userId: userRef.id
        }
        crudController.create('loginAccounts', account)

      } else {
        user = await crudController.readById('users', account.userId)
      }
      
      generateJwtToken(res, user.id)
      return api.responseOk(res, user)

  
    });
})

router.post('/email', async () => {

})

router.post('/login', async (req, res, next) => {
  const user = await authenController.login(req.body.email, req.body.password)
  
  if (user) {
    generateJwtToken(res, user.id)
    api.responseOk(res, user)
  } else {
    api.responseUnauthorized(res)
  }
});

router.get('/devlogin2/:userId', async (req, res, next) => {
  //hNqOKzYwhJjZTIDLUkf5
  console.log('asaaaaa')
  const userId = req.params.userId
  const token = generateJwtToken(res, userId)
  res.set('accessTokenDev', token)
  const user = crudController.readById('user', userId)
  api.responseOk(res, user)
});

router.get('/session', async (req, res, next) => {
  api.responseOk(res,req.session)
});

router.post('/logout', async (req, res, next) => {
  res.clearCookie('accesstoken',{httpOnly:true})
  api.responseOk(res)
});

function generateJwtToken(res, userId) {
  const accessToken = jwt.sign({ userId }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
  
  const d7 = 7 * 24 * 60 * 60 * 1000
  //res.cookie('accesstoken', accessToken, { expires: new Date(Date.now() + d7), httpOnly: true, secure: true })
  res.cookie('accesstoken', accessToken, { expires: new Date(Date.now() + d7), httpOnly: true })
  return accessToken
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