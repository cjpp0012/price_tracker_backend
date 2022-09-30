var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const eBay = require("ebay-node-api");
const Subscription = require('../schema/Subscription');
const PriceHis = require('../schema/PriceHis')


const ebay = new eBay({
  clientID: "KaWog-cmsc389N-SBX-f234ca5c1-2028e172",
  clientSecret: 'SBX-234ca5c1b88e-dcc2-44f4-a827-c998',
  env: "SANDBOX",
  body: {
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope'
    }
});

const dbRoute = 'mongodb+srv://dbUser:dbUserPassword@cluster0.ylmk6.mongodb.net/database?retryWrites=true&w=majority';
mongoose.connect(dbRoute, { useUnifiedTopology: true });
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));//*
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//get the entire price history datebase when frontend is mounted
router.get('/product', function(req, res, next) {
    // /:item
    PriceHis.find(function (err, data) {
        // {item: req.params.item},
        if (err) {
            return res.json({ success: false, error: err });
        }
        else {
            return res.json({ success: true, info: data })
        }
    })
})


//post the current price from ebay
router.post('/product',function(req, res, next){
    update=(item,price)=>{
        let new_price = new PriceHis();
        new_price.item = item;
        new_price.date = new Date().getTime();
        new_price.price = parseFloat(price);
        new_price.save((err)=>{
            if(err){
                return res.json({success:false, error:err});
            }else{
                return res.json({success: true, productName: item, currPrice: parseFloat(price)})
            };
        });
    }

    ebay.getAccessToken()
    .then((data) => {
        ebay.searchItems({
            keyword: req.body.item,
            sortOrder: "PricePlusShippingLowest",
            limit: '1'
        }).then((data) => {
            var obj = JSON.parse(data);
            console.log(obj.itemSummaries)
            let item = obj.itemSummaries[0].title;
            let price = obj.itemSummaries[0].price.value;
            update(item,price)
        })
    });
})


//post email address and product to database
router.post('/track',function(req, res, next){
	let subscriber = new Subscription();
	subscriber.item = req.body.item;
	subscriber.email = req.body.email;
	subscriber.desired_price = req.body.desired_price;
	subscriber.save((err)=>{
        if(err){
            return res.json({success:false, error:err});
        }else{
            return res.json({success: true, existed: true})
        }	
    })
})

//update the desired_price if found matched email and itemname in database
router.put('/track',function(req, res, next){
    Subscription.updateOne({ email: req.body.email, item: req.body.item },{$set: {desired_price:req.body.desired_price}}, (err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
})

//remove
router.delete('/track',function(req, res, next){
    Subscription.findOneAndRemove({ email: req.body.email}, (err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
})


module.exports = router;