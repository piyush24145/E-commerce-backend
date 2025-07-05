const mongoose=require("mongoose");

const categorySchema=new mongoose.Schema({
    name:{type:String ,required:true ,unique:true , trime:true},
    description:{type:String},
    createdAt:{type:Date , default:new Date()}
})

module.exports=mongoose.model("Category",categorySchema)