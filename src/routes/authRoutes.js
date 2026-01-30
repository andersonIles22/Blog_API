const express=require('express');
const authControllers=require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationInputs');
{validateRegister,validateLogin}

const router=express.Router();

router.post('/register',validateRegister,authControllers.register);
router.post('/login',validateLogin,authControllers.login);


module.exports=router;