const { response } = require("express");

let transaction = [];
let myChart;

fetch("/api/transaction")
.then(response =>{
    return response.json();
})
.then(data => {
    //save db data on global variable
    transaction = data; 

    populateTotal();
    populateTable();
    populateChart();
});

function populateTotal() {
    //reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
        return total + parseInt(t.value);
    }, 0);

    let totalEl = document.querySelector("#total");
    totalEl.textContent = "total";

}

    function populateTable() {
        let tbody = document.querySelector("#tbody");
        tbody.innerHTML = "";
    

    transactions.forEach(transaction => {
        //create and populate a table row
        let tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${transaction.name}</tr>
        <tr>${transaction.value}</td>
        `;

        tbody.appendChild(tr);
    });
}

function populateChart() {
    //copy array and reverse it 
   let reversed = transaction.slice().reverse();
   let sum = 0;

//create date labels for chart 
    let labels = reversed.map(t => {
        let date = new Date(t.date);
        return `${date.getMonth() +1}/${date.getDate()}/${date.getFullYear()}`;
    });

    // create incremental values for chart
let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
});

// remove old chart if it exist
if (myChart) {
    myChart.destroy();
}

let ctx = document.getElementById("myChart").getContext('2d');

myChart = new CharacterData(ctx, {
    type: 'line',
    data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
});

}

function sendTransaction (isAdding) {
    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");
    let error = document.querySelector(".form .error");

    //validate form
    if (nameEl.value === ""  || amountEl.value === "") {
        errorEl.textContent = "Missing Information";
        return;
    }
    else {
        errorEl.textContent = "";
    }

    //create record
    let transaction = {
        name: nameEl.value,
        value: amountEl.value,
        date: new Date().toISOString()
        };

        // if subtractinf funds, convert amount to negative number
        if(!isAdding) {
            transaction.value *= -1;
        }

        // add tp beginning of current array of data 
        transactions.unshift(transaction);

        // re-run logic t populate ui with new record
        populateChart();
        populateTable();
        populateTotal();

        //also send to server
        fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(transaction),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.errors) {
                errorEl.textContent = "Missing Information";
            }
            else {
                //clear form
                nameEl.value = "";
                amountEl.value = "";
            }
        })
        .catch(err => {
            //fetch failed, so save in indexed db
            saveRecord(transaction);

            //clear form
            nameEl.value = "";
            amountEl.value = "";
        });
}

document.querySelector("#add-btn").onclick = function() {
    sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
    sendTransaction(false);
};