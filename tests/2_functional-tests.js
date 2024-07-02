const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET /api/stock-prices/ => conversion object', function() {
        
        test('Viewing one stock (valid input)', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog'})
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                done();
            });
        });

        test('Viewing one stock and liking it', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: "goog", like: 'true'})
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.equal(res.body.stockData.likes, 2);
                done();
            });
        });

        test('Viewing one stock and liking it again', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: "goog", like: 'true'})
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.equal(res.body.stockData.likes, 2);
                done();
            });
        });

        test('Viewing two stocks', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: ["goog", "aapl"]})
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, 'GOOG');
                assert.equal(res.body.stockData[1].stock, 'AAPL');
                done();
            });
        });

        test('Viewing two stocks and liking them', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: ["goog", "aapl"], like: 'true'})
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, 'GOOG');
                assert.equal(res.body.stockData[1].stock, 'AAPL');
                assert.equal(res.body.stockData[0].rel_likes, 0);
                assert.equal(res.body.stockData[1].rel_likes, 0);
                done();
            });
        });
    });
});
