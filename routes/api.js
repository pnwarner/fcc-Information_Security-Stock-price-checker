'use strict';
const crypto = require('crypto');
const saltStr = 'StockPriceChecker';
const StockLikes = require("../models").StockLikes;

const fetchData = async (url) => {
  try {
      const res = await fetch(url);
      const data = await res.json();
      return data
  } catch(err) {
      console.log(err);
  }
}

function hashString(data) {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
}

async function getStock(req, stock, like) {
  let stockData = await getStockData(stock);
  if (stockData) {
    let newData = await parseStockData(stockData);
    if (like === 'true') {
      newData.likes = await addLikeToStock(req, newData.stock);
    }
    return newData
  } else {
    return false
  }
}

async function getStockData(string) {
  let result = await fetchData(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${string}/quote`);
  if (result === 'Unknown symbol') {
    return false
  } else {
    return result
  }
}

async function parseStockData(dataObject) {
  let newObject = {
    stock: dataObject['symbol'],
    price: dataObject['latestPrice']
  }
  let currentStock = await symbolInDB(newObject.stock);
  if(currentStock) {
    newObject['likes'] = currentStock.likes.length
  } else {
    const newDBObject = new StockLikes( { symbol: newObject.stock, likes: [] } );
    const result = await newDBObject.save()
    if (result) {
      newObject['likes'] = 0;
      return newObject
    } else {
      return false
    }
  }
  return newObject
}

async function addLikeToStock(req, symbol) {
  // Add Hashed IP to stock if not in list, returns updated number of likes for stock
  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  const hashedString = hashString(ipAddress);
  const stock = await StockLikes.find({symbol: symbol});
  let stock_list = stock[0].likes;
  if (!stock_list.includes(hashedString)) {
    stock_list.push(hashedString);
    let updatedRecord = await StockLikes.findOneAndUpdate({ symbol: symbol }, { likes: stock_list }, { new: true });
  }
  return stock_list.length
}

async function symbolInDB(string) {
  let result = await StockLikes.find({symbol: string});
  if (result.length >= 1) {
    return result[0];
  } else {
    return false
  }
}



module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let { stock, like } = req.query;
      //Check for Proper query items
      if(!like){
        like = 'false';
      }
      if (stock && like) {
        // Handle single stock request
        if (typeof(stock) === 'string') {
          let stock_data = await getStock(req, stock, like);
          if (stock_data) {
            res.json({stockData: stock_data});
          } else {
            res.json({Error: 'Invalid value'});
          }
        }
        //Compare Stocks
        else if (typeof(stock) === 'object') {
          let stock1 = await getStock(req, stock[0], like);
          let stock2 = await getStock(req, stock[1], like);
          if (stock1 && stock2) {
            stock1['rel_likes'] = stock1.likes - stock2.likes;
            stock2['rel_likes'] = stock2.likes - stock1.likes;
            res.json({stockData: [{stock: stock1.stock, price: stock1.price, rel_likes: stock1.rel_likes},{stock: stock2.stock, price: stock2.price, rel_likes: stock2.rel_likes}]})
          } else {
            res.json({Error: 'Invalid value'});
          }
        }
      //Handle Errors  
      } else {
        res.json({Error: 'Invalid arguments'});
      }
    });
    
};
