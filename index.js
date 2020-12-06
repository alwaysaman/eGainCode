/**
 * This program is developed by Aman Abhishek as task provided for Node.js Test
 * @author Aman Abhishek
 * Date : 5th December 2020
 */

//imports
let express = require("express");
const bodyparser = require("body-parser");
let config = require('./config.json');
const jwt = require("jsonwebtoken");
const request = require('request');
const Promise = require('promise');
const { json } = require("body-parser");
//initialization and middlewares
const app = express();
app.use(bodyparser.json());


//port to be asssigned either by heroku or other client incase if 8000 is not available.
let port = process.env.port || process.env.PORT || 8000;


//Authorisation check Middleware.
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {

        const splitHeader = authHeader.split(' ');  
        const token = splitHeader[1];
        if (splitHeader[0] === "token" || splitHeader[0] === "Token" || splitHeader[0] === "TOKEN"){
            jwt.verify(token, config.JWTsecret, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }
    
                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
        
    } else {
        res.sendStatus(401);
    }
};


//Home route
app.get('/', (req, res)=>{
    res.send("Hello World");
});

//Login Route
app.post('/login', (req, res)=>{
    console.log(req.body);
    let {username, password} = req.body;
    const accessToken = jwt.sign({username, password}, config.JWTsecret);
    res.json({accessToken});
});

app.get('/login', (req, res)=>{
    res.status(404);
    res.json({
        "message" : "Use POST instead of GET"
    })
});

//Check the result once the login is successful.
app.get('/getAllData', authenticateJWT, (req, res)=>{
  let queryString = req.query.productName;
    console.log(queryString);
    const amazonHeaders = {
        method: 'get',
        url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/offers/amazon',
        headers: { 
          'Accept': 'application/json', 
          'Accept-Language': 'en-us'
        }
    };
    const flipkartHeaders = {
        method: 'get',
        url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/offers/flipkart',
        headers: { 
            'Accept': 'application/json', 
            'Accept-Language': 'en-us'
        }
    };

    const snapdealHeaders = {
        method: 'get',
        url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/offers/snapdeal',
        headers: { 
            'Accept': 'application/json', 
            'Accept-Language': 'en-us'
        }
    };

    //------------------------ Product Price -------------------------------------------------------------//

    const amazonPrice = {
        method: 'get',
        url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/product/amazon?productName='+queryString,
        headers: { 
        'Accept': 'application/json', 
        'Accept-Language': 'en-us'
        }
    };
    const flipkartPrice = {
    method: 'get',
    url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/product/flipkart?productName='+queryString,
    headers: { 
        'Accept': 'application/json', 
        'Accept-Language': 'en-us'
    }
    };

    const snapdealPrice = {
    method: 'get',
    url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/product/snapdeal?productName='+queryString,
    headers: { 
        'Accept': 'application/json', 
        'Accept-Language': 'en-us'
    }
};

//------------------------ Product Details -------------------------------------------------------------//

const productDetails = {
    method: 'get',
    url: 'https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage//ws/product/details?productName=' +queryString,
    headers: { 
      'Accept': 'application/json', 
      'Accept-Language': 'en-us'
    }
};

let productDescription = new Promise((resolve, reject)=>{
    
    request(productDetails, (err, res)=>{
        
        if (err) reject (err);
        else resolve(res);
    });
});

//offers
let snapDealOffers = new Promise((resolve, reject)=>{
    request(snapdealHeaders, (err, res)=>{
        if (err) reject (err);
        else resolve(res);
    });
});

let flipkartOffers = new Promise((resolve, reject)=>{
    request(flipkartHeaders, (err, res)=>{
        if (err) reject (err);
        else resolve(res);
    });
});

let amazonOffers = new Promise((resolve, reject)=>{
    request(amazonHeaders, (err, res)=>{
        if (err) reject (err);
        else resolve(res);
    });
});
//price
let getSnapdealPrice = new Promise((resolve, reject)=>{
    request(snapdealPrice, (err, res)=>{
        if (err) reject (err);
        else resolve(res);
    });
});

let getFlipkartPrice = new Promise((resolve, reject)=>{
    request(flipkartPrice, (err, res)=>{
        if (err) reject (err);
        else resolve(res);
    });
});

let getAmazonPrice = new Promise((resolve, reject)=>{
    request(amazonPrice, (err, res)=>{
        if (err) reject (err);
        else resolve(res);
    });
});
Promise.all([ productDescription, snapDealOffers, getSnapdealPrice, flipkartOffers, getFlipkartPrice, amazonOffers, getAmazonPrice])
    .then((result)=>{
        console.log("returning result " + result);
        res.json({
            "data" : {
                "productName" : queryString,
                "productDescription" : JSON.parse(result[0].body),
                "Snapdeal" : {
                    "price" : JSON.parse(result[2].body),
                    "offers" : JSON.parse(result[1].body)
                },
                "Flipkart" : {
                    "price" : JSON.parse(result[4].body),
                    "offers" : JSON.parse(result[3].body)
                },

                "Amazon" : {
                    "price" : JSON.parse(result[6].body),
                    "offers" : JSON.parse(result[5].body)
                }

            }
        });
    });
 
});




// Server listen to port
app.listen(port, ()=>console.log("server running"));
