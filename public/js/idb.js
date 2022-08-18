let db;
//create new db request for a budget
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    //used to save references to db 
    db = event.target.result;
    //checks if app is online
    if (navigator.online) {
        budgetDb();
    }
};

request.onerror = function (event) {
    //logs error 
    console.log(event.target.errorCode);

};

function saveRecord(record) {
    // used to create a transactionfor pending db w/readwrite acess
    const transaction = db.transaction(['pending'], "readwrite");
    //acces pending object store
    const budgetStore = transaction.objectStore("pending");
    //add record to your store add method
    budgetStore.add(record);
}

function budgetDb() {
    //open a transaction on pending db
    const transaction = db.transaction(["pending"], "readwrite");
    //acces pending object store
    const budgetStore = transaction.objectStore("pending");
    // get all records from bugetstore and sets it to a variable
    const getAll = budgetStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then((serverResponse) => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(["pending"], "readwrite");
                const budgetStore = transaction.objectStore("pending");
                //clear all items in your store
                budgetStore.clear();
            })
            .catch((err) => {
                //set references to redirect back here 
                console.log(err);
            });
        }
    };
}

//listen for app coming back online
window.addEventListener("online", budgetDb);