const axios = require('axios')

const params = "/info.cgi?cmd=state";
const interval = 300;

var url = null;
let onData = null;
let data = '';

function doRequest() {
    axios.get(url)
        .then(response => {
            onData(null, response.data.data)
        })
        .catch(error => {
            console.log(error);
            onData("Error recievind json data", null)
        });}

module.exports.start = (ip, callback) => {
    onData = callback;
    url = "http://" + ip + params;

    // Start finder
    setInterval(doRequest, interval);
}
