const express=require('express');
const { errorHandler, error } = require('./middleware/errorHandler');
const { HTTP_STATUS } = require('./constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('./constants/statusMessages');
const { router } = require('./routes/authRoutes');

const app=express();
app.use(express.json());

const PORT=process.env.PORT||3002;

app.use(router);

app.use((req,res,next)=>{
    error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.URL_NO_FOUND(req.originalUrl),next)
})
app.use(errorHandler)
app.listen(PORT,()=>{
    console.log('This thing is working!')
});