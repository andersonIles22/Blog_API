const express=require('express');
const { errorHandler, error } = require('./middleware/errorHandler');
const { HTTP_STATUS } = require('./constants/httpStatusCode');
const { MESSAGES_OPERATION } = require('./constants/statusMessages');
const authRoutes = require('./routes/authRoutes');
const postsRoutes=require('./routes/postsRoutes')

const app=express();
app.use(express.json());

app.use('/api/posts',postsRoutes); 
app.use('/api/auth',authRoutes);

app.use((req,res,next)=>{
    error(HTTP_STATUS.NOT_FOUND,MESSAGES_OPERATION.URL_NO_FOUND(req.originalUrl),next)
})
app.use(errorHandler)

module.exports=app;
