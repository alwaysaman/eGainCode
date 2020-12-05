/**
 * This program is developed by Aman Abhishek as task provided for Node.js Test
 * @author Aman Abhishek
 * Date : 5th December 2020
 */

//imports
let express = require("express");
const app = express();

//port to be asssigned either by heroku or other client incase if 8000 is not available.
let port = process.env.port || process.env.PORT || 8000;

//Home route
app.get('/', (req, res)=>{
    res.send("Hello World");
});



// Server listen to port
app.listen(port, ()=>console.log("server running"));
