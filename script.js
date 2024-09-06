document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('stock-form');
    let editingStockId = null;

    
    fetchStocks();

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const ticker = document.getElementById('ticker').value;
        const price = parseFloat(document.getElementById('price').value);

        if (editingStockId !== null) {
            updateStock(editingStockId, { name, ticker, price });
        } else {
            createStock({ name, ticker, price });
        }

        form.reset();
        editingStockId = null;
    });
    // this function will get all the stocks from db
    function fetchStocks() {
        fetch('http://127.0.0.1:5000/stocks')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched stocks:', data);
                if (data && Array.isArray(data.stocks)) {
                    renderTable(data.stocks);
                } else {
                    console.error('Unexpected API response format:', data);
                }
            })
            .catch(error => console.error('Error fetching stocks:', error));
    }
    
    // this will create a new stock in the db
    function createStock(stock) {
        fetch('http://127.0.0.1:5000/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stock)
        })
            .then(response => response.json())
            .then(() => {
                fetchStocks(); 
            })
            .catch(error => console.error('Error creating stock:', error));
    }

    // this will edit a stock info
    function updateStock(id, updatedStock) {
        fetch(`http://127.0.0.1:5000/stocks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedStock)
        })
            .then(response => response.json())
            .then(() => {
                fetchStocks(); 
            })
            .catch(error => console.error('Error updating stock:', error));
    }
 
    //this will delete a stock
    function deleteStock(id) {
        fetch(`http://127.0.0.1:5000/stocks/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    console.log('Stock deleted successfully');
                    fetchStocks(); 
                } else {
                    return response.json().then(error => {
                        console.error('Error deleting stock:', error);
                    });
                }
            })
            .catch(error => console.error('Error deleting stock:', error));
    }

    function renderTable(stocks) {
        const tableBody = document.querySelector('#stocks-table tbody');
        tableBody.innerHTML = ''; 

        stocks.forEach(stock => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stock.name}</td>
                <td>${stock.ticker}</td>
                <td>${stock.price.toFixed(2)}</td>
                <td>
                    <button class="edit" onclick="editStock(${stock.id})">Edit</button>
                    <button onclick="deleteStock(${stock.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    window.editStock = function (id) {
        fetch(`http://127.0.0.1:5000/stocks/${id}`)
            .then(response => response.json())
            .then(stock => {
                document.getElementById('name').value = stock.name;
                document.getElementById('ticker').value = stock.ticker;
                document.getElementById('price').value = stock.price;
                editingStockId = id;
            })
            .catch(error => console.error('Error fetching stock for editing:', error));
    }

    window.deleteStock = function(id) {
        if (confirm('Are you sure you want to delete this stock?')) {
            fetch(`http://127.0.0.1:5000/stocks/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Stock deleted successfully');
                        fetchStocks(); 
                    } else {
                        return response.json().then(error => {
                            console.error('Error deleting stock:', error);
                        });
                    }
                })
                .catch(error => console.error('Error deleting stock:', error));
        }
    };
});
