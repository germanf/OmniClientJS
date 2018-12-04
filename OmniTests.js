const Omni = new (require('./lib/OmniClient').Omni)();
let fs = require('fs');
let starWars = require('starwars');

let configurationFile = 'configuration.json';
let configuration = JSON.parse(
  fs.readFileSync(configurationFile)
);

// Save client in a variable, even though all calss are made through the Omni object
let testClient = Omni.init(configuration.rpcuser, configuration.rpcpassword, null, true);

let STP = { properties: [], books: [], pairs: [], trades: [] };

let balances = [];

let wallet = {};

let addresses = [];

let suffixes = ['credits', 'peso', 'dollar', 'yuan', 'yen', 'pound', 'schilling', 'won'];

let address = 'n4Po8andi3akpQBxzBWXbQBttF9LueXqyo';

let address2 = '';

let trades = [{
  address: address,
  id1: 0,
  amountforsale: '0',
  id2: 0,
  amountdesired: '0',
  time: 0,
  result: 'err||txid'
}];

let ids = [];

let nthTrade = 0;

let account = 0;


Omni.listaccounts((err, accounts) => {
  console.log(accounts);
  account = accounts[0]
});

Omni.getnewaddress(account, (err, newAddress) => {
  console.log(newAddress);
  address2 = newAddress
});

Omni.getallbalancesforaddress(address, (err, data) =>{
  balances = data;
  //console.log(balances)
  for(let i = 2; i < data.length; i++) {
    ids.push(balances[i]['propertyid'])
  }
  console.log(ids)
});

const nameGen=() =>{
  let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  let vowels = ['a', 'e', 'i', 'o', 'u'];
  let max = Math.round(Math.random() * 3) + 2;
  let newName = '';
  for(let letter = 0; letter < max; letter++) {
    let rand = Math.round(Math.random() * 25);
    let newLetter = '';
    if (letter == 1 || letter == 3) {
      rand = Math.round(Math.random() * 4);
      newLetter = vowels[rand]
    } else {
      newLetter = alphabet[rand]
    }
    newName += newLetter
  }
  rand = Math.round(Math.random() * 7);
  newName = newName + suffixes[rand];
  //console.log(newName)
  return newName
}

const newProperty=(cb) =>{
  Omni.listproperties((err, data) => {
    let obj = JSON.stringify(data);
    STP.properties = data;
    let array = [];
    for(let i = 0; i < STP.properties.length; i++) {
      array.push(STP.properties[i].propertyid)
    }
    array = array.sort((a, b) => a - b);
    let value = data.length - 1;
    id = data[value].propertyid;
    console.log('id:' + id);
    
    
    fs.writeFile('omnitestproperties.json', obj, (err) => {
      if (err) {
        throw err
      }
    });
    return cb(id)
  })
}

const issueManaged=() =>{
  let newName = nameGen();
  let data = starWars();
  
  let params = {
    fromaddress: address,
    ecosystem: 2,
    type: 2,
    previousid: 0,
    category: 'Fictional Currency',
    subcategory: 'Feeat',
    name: newName,
    url: 'BancoFee.fu',
    data: data
  };
  
  Omni.sendissuancemanaged(params, (err, data) => {
    //console.log('issueance cb'+data)
    newProperty((id) => {
      console.log('id check' + id);
      Omni.sendgrant(address, address, id, '1000000', 'blah!', (err, data) => console.log('initial grant:' + data));
    })
  })
}

const nextOrder=(id1) =>{
  let id2 = 2;
  let rand = Math.random() * 10000;
  let pair = [id1, id2];
  let rand2 = Math.random() * 5000;
  //STP.pairs.push(pair)
  //console.log(address+' '+id1+' '+rand+' '+id2+' '+rand2)
  Omni.sendtrade(address, id1, rand, id2, rand2, (err, data) => {
    if (err) {
      console.log(err);
      return err;
    }
    const trade = {
      address: address,
      id1: id1,
      amountforsale: rand,
      id2: id2,
      amountdesired: rand2,
      time: Date.now(),
      result: data,
    };
    
    if (nthTrade < ids.length) {
      console.log('recording' + JSON.stringify(trade));
      trades.push(trade);
    } else {
      return null;
    }
    //console.log('Trade'+data)
    nthTrade += 1;
    nextOrder(ids[nthTrade]);
  });
}

const orderBooks=() =>{
  for(let p = 2; p < length; p++) {
    let id1 = array[p]['propertyid'];
    let id2 = 2;
    if (id1 == id2 || id1 == 1) {
      //console.log('duplicate')
    } else {
      Omni.getorderbook(id1, id2, (err, data) => {
        //console.log("Book"+JSON.stringify(data))
        if (data == undefined) {
        } else {
          STP.books.push(makeBook(data))
        }
      })
    }
    //console.log(STP.books)
  }
}


const makeBook=(data) =>{
  let book = { name: '', bids: [], asks: [] };
  
  for(let i = 0; i < data.length; i++) {
    
    let order = data[i];
    let id1 = order['propertyidforsale'];
    let name1 = '';
    
    Omni.getproperty(id1, (err, data1) => {
      name1 = data1['name'];
      book.name = name1;
    });
    
    let id2 = order['propertyiddesired'];
    let name2 = '';
    
    Omni.getproperty(id2, (err, data2) => {
      name2 = data2['name'];
    });
    
    let amtSale = parseFloat(order['amountforsale']);
    let amtDesired = parseFloat(order['amountdesired']);
    let unitPrice = amtSale / amtDesired;
    let bookEntry = [amtSale, unitPrice];
    book.asks.push(bookEntry);
  }
  let sortedAsk = book.asks.sort((a, b) => a - b);
  //console.log(sortedAsk)
  return sortedAsk;
}

const loop = (cb) => {
  nthTrade = 0;
  nextOrder(ids[nthTrade]);
  setTimeout(() => {
    //issueManaged()
    Omni.getallbalancesforaddress(address, (err, data) => {
      balances = data;
      console.log(data);
      for(let i = 2; i < data.length; i++) {
        ids.push(balances[i]['propertyid']);
      }
    });
    fs.writeFile('testTrades.json', JSON.stringify(trades), (err) => {
      if (err) throw err;
    });
    
    loop();
  }, 60000);
  
}

setTimeout(loop, 2000);

/*
Array.prototype.pairs = function (func) {
    let pairs = [];
    for (let i = 0; i < this.length - 1; i++) {
        for (let j = i; j < this.length - 1; j++) {
            pairs.push([this[i], this[j+1]]);
        }
    }
    return func(pairs)
}

function selectCat(sub, cb){
    let array = []
for(let i = 0; i< STP.properties.length; i++){
    let property = STP['properties'][i]
    let subcategory = property['subcategory']
        if(subcategory == sub){
            array.push(property)
        }
    }
    array.pairs(function(pairs){
        console.log(pairs)
        return cb(pairs)
    })
}*/


/*fs.readFile('omnitestproperties.json',function(data){
    STP = JSON.parse(data)
    console.log(STP)
})

    let params = {fromaddress: address,
                    ecosystem: 2,
                    type: 1,
                    previousid: 0,
                    category: "Relic",
                    subcategory: "Dense",
                    name: "Unliftable Gem",
                    url: "www.seektherelic.org",
                    data: "These materials are primal, forged from spacetime. May bestow powers, makes a great paperweight.",
                    amount: "7",
                    tokensperunit: "1",
                    deadline: 1454114063,
                    earlybonus: 1,
                    issuerpercentage:42
                }
                
    let params2 = {fromaddress: address,
                    ecosystem: 2,
                    type: 1,
                    previousid: 0,
                    category: "Relic",
                    subcategory: "Dense",
                    name: "Unliftable Gem",
                    url: "www.seektherelic.org",
                    data: "These materials are primal, forged from spacetime. May bestow powers, makes a great paperweight.",
                    amount: "7",
                    tokensperunit: "1",
                    deadline: 1454114063,
                    earlybonus: 1,
                    issuerpercentage:42
                }

//Omni.sendissuancefixed(params, function(data){
//    console.log("fixed issuance:"+ data)
//})
/*let balance

Omni.getbalance(address, 2, function(data){
    console.log(data)
    balance = parseFloat(data)
})

let book

Omni.getorderbook(2, 8, function(data){

    console.log(data)
    book = data
})


Omni.sendtoaddress("n4Po8andi3akpQBxzBWXbQBttF9LueXqyo", .01, function(data){
    console.log(data)
})

Omni.getomnibalance(address, 1, function(data){
    console.log(data)
})*/

/*Omni.getaccountaddress('',function(data){
//console.log(data)
account = data
 addresses.push(address)
 wallet =  {addresses: addresses,account:account}
 //console.log(wallet)
 Omni.validateaddress(addresses[0], function(data){
     //console.log(data)
 })
})*/

//Omni.getactivecrowdsales_layer(function(data){
//    console.log(data)
//})

/*Omni.getactivedexsells_layer(function(data){
    //console.log(data)
})

Omni.getgrants_layer(23, function(data){
    console.log("grants"+data)
})
*/

