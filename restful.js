const axios = require('axios')

var url;
var urlJackPoint = "/jackconfig.cgi";
var urlDatakPoint = "/data.cgi";

module.exports.netconfig = (ip, params, callback) => {
    onData = callback;
    url = "http://" + ip + urlJackPoint;
    
    var postparams = new URLSearchParams();
    postparams.append(params.jackname, params.state);

    axios
        .post(url, postparams)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            console.log(res)
        })
        .catch(error => {
            console.error(error)
        })
}

module.exports.dataconfig = (ip, param, callback) => {
    onData = callback;
    url = "http://" + ip + urlDatakPoint;

    var postparams = new URLSearchParams();
    postparams.append('data', param);

    axios
        .post(url, postparams)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            console.log(res)
        })
        .catch(error => {
            console.error(error)
        })
}
