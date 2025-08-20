function fetchAndDisplayData() {
    // First check if table exists
    const table = document.getElementById('dataTable');
    if (!table) {
        console.error('Table element not found');
        return;
    }

    fetch('http://127.0.0.1:8000/collection', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Clear existing table
        table.innerHTML = '';

        // Get all unique keys from data
        const allKeys = new Set();
        data.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== '_id' && key !== '__v') {
                    allKeys.add(key);
                }
            });
        });
        const headers = [...allKeys, 'Actions'];

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText.charAt(0).toUpperCase() + headerText.slice(1);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        
        // Populate table with data
        data.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const cell = document.createElement('td');
                if (header === 'Actions') {
                    cell.innerHTML = `<button onclick="deleteRecord('${item._id}')">Delete</button>`;
                } else {
                    cell.textContent = item[header] || 'N/A';
                }
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        // Create a more user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Unable to fetch data: ${error.message}`;
        // If table exists, insert error message before it
        if (table) {
            table.parentNode.insertBefore(errorMessage, table);
        }
    });
}

// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if table exists
    const table = document.getElementById('dataTable');
    if (!table) {
        console.error('Table element not found. Creating table element...');
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        const newTable = document.createElement('table');
        newTable.id = 'dataTable';
        tableContainer.appendChild(newTable);
        document.body.appendChild(tableContainer);
    }
});

function refreshTable() {
    fetchAndDisplayData();
}

function deleteRecord(id) {
    fetch(`http://127.0.0.1:8000/collection/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        fetchAndDisplayData(); // Refresh the table
        alert('Record deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting record:', error);
        alert('Error deleting record: ' + error.message);
    });
}

let categories = {};

// Load categories from server
fetch('http://127.0.0.1:8000/categories')
.then(response => response.json())
.then(data => {
    categories = data;
    populateCategoryDropdowns();
})
.catch(error => console.error('Error loading categories:', error));

function populateCategoryDropdowns() {
    const categorySelect = document.getElementById('categorySelect');
    const searchSelect = document.getElementById('searchCategorySelect');
    
    // Clear existing options except first
    categorySelect.innerHTML = '<option value="">Choose a category...</option>';
    searchSelect.innerHTML = '<option value="">Choose a category...</option>';
    
    // Add categories from JSON
    Object.keys(categories).forEach(key => {
        const option1 = document.createElement('option');
        option1.value = key;
        option1.textContent = categories[key].name;
        categorySelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = key;
        option2.textContent = categories[key].name;
        searchSelect.appendChild(option2);
    });
}

function loadCategoryForm() {
    const categorySelect = document.getElementById('categorySelect');
    const dataForm = document.getElementById('dataForm');
    const formFields = document.getElementById('formFields');
    
    const selectedCategory = categorySelect.value;
    
    if (!selectedCategory) {
        dataForm.style.display = 'none';
        return;
    }
    
    const category = categories[selectedCategory];
    formFields.innerHTML = '';
    
    category.fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'mb-3';
        fieldDiv.innerHTML = `
            <label class="form-label">${field.label}:</label>
            <input type="${field.type}" class="form-control" name="${field.name}" required>
        `;
        formFields.appendChild(fieldDiv);
    });
    
    dataForm.style.display = 'block';
}

function submitCategoryData() {
    const formFields = document.getElementById('formFields');
    const inputs = formFields.querySelectorAll('input');
    const data = {};
    
    inputs.forEach(input => {
        let value = input.value;
        if (input.type === 'number') {
            value = Number(value);
        }
        data[input.name] = value;
    });
    
    fetch('http://127.0.0.1:8000/collection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert('Data saved successfully!');
        inputs.forEach(input => input.value = '');
        refreshTable();
    })
    .catch(error => {
        alert('Error saving data: ' + error.message);
    });
}

let newFieldCount = 0;

function showAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'block';
}

function cancelAddCategory() {
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryFields').innerHTML = '';
    newFieldCount = 0;
}

function addNewField() {
    const fieldsContainer = document.getElementById('newCategoryFields');
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'mb-2 d-flex gap-2';
    fieldDiv.innerHTML = `
        <input type="text" placeholder="Field Name" class="form-control">
        <select class="form-select">
            <option value="text">Text</option>
            <option value="number">Number</option>
        </select>
        <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
    `;
    fieldsContainer.appendChild(fieldDiv);
    newFieldCount++;
}

function saveNewCategory() {
    const categoryName = document.getElementById('newCategoryName').value;
    const fieldDivs = document.getElementById('newCategoryFields').children;
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    const fields = [];
    for (let div of fieldDivs) {
        const nameInput = div.querySelector('input[type="text"]');
        const typeSelect = div.querySelector('select');
        if (nameInput.value) {
            fields.push({
                name: nameInput.value.toLowerCase().replace(/\s+/g, '_'),
                label: nameInput.value,
                type: typeSelect.value
            });
        }
    }
    
    if (fields.length === 0) {
        alert('Please add at least one field');
        return;
    }
    
    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '_');
    const newCategory = {
        name: categoryName,
        fields: fields
    };
    
    // Save to server
    fetch('http://127.0.0.1:8000/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: categoryKey, category: newCategory })
    })
    .then(response => response.json())
    .then(result => {
        categories[categoryKey] = newCategory;
        populateCategoryDropdowns();
        cancelAddCategory();
        alert('Category saved successfully!');
    })
    .catch(error => {
        alert('Error saving category: ' + error.message);
    });
}

function filterByCategory() {
    const categorySelect = document.getElementById('searchCategorySelect');
    const selectedCategory = categorySelect.value;
    
    if (!selectedCategory) {
        // Clear table if no category selected
        const table = document.getElementById('dataTable');
        table.innerHTML = '';
        return;
    }
    
    // Fetch and filter data by category
    fetch('http://127.0.0.1:8000/collection')
    .then(response => response.json())
    .then(data => {
        const category = categories[selectedCategory];
        const categoryFields = category.fields.map(f => f.name);
        
        // Filter data to only show items that have MOST fields from this category
        const filteredData = data.filter(item => {
            const matchingFields = categoryFields.filter(field => item.hasOwnProperty(field));
            return matchingFields.length >= Math.ceil(categoryFields.length * 0.6);
        });
        
        displayFilteredData(filteredData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function displayFilteredData(data) {
    const table = document.getElementById('dataTable');
    table.innerHTML = '';
    
    if (data.length === 0) {
        table.innerHTML = '<p>No data found for this category.</p>';
        return;
    }
    
    // Get all unique keys from filtered data
    const allKeys = new Set();
    data.forEach(item => {
        Object.keys(item).forEach(key => {
            if (key !== '_id' && key !== '__v') {
                allKeys.add(key);
            }
        });
    });
    const headers = [...allKeys, 'Actions'];
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText.charAt(0).toUpperCase() + headerText.slice(1);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');
            if (header === 'Actions') {
                cell.innerHTML = `<button onclick="deleteRecord('${item._id}')">Delete</button>`;
            } else {
                cell.textContent = item[header] || 'N/A';
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
}