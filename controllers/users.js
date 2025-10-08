const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const db = require("../data/database");
const { promisify } = require("util");

exports.isLoggedIn = async (req, res, next) => {
 req.name = "Check Login...";
 
 console.log(req.cookies);
 
 if(req.cookies.user){
   try {
       const decode = await promisify(jwt.verify)(
           req.cookies.user,
           "SHUBHAMDODE"
       )
    console.log(decode);
   
    const [result] = await db.query("select * from users where id=?",[decode.id]);
    console.log(result);
    
    if(!result){
        return next();
    }
    req.users = result[0];
    return next();


} catch (error) {
    console.log(error);
    return next();
    
   }

 }
 else{

     next();
 }
}