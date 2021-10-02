// variable to hold connections
const db;
// establish connection to db 
const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event){
    db = event.target.result;
    if (navigator.onLine){
        uploadTransaction()
    }
}

request.onerror = function (event){
    console.log(event.target.error)
}

// Save transaction if there is no internet
function saveRecord (record){
    const transaction = db.transaction(['new_transaction'], readwite)
    const budgetStore = transaction.objectStore('new_transaction');
    budgetStore.add(record)
};

function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  

    const budgetStore = transaction.objectStore('new_transaction');
  
    // get all transactions from store and set to a variable
    const getAll = budgetStore.getAll();
  
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {

    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          
          const transaction = db.transaction(['new_transaction'], 'readwrite');
          
          const budgetStore = transaction.objectStore('new_transaction');
          // clear all items in your store
          budgetStore.clear();

          alert('All saved transactions has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}

// listen for app for internet
window.addEventListener('online', uploadTransaction);