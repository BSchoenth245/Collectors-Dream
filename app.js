// === DATA DISPLAY FUNCTIONS ===
// Fetch and display all collection data in table
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

// === DOM INITIALIZATION ===
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

// === TABLE MANAGEMENT ===
// Refresh table data
function refreshTable() {
    fetchAndDisplayData();
}

// Delete specific record by ID
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
        Swal.fire('Success!', 'Record deleted successfully', 'success');
    })
    .catch(error => {
        console.error('Error deleting record:', error);
        Swal.fire('Error!', 'Error deleting record: ' + error.message, 'error');
    });
}

// === CATEGORY MANAGEMENT ===
let categories = {};

// Load categories from server on page load
fetch('http://127.0.0.1:8000/categories')
.then(response => response.json())
.then(data => {
    categories = data;
    populateCategoryDropdowns();
})
.catch(error => console.error('Error loading categories:', error));

// Populate dropdown menus with available categories
function populateCategoryDropdowns() {
    const categorySelect = document.getElementById('categorySelect');
    const searchSelect = document.getElementById('searchCategorySelect');
    const editSelect = document.getElementById('editCategorySelect');
    
    // Clear existing options except first
    categorySelect.innerHTML = '<option value="">Choose a category...</option>';
    searchSelect.innerHTML = '<option value="">Choose a category...</option>';
    editSelect.innerHTML = '<option value="">Choose a category...</option>';
    
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
        
        const option3 = document.createElement('option');
        option3.value = key;
        option3.textContent = categories[key].name;
        editSelect.appendChild(option3);
    });
}

// Load form fields based on selected category
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
        const inputType = field.type === 'number' ? 'text' : field.type;
        const inputPattern = field.type === 'number' ? 'pattern="[0-9]*"' : '';
        fieldDiv.innerHTML = `
            <label class="form-label">${field.label}:</label>
            <input type="${inputType}" ${inputPattern} class="form-control" name="${field.name}" required>
        `;
        formFields.appendChild(fieldDiv);
    });
    
    dataForm.style.display = 'block';
}

// Submit new item data to database
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
        Swal.fire('Success!', 'Data saved successfully!', 'success');
        inputs.forEach(input => input.value = '');
        refreshTable();
    })
    .catch(error => {
        Swal.fire('Error!', 'Error saving data: ' + error.message, 'error');
    });
}

// === CATEGORY MANAGEMENT ===
let newFieldCount = 0;

// Show form to create new category
function showAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'block';
    document.getElementById('editCategoryForm').style.display = 'none';
}

// Show form to edit existing category
function showEditCategoryForm() {
    document.getElementById('editCategoryForm').style.display = 'block';
    document.getElementById('addCategoryForm').style.display = 'none';
}

// Cancel category creation and reset form
function cancelAddCategory() {
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryFields').innerHTML = '';
    newFieldCount = 0;
}

// Cancel category editing and reset form
function cancelEditCategory() {
    document.getElementById('editCategoryForm').style.display = 'none';
    document.getElementById('editCategoryContent').style.display = 'none';
    document.getElementById('editCategorySelect').value = '';
    document.getElementById('editCategoryName').value = '';
    document.getElementById('editCategoryFields').innerHTML = '';
}

// Add new field to category creation form
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

// Load category data for editing
function loadEditCategoryForm() {
    const editSelect = document.getElementById('editCategorySelect');
    const editContent = document.getElementById('editCategoryContent');
    const editNameInput = document.getElementById('editCategoryName');
    const editFieldsContainer = document.getElementById('editCategoryFields');
    
    const selectedKey = editSelect.value;
    
    if (!selectedKey) {
        editContent.style.display = 'none';
        return;
    }
    
    const category = categories[selectedKey];
    editNameInput.value = category.name;
    editFieldsContainer.innerHTML = '';
    
    // Populate existing fields
    category.fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'mb-2 d-flex gap-2';
        fieldDiv.innerHTML = `
            <input type="text" value="${field.label}" class="form-control">
            <select class="form-select">
                <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
                <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
            </select>
            <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        editFieldsContainer.appendChild(fieldDiv);
    });
    
    editContent.style.display = 'block';
}

// Add new field to edit form
function addEditField() {
    const fieldsContainer = document.getElementById('editCategoryFields');
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
}

// Save edited category
function saveEditCategory() {
    const editSelect = document.getElementById('editCategorySelect');
    const categoryName = document.getElementById('editCategoryName').value;
    const fieldDivs = document.getElementById('editCategoryFields').children;
    
    if (!categoryName) {
        Swal.fire('Warning!', 'Please enter a category name', 'warning');
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
        Swal.fire('Warning!', 'Please add at least one field', 'warning');
        return;
    }
    
    const categoryKey = editSelect.value;
    const updatedCategory = {
        name: categoryName,
        fields: fields
    };
    
    // Save to server
    fetch('http://127.0.0.1:8000/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: categoryKey, category: updatedCategory })
    })
    .then(response => response.json())
    .then(result => {
        categories[categoryKey] = updatedCategory;
        populateCategoryDropdowns();
        cancelEditCategory();
        Swal.fire('Success!', 'Category updated successfully!', 'success');
    })
    .catch(error => {
        Swal.fire('Error!', 'Error updating category: ' + error.message, 'error');
    });
}

// Save new category to server
function saveNewCategory() {
    const categoryName = document.getElementById('newCategoryName').value;
    const fieldDivs = document.getElementById('newCategoryFields').children;
    
    if (!categoryName) {
        Swal.fire('Warning!', 'Please enter a category name', 'warning');
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
        Swal.fire('Warning!', 'Please add at least one field', 'warning');
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
        Swal.fire('Success!', 'Category saved successfully!', 'success');
    })
    .catch(error => {
        Swal.fire('Error!', 'Error saving category: ' + error.message, 'error');
    });
}

// === SEARCH & FILTER ===
// Filter table data by selected category
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

// Display filtered data in table
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