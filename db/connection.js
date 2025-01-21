import mongoose from 'mongoose'


// mongodb+srv://footballstore:footballstore@footballstore.wfm6x.mongodb.net/?retryWrites=true&w=majority

const url=`mongodb+srv://footballstore:footballstore@footballstore.wfm6x.mongodb.net/?retryWrites=true&w=majority`;

const connection = mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true})

export {connection};