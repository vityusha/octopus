const MAX_LEDS = 15;

window.onload = () => {
    window.api.receiveData('data-ready', (event, data) => {
        processData(data);
    });

    // Add elements to body
    //
    for(var i=0; i<=MAX_LEDS; i++) {
        var elemStatus = document.createElement("img");
        elemStatus.setAttribute("src", "./assets/img/red-led.png");
        elemStatus.setAttribute("id", "img-status-" + i);
        elemStatus.setAttribute("width", "15px");
        document.getElementById("leds").appendChild(elemStatus);
        //
        var elemCharge = document.createElement("img");
        elemCharge.setAttribute("src", "./assets/img/green-led.png");
        elemCharge.setAttribute("id", "img-charge-" + i);
        elemCharge.setAttribute("width", "15px");
        document.getElementById("leds").appendChild(elemCharge);
        //
        var elemGray = document.createElement("img");
        elemGray.setAttribute("src", "./assets/img/gray.png");
        elemGray.setAttribute("id", "img-gray-" + i);
        elemGray.setAttribute("width", "22px");
        document.getElementById("leds").appendChild(elemGray);
        //
        var elemSocketCharge = document.createElement("img");
        elemSocketCharge.setAttribute("src", "./assets/img/charging.png");
        elemSocketCharge.setAttribute("id", "socket-charge-" + i);
        elemSocketCharge.setAttribute("height", "26px");
        document.getElementById("leds").appendChild(elemSocketCharge);
        //
        var elemSocketFault = document.createElement("img");
        elemSocketFault.setAttribute("src", "./assets/img/fault.png");
        elemSocketFault.setAttribute("id", "socket-fault-" + i);
        elemSocketFault.setAttribute("height", "26px");
        document.getElementById("leds").appendChild(elemSocketFault);
        //
        var elemSwitch = document.createElement("label");
        elemSwitch.setAttribute("class", "vswitch");
        elemSwitch.setAttribute("id", "usb-switch-" + i);
        var elemInput = document.createElement("input");
        elemInput.setAttribute("type", "checkbox");
        elemInput.setAttribute("id", "input-switch-" + i);
        elemInput.setAttribute("name", "" + i);
        elemInput.setAttribute("disabled", "disabled");
        elemSwitch.appendChild(elemInput);
        var elemSlider = document.createElement("span");
        elemSlider.setAttribute("class", "vslider");
        elemSwitch.appendChild(elemSlider);
        document.getElementById("leds").appendChild(elemSwitch);
    }
    for (var i = 0; i <= MAX_LEDS; i++) {
        document.querySelector("#input-switch-" + i).addEventListener('click', function () {
            let id = parseInt(this.name) + 1;
            let ifZeroBased = parseInt(this.name);
            let jack = "Jack";
            if (id + 1 < 10)
                jack += "0" + id;
            else
                jack += id;
            let check = document.getElementById("input-switch-" + ifZeroBased).checked;
            window.api.sendData('netconfig', { jackname: jack, state: check ? 1 : 0 });
        }
    )};
    //
    document.querySelector("#input-switch-data").addEventListener('click', function () {
        let check = document.getElementById("input-switch-data").checked;
        window.api.sendData('dataconfig', check ? 16 : 0 );
    });
}

var previousData = [];

function compareData(data) {
    const notequal = JSON.stringify(data) !== JSON.stringify(previousData)
    if(notequal) {
        previousData = data;
    }
    return notequal;
}

function processData(data) {
    wdtCounter = 0;
    isWarned = false;
    if(isConnected == false)
        isConnected = true;
    setPowerLight(true);
    setDataLight();

    if(compareData(data)) {
        for (var i = 0; i <= MAX_LEDS; i++) {
            setChargeLed(i, data[i].charging);
            setStateLed(i, data[i].state);
        }
        // Data led
        let dataVisibility = document.getElementById('img-data-led').style.visibility;
        if(data[MAX_LEDS].state == 4) {
            if(dataVisibility != 'visible') {
                document.getElementById('img-data-led').style.visibility = 'visible';
                document.getElementById('img-data-link').style.visibility = 'visible';
                document.getElementById('input-switch-data').checked = true;
            }
        } else {
            if (dataVisibility != 'hidden') {
                document.getElementById('img-data-led').style.visibility = 'hidden';
                document.getElementById('img-data-link').style.visibility = 'hidden';
                document.getElementById('input-switch-data').checked = false;
            }
        }
    }
}

function setPowerLight(on) {
    var visibility = document.getElementById('img-power-on').style.visibility;
    if(on) {
        if(visibility != 'visible') {
            window.api.sendData('log-message', 'Setting power on.')
            document.getElementById('img-power-on').style.visibility = 'visible';
            document.getElementById('img-net-on').style.visibility = 'visible';
        }
        //
        for (var i = 0; i <= MAX_LEDS; i++) {
            document.getElementById('input-switch-' + i).removeAttribute("disabled");
        }
        document.getElementById('input-switch-data').removeAttribute("disabled");
    } else {
        if (visibility == 'visible') {
            window.api.sendData('log-message', 'Setting power off.')
            document.getElementById('img-power-on').style.visibility = 'hidden';
            document.getElementById('img-net-on').style.visibility = 'hidden';
            document.getElementById('img-data-led').style.visibility = 'hidden';
            document.getElementById('img-data-link').style.visibility = 'hidden';
        }
        //
        for (var i = 0; i <= MAX_LEDS; i++) {
            setChargeLed(i, false);
            setStateLed(i, 5); // 5 - absent
            document.getElementById('input-switch-' + i).setAttribute("disabled", "disabled");
            document.getElementById('input-switch-data').setAttribute("disabled", "disabled");
        }
    }
    window.api.sendData('power', on);
}

function setDataLight() {
    var visibility = document.getElementById('img-net-data').style.visibility;
    if (visibility != 'visible') {
        visibility = 'visible';
    } else {
        visibility = 'hidden';
    }
    document.getElementById('img-net-data').style.visibility = visibility;
}

function setChargeLed(i, on) {
    const id = 'img-charge-' + String(i);
    const idSocketCharge = 'socket-charge-' + String(i);
    var visibility = document.getElementById(id).style.visibility;
    if (on) {
        if (visibility != 'visible') {
            document.getElementById(id).style.visibility = 'visible';
            document.getElementById(idSocketCharge).style.visibility = 'visible';
        }
    } else {
        if (visibility == 'visible') {
            document.getElementById(id).style.visibility = 'hidden';
            document.getElementById(idSocketCharge).style.visibility = 'hidden';
        }
    }
}

// #define CHARGE_NORMAL     0       // charging mode
// #define CHARGE_FAULT      1       // fault
// #define CHARGE_OFF        2       // switch off mode
// #define CHARGE_WAIT       3       // wait mode
// #define CHARGE_DATA       4       // data mode
// #define CHARGE_ABSENT     5       // absent mode
//
function setStateLed(i, state) {
    const idStatus = 'img-status-' + String(i);
    const idCharge = 'img-charge-' + String(i);
    const idGray = 'img-gray-' + String(i);
    const idFault = 'socket-fault-' + String(i);
    const idSwitch = 'input-switch-' + String(i);
    document.getElementById(idFault).style.visibility = 'hidden';
    switch(state) {
        case 0:
            document.getElementById(idStatus).style.visibility = 'visible';
            document.getElementById(idGray).style.visibility = 'hidden';
            document.getElementById(idSwitch).checked = true;
            break;
        case 1:
            document.getElementById(idFault).style.visibility = 'visible';
            document.getElementById(idStatus).style.visibility = 'hidden';
            document.getElementById(idCharge).style.visibility = 'hidden';
            break;
        case 4:
            document.getElementById(idStatus).style.visibility = 'visible';
            break;
        case 5:
            document.getElementById(idStatus).style.visibility = 'hidden';
            document.getElementById(idGray).style.visibility = 'visible';
            document.getElementById(idSwitch).checked = false;
            break;
    }
}

// WDT timer
//
let isConnected = false;
let isWarned = false;
let wdtCounter = 0;
let wdtTimer = setInterval(function() {
    if (isConnected == true && wdtCounter++ > 3) {
        isConnected = false;
        previousData = [];
        if (!isWarned) {
            showAlert("Потеряна связь с устройством!");
            isWarned = true;
        }
        wdtCounter = 0;
        setPowerLight(false);
        document.getElementById('img-net-data').style.visibility = 'hidden'
    }
    if (isConnected == false && wdtCounter++ > 10) {
        isConnected = false;
        previousData = [];
        if(!isWarned) {
            showAlert("Нет связи с устройством!");
            isWarned = true;
        }
        wdtCounter = 0;
        setPowerLight(false);
        document.getElementById('img-net-data').style.visibility = 'hidden'
    }
}, 1000)

function showAlert(e) {
    window.api.sendData('show-error', e);
}