/**
 * Omni Layer JSON-RPC client
 * Extends Bitcoin JSON-RPC client bitcoin by freewil,
 * requires Node.js 4.2 or later.
 *
 * @author Patrick Dugan
 * @author Sean Gilligan
 */
'use strict';

const BitcoinClient = require('bitcoin').Client;

/**
 * Extend the basic Bitcoin Client, 'bitcoin' by 'freewil' and add promises.
 * Code is based upon (copied from) the bitcoin-promise NPM module, but extensible so we can
 * subclass and add additional methods.
 */
class BitcoinPromisesClient extends BitcoinClient {
  /**
   * Use super-constructor
   * @param opts see super for format
   */
  constructor(opts) {
    super(opts);


// The below code copied from bitcoin-promise and may be possible to optimize
// Find all methods that are actually RPC calls
    (() => {
      let methods = Object.getOwnPropertyNames(BitcoinClient.prototype)
        .filter((p) =>
          (typeof BitcoinClient.prototype[p] === 'function' && p !== 'cmd' && p != 'constructor')
        );
      // Augment them with callRPC
      for(let i = 0; i < methods.length; i++) {
        let protoFn = methods[i];
        ((protoFn) => {
          BitcoinPromisesClient.prototype[protoFn] = () => {
            let args = [].slice.call(arguments);
            return this.callRpc(protoFn.toLowerCase(), args);
          };
        })(protoFn);
      }
    })();
  }
  
  /**
   * Call an RPC method
   * @param method method name
   * @param args arguments
   * @returns {*}
   */
  callRpc(method, args) {
    const client = this;
    let promise = null;
    let lastArgument = args[args.length - 1];

//	If the last argument is a callback, pop it from the args list
    if (typeof lastArgument === 'function') {
      args.pop();
      this.rpc.call(method, args, () => {
        let args = [].slice.call(arguments);
        args.unshift(null);
        lastArgument.apply(this, args);
      }, lastArgument);
    } else {
//		.....................................................
//		if no callback function is passed - return a promise
//		.....................................................
      const promise = new Promise((resolve, reject) => {
        client.rpc.call(method, args, () => {
          let args = [].slice.call(arguments);
          args.unshift(null);
//				----------------------
//				args is err,data,hdrs
//				but we can only pass 1 thing back
//				rather than make a compound object - ignore the headers
//				errors are handled in the reject below
          resolve(args[1]);
        }, reject);
      });
      
      return promise;
    }
  }
}

const OmniClientCommands = {
  //omniGetAllBalancesForAddress: 'omni_getallbalancesforaddress',
  omniGetBalance: 'omni_getbalance',
  //omniGetAllBalancesForId: 'omni_getallbalancesforid',
  omniGetTransaction: 'omni_gettransaction',
  omniGetOrderBook: 'omni_getorderbook',
  omniListTransactions: 'omni_listtransactions',
  omniListBlockTransactions: 'omni_listblocktransactions',
  omniGetProperty: 'omni_getproperty',
  omniListProperties: 'omni_listproperties',
  omniGetCrowdsale: 'omni_getcrowdsale',
  omniGetActiveCrowdsales: 'omni_getactivecrowdsales',
  omniGetActiveDexSells: 'omni_getactivedexsells',
  omniGetTrade: 'omni_gettrade',
  omniGetSto: 'omni_getsto',
  omniGetTradeHistoryForPair: 'omni_gettradehistoryforpair',
  omniGetTradeHistoryForAddress: 'omni_gettradehistoryforaddress',
  omniListPendingTransactions: 'omni_listpendingtransactions',
  omniSend: 'omni_send',
  omniSendDexSell: 'omni_senddexsell',
  omniSendCancelAllTrades: 'omni_sendcancelalltrades',
  omniSendCancelTradesByPrice: 'omni_sendcanceltradesbyprice',
  omniSendCancelTradesByPair: 'omni_sendcanceltradesbypair',
  omniSendChangeIssuer: 'omni_sendchangeissuer',
  omniSendTrade: 'omni_sendtrade',
  omniSendCloseCrowdsale: 'omni_sendclosecrowdsale',
  omniSendAll: 'omni_sendall',
  omniSendIssuanceCrowdsale: 'omni_sendissuancecrowdsale',
  omniSendIssuanceFixed: 'omni_sendissuancefixed',
  omniSendRevoke: 'omni_sendrevoke',
  omniSendGrant: 'omni_sendgrant',
  omniSendIssuanceManaged: 'omni_sendissuancemanaged'
};

/**
 * Omni JSON-RPC client that adds Omni methods to the existing Bitcoin methods
 * in bitcoin.Client.
 */
class OmniClient extends BitcoinPromisesClient {
  
  /**
   * Use super-constructor
   * @param opts see super
   */
  constructor(opts) {
    super(opts);
  }
  
  /**
   * Call omni_getallbalancesforaddress
   *
   * @param address Address to get balances for
   * @returns Promise<BalanceArray|Error> a promise for the balance info
   */
  omniGetAllBalancesForAddress(address) {
    return this.callRpc('omni_getallbalancesforaddress', [address]);
  }
  
  /**
   * Call omni_getallbalancesforid
   *
   * @param omni_getallbalancesforid Address to get balances for
   * @returns Promise<BalanceArray|Error> a promise for the balance info
   */
  omniGetAllBalancesForId(currencyId) {
    return this.callRpc('omni_getallbalancesforid', [currencyId]);
  }
}

OmniClient.mainNet = {
  exodusAddress: '1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P'
};
OmniClient.testNet = {
  exodusAddress: 'mpexoDuSkGGqvqrkrjiFng38QPkJQVFyqv',
  moneyManAddress: '??'
};
OmniClient.regTestNet = {
  exodusAddress: 'mpexoDuSkGGqvqrkrjiFng38QPkJQVFyqv',
  moneyManAddress: 'moneyqMan7uh8FqdCA2BV5yZ8qVrc9ikLP'
};

(() => {
  for(let method in OmniClientCommands) {
    (function(methodName) {
      OmniClient.prototype[methodName] = () => {
        let args = [].slice.call(arguments);
        return this.callRpc(OmniClientCommands[methodName], args);
      };
    })(method);
  }
})();


/**
 * The `Omni` object is from an earlier version of the client and is deprecated and will be removed.
 * Although it is exported it should not be used in new code.
 * @deprecated
 */
class Omni {
  constructor() {
    this.client = null;
  }
  
  /**
   * An instance of the Bitcoin JSON-RPC client. This is deprecated. When you create
   * an instance of OmniClient it now extends the Bitcoin client object.
   * @private
   * @deprecated
   */
  
  init(user, pass, otherip, test) {
    let host;
    if (otherip == null) {
      host = 'localhost'
    } else {
      host = otherip
    }
    let port;
    if (test == false || test == null) {
      port = 8332
    } else {
      port = 18332
    }
    this.client = new BitcoinClient({
      host: host,
      port: port,
      user: user,
      pass: pass
    });
    
    return this.client;
  };
  
  getnewaddress(account, cb) {
    if (account == null || account == undefined) {
      this.client.cmd('getnewaddress', (err, data, resHeaders) => cb(err, data));
    } else {
      this.client.cmd('getnewaddress', account, (err, data, resHeaders) => cb(err, data));
    }
  };
  
  listaccounts(cb) {
    this.client.cmd('listaccounts', (err, data, resHeaders) => cb(err, data));
  }
  
  getaccountaddress(account, cb) {
    if (account == null) {
      this.client.cmd('getaccountaddress', (err, data, resHeaders) => cb(err, data));
    } else {
      this.client.cmd('getaccountaddress', account, (err, data, resHeaders) => cb(err, data));
    }
  }
  
  getaddressesbyaccount(cb) {
    this.client.cmd('getaddressesbyaccount', (err, data, resHeaders) => cb(err, data));
  }
  
  getaccount(address, cb) {
    this.client.cmd('getaccount', address, (err, data, resHeaders) => cb(err, data));
  }
  
  getbalance(account, confirmations, cb) {
    this.client.cmd('getbalance', account, 1, (err, data, resHeaders) => cb(err, data));
  }
  
  getreceivedbyaddress(address, confirmations, cb) {
    this.client.cmd('getreceivedbyaddress', address, confirmations, (err, data, resHeaders) => cb(err, data));
  }
  
  getinfo(cb) {
    this.client.cmd('getinfo', (err, data, resHeaders) => cb(err, data));
  }

//all parameters must be text
  getrawtransaction(txid, cb) {
    this.client.cmd('getrawtransaction', txid, 1, (err, data, resHeaders) => cb(err, data));
  }
  
  getblockhash(block, cb) {
    this.client.cmd('getblockhash', block, (err, data, resHeaders) => cb(err, data));
  }
  
  getblock(hash, cb) {
    this.client.cmd('getblock', hash, (err, data, resHeaders) => cb(err, data));
  }
  
  sendrawtransaction(tx, cb) {
    this.client.cmd('sendrawtransaction', tx, (err, data, resHeaders) => cb(err, data));
  }
  
  validateaddress(addr, cb) {
    this.client.cmd('validateaddress', addr, (err, data, resHeaders) => cb(err, data));
  }
  
  sendtoaddress(addr, amt, cb) {
    this.client.cmd('sendtoaddress', addr, amt, (err, data, resHeaders) => cb(err, data));
  }
  
  createrawtransaction(ins, outs, cb) {
    this.client.cmd('createrawtransaction', ins, outs, (err, data, resHeaders) => cb(err, data));
  }
  
  decoderawtransaction(rawtx, cb) {
    this.client.cmd('decoderawtransaction', rawtx, (err, data, resHeaders) => cb(err, data));
  }

// Omnilayer Specific RPC calls
  getomnibalance(addr, propertyid, cb) {
    this.client.cmd('omni_getbalance', addr, propertyid, (err, data, resHeaders) => cb(err, data));
  }
  
  getallbalancesforaddress(addr, cb) {
    this.client.cmd('omni_getallbalancesforaddress', addr, (err, data, resHeaders) => cb(err, data));
  }
  
  getallbalancesforid(propertyid, cb) {
    this.client.cmd('omni_getallbalancesforid', propertyid, (err, data, resHeaders) => cb(err, data));
  }
  
  gettransaction(tx, cb) {
    this.client.cmd('omni_gettransaction', tx, (err, data, resHeaders) => cb(err, data));
  }
  
  getorderbook(id1, id2, cb) {
    if (id2 == null) {
      this.client.cmd('omni_getorderbook', id1, (err, data, resHeaders) => cb(err, data));
    } else {
      this.client.cmd('omni_getorderbook', id1, id2, (err, data, resHeaders) => cb(err, data));
    }
  }
  
  listtransactions(txid, count, skip, startblock, endblock, cb) {
    if (txid == null) {
      txid = '*';
    }
    if (count == null) {
      count = 1;
    }
    if (skip == null) {
      skip = 0;
    }
    if (startblock == null) {
      startblock = 0;
    }
    if (endblock == null) {
      endblock = 9999999;
    }
    this.client.cmd('omni_listtransactions', txid, count, skip, startblock, endblock, (err, data, resHeaders) => cb(err, data));
  }
  
  listblocktransactions(height, cb) {
    this.client.cmd('omni_listblocktransactions', height, (err, data, resHeaders) => cb(err, data));
  }
  
  getproperty(propertyid, cb) {
    this.client.cmd('omni_getproperty', propertyid, (err, data, resHeaders) => cb(err, data));
  }
  
  listproperties(cb) {
    this.client.cmd('omni_listproperties', (err, data, resHeaders) => cb(err, data));
  }
  
  getcrowdsale(propertyid, cb) {
    this.client.cmd('omni_getcrowdsale', propertyid, (err, data, resHeaders) => cb(err, data));
  }
  
  getactivecrowdsales(cb) {
    this.client.cmd('omni_getactivecrowdsales', (err, data, resHeaders) => cb(err, data));
  }
  
  getactivedexsells(cb) {
    this.client.cmd('omni_getactivedexsells', (err, data, resHeaders) => cb(err, data));
  }
  
  gettrade(txid, cb) {
    this.client.cmd('omni_gettrade', txid, (err, data, resHeaders) => cb(err, data));
  }
  
  getsto(txid, recipients, cb) {
    if (recipients = null) {
      recipients = '*';
    }
    this.client.cmd('omni_getsto', txid, recipients, (err, data, resHeaders) => cb(err, data));
  }
  
  getdivisibleproperty(propertyid) {
    this.client.cmd('omni_getproperty', 'result', 'divisible', propertyid, (err, data, resHeaders) => cb(err, data));
  }
  
  getproperty(propertyid, cb) {
    this.client.cmd('omni_getproperty', propertyid, (err, data, resHeaders) => cb(err, data));
  }
  
  gettradehistory(id1, id2, trades, cb) {
    this.client.cmd('omni_gettradehistoryforpair', id1, id2, trades, (err, data, resHeaders) => cb(err, data));
  }
  
  gettradehistoryaddress(address, trades, propertyfilter, cb) {
    
    if (propertyfilter == null) {
      this.client.cmd('omni_gettradehistoryforaddress', address, trades, (err, data, resHeaders) => cb(err, data));
    } else {
      this.client.cmd('omni_gettradehistoryforaddress', address, trades, propertyfilter, (err, data, resHeaders) => cb(err, data));
    }
  }
  
  listpendingtransactions(addressfilter, cb) {
    if (addressfilter == null) {
      addressfilter = '';
    }
    this.client.cmd('omni_listpendingtransactions', addressfilter, (err, data, resHeaders) => cb(err, data));
  }
  
  send(address, address2, id, amount, cb) {
    this.client.cmd('omni_send', address, address2, id, amount, (err, data, resHeaders) => cb(err, data));
  }
  
  senddexsell(address, id, amount1, amount2, paymentwindow, fee, action, cb) {  //action = (1 for new offers, 2 to update, 3 to cancel)
    this.client.cmd('omni_senddexsell', address, id, amount1, amount2, paymentwindow, fee, action, (err, data, resHeaders) => cb(err, data));
  }
  
  senddexaccept(address, address2, id, amount, cb) {  //action = (1 for new offers, 2 to update, 3 to cancel)
    this.client.cmd('omni_senddexsell', address, address2, id, amount, false, (err, data, resHeaders) => cb(err, data));
  }
  
  sendcancelalltrades(address, ecosystem, cb) {
    this.client.cmd('omni_sendcancelalltrades', address, ecosystem, (err, data, resHeaders) => cb(err, data));
  }
  
  sendcanceltradesbyprice(address, id1, amount1, id2, amount2, cb) {
    this.client.cmd('omni_sendcanceltradesbyprice', address, id1, amount1, id2, amount2, (err, data, resHeaders) => cb(err, data));
  }
  
  sendcanceltradesbypair(address, id1, id2, cb) {
    this.client.cmd('omni_sendcanceltradesbypair', address, (err, data, resHeaders) => cb(err, data));
  }
  
  sendchangeissuer(address1, address2, propertyid, cb) {
    this.client.cmd(
      'omni_sendchangeissuer',
      address1,
      address2,
      propertyid,
      (err, data, resHeaders) => cb(err, data),
    );
  }
  
  sendtrade(address, id1, amount, id2, amount2, cb) {
    this.client.cmd(
      'omni_sendtrade',
      address,
      id1,
      amount.toString(),
      id2,
      amount2.toString(),
      (err, data, resHeaders) => cb(err, data),
    )
  }
  
  sendclosecrowdsale(address, id, cb) {
    this.client.cmd(
      'omni_sendclosecrowdsale',
      address,
      id,
      (err, data, resHeaders) => cb(err, data)
    );
  }
  
  sendall(address1, address2, ecosystem, cb) {
    this.client.cmd(
      'omni_sendall',
      address1,
      address2,
      ecosystem,
      (err, data, resHeaders) => cb(err, data)
    );
  }
  
  sendissuancecrowdsale(params, cb) {
    this.client.cmd(
      'omni_sendissuancecrowdsale',
      params.address,
      params.ecosystem,
      params.type,
      params.previousid,
      params.category,
      params.subcategory,
      params.name,
      params.url,
      params.data,
      params.amount,
      params.tokensperunit,
      params.deadline,
      params.earlybonus,
      params.issuerpercentage,
      (err, data) => cb(data),
    );
  }
  
  sendissuancefixed(params, cb) {
    this.client.cmd(
      'omni_sendissuancefixed',
      fromaddress,
      ecosystem,
      type,
      previousid,
      category,
      subcategory,
      name,
      url,
      data,
      amount,
      (err, data, resHeaders) => cb(err, data),
    );
  }
  
  sendrevoke(address, id, amount, note, cb) {
    this.client.cmd(
      'omni_sendrevoke',
      address,
      id,
      amount,
      note,
      (err, data, resHeaders) => cb(err, data),
    );
  }
  
  sendgrant(address1, address2, id, amount, note, cb) {
    this.client.cmd(
      'omni_sendgrant',
      address1,
      address2,
      id,
      amount,
      note,
      (err, data, resHeaders) => cb(err, data),
    );
  }
  
  sendissuancemanaged(params, cb) {
    this.client.cmd(
      'omni_sendissuancemanaged',
      address,
      ecosystem,
      type,
      previousid,
      category,
      subcategory,
      name,
      url,
      data,
      (err, data, resHeaders) => cb(err, data),
    );
  }
}

exports.OmniClient = OmniClient;
exports.Omni = Omni;
