// === DATA DISPLAY FUNCTIONS ===
// Fetch and display all collection data in table
function fetchAndDisplayData() {
    // First check if table exists
    const elmTable = document.getElementById('dataTable');
    if (!elmTable) {
        console.error('Table element not found');
        return;
    }

    fetch('http://127.0.0.1:8000/api/collection', {
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
    .then(arrData => {
        // Clear existing table
        elmTable.innerHTML = '';

        // Get all unique keys from data
        const setAllKeys = new Set();
        arrData.forEach(objItem => {
            Object.keys(objItem).forEach(strKey => {
                if (strKey !== '_id' && strKey !== '__v') {
                    setAllKeys.add(strKey);
                }
            });
        });
        const arrHeaders = [...setAllKeys, 'Actions'];

        // Create table header
        const elmThead = document.createElement('thead');
        const elmHeaderRow = document.createElement('tr');
        arrHeaders.forEach(strHeaderText => {
            const elmTh = document.createElement('th');
            elmTh.textContent = strHeaderText.charAt(0).toUpperCase() + strHeaderText.slice(1);
            elmHeaderRow.appendChild(elmTh);
        });
        elmThead.appendChild(elmHeaderRow);
        elmTable.appendChild(elmThead);

        // Create table body
        const elmTbody = document.createElement('tbody');
        
        // Populate table with data
        arrData.forEach(objItem => {
            const elmRow = document.createElement('tr');
            arrHeaders.forEach(strHeader => {
                const elmCell = document.createElement('td');
                if (strHeader === 'Actions') {
                    elmCell.innerHTML = `<button onclick="deleteRecord('${objItem._id}')">Delete</button>`;
                } else {
                    elmCell.textContent = objItem[strHeader] || 'N/A';
                }
                elmRow.appendChild(elmCell);
            });
            elmTbody.appendChild(elmRow);
        });
        
        elmTable.appendChild(elmTbody);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        // Create a more user-friendly error message
        const elmErrorMessage = document.createElement('div');
        elmErrorMessage.className = 'error-message';
        elmErrorMessage.textContent = `Unable to fetch data: ${error.message}`;
        // If table exists, insert error message before it
        if (elmTable) {
            elmTable.parentNode.insertBefore(elmErrorMessage, elmTable);
        }
    });
}

// === DOM INITIALIZATION ===
// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if table exists
    const elmTable = document.getElementById('dataTable');
    if (!elmTable) {
        console.error('Table element not found. Creating table element...');
        const elmTableContainer = document.createElement('div');
        elmTableContainer.className = 'table-container';
        const elmNewTable = document.createElement('table');
        elmNewTable.id = 'dataTable';
        elmTableContainer.appendChild(elmNewTable);
        document.body.appendChild(elmTableContainer);
    }
});

// === TABLE MANAGEMENT ===
// Refresh table data
function refreshTable() {
    fetchAndDisplayData();
}

// Delete specific record by ID
function deleteRecord(strId) {
    fetch(`http://127.0.0.1:8000/api/collection/${strId}`, {
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
let objCategories = {};

// Load categories from server on page load
fetch('http://127.0.0.1:8000/api/categories')
.then(response => response.json())
.then(objData => {
    objCategories = objData;
    populateCategoryDropdowns();
})
.catch(error => console.error('Error loading categories:', error));

// Populate dropdown menus with available categories
function populateCategoryDropdowns() {
    const elmCategorySelect = document.getElementById('categorySelect');
    const elmSearchSelect = document.getElementById('searchCategorySelect');
    const elmEditSelect = document.getElementById('editCategorySelect');
    const elmDeleteSelect = document.getElementById('deleteCategorySelect');
    
    // Clear existing options except first
    elmCategorySelect.innerHTML = '<option value="">Choose a category...</option>';
    elmSearchSelect.innerHTML = '<option value="">Choose a category...</option>';
    elmEditSelect.innerHTML = '<option value="">Choose a category...</option>';
    elmDeleteSelect.innerHTML = '<option value="">Choose a category...</option>';
    
    // Add categories from JSON
    Object.keys(objCategories).forEach(strKey => {
        const elmOption1 = document.createElement('option');
        elmOption1.value = strKey;
        elmOption1.textContent = objCategories[strKey].name;
        elmCategorySelect.appendChild(elmOption1);
        
        const elmOption2 = document.createElement('option');
        elmOption2.value = strKey;
        elmOption2.textContent = objCategories[strKey].name;
        elmSearchSelect.appendChild(elmOption2);
        
        const elmOption3 = document.createElement('option');
        elmOption3.value = strKey;
        elmOption3.textContent = objCategories[strKey].name;
        elmEditSelect.appendChild(elmOption3);
        
        const elmOption4 = document.createElement('option');
        elmOption4.value = strKey;
        elmOption4.textContent = objCategories[strKey].name;
        elmDeleteSelect.appendChild(elmOption4);
    });
    
    // Update categories display
    renderCategoriesGrid();
}

// Render categories as cards
function renderCategoriesGrid() {
    const elmButtonContainer = document.getElementById('newCategoryButtonContainer');
    const elmGrid = document.getElementById('categoriesGrid');
    const arrCategoryKeys = Object.keys(objCategories);
    
    if (arrCategoryKeys.length === 0) {
        // No categories - show large centered button
        elmButtonContainer.className = 'new-category-button-container empty';
        elmGrid.innerHTML = '';
    } else {
        // Has categories - show small button and cards
        elmButtonContainer.className = 'new-category-button-container has-categories';
        
        // Create category cards
        elmGrid.innerHTML = '';
        arrCategoryKeys.forEach(strKey => {
            const objCategory = objCategories[strKey];
            const elmCard = document.createElement('div');
            elmCard.className = 'category-card';
            elmCard.innerHTML = `
                <h5>${objCategory.name}</h5>
                <p class="text-muted">${objCategory.fields.length} fields</p>
                <div class="category-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editCategory('${strKey}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteCategory('${strKey}')">Delete</button>
                </div>
            `;
            elmGrid.appendChild(elmCard);
        });
    }
}

// Load form fields based on selected category
function loadCategoryForm() {
    const elmCategorySelect = document.getElementById('categorySelect');
    const elmDataForm = document.getElementById('dataForm');
    const elmFormFields = document.getElementById('formFields');
    
    const strSelectedCategory = elmCategorySelect.value;
    
    if (!strSelectedCategory) {
        elmDataForm.style.display = 'none';
        return;
    }
    
    const objCategory = objCategories[strSelectedCategory];
    elmFormFields.innerHTML = '';
    
    objCategory.fields.forEach(objField => {
        const elmFieldDiv = document.createElement('div');
        elmFieldDiv.className = 'mb-3';
        const strInputType = objField.type === 'number' ? 'text' : objField.type;
        const strInputPattern = objField.type === 'number' ? 'pattern="[0-9]*"' : '';
        elmFieldDiv.innerHTML = `
            <label class="form-label">${objField.label}:</label>
            <input type="${strInputType}" ${strInputPattern} class="form-control" name="${objField.name}" required>
        `;
        elmFormFields.appendChild(elmFieldDiv);
    });
    
    elmDataForm.style.display = 'block';
}

// Submit new item data to database
function submitCategoryData() {
    const elmFormFields = document.getElementById('formFields');
    const elmInputs = elmFormFields.querySelectorAll('input');
    const objData = {};
    
    elmInputs.forEach(elmInput => {
        let value = elmInput.value;
        if (elmInput.type === 'number') {
            value = Number(value);
        }
        objData[elmInput.name] = value;
    });
    
    fetch('http://127.0.0.1:8000/api/collection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(objData)
    })
    .then(response => response.json())
    .then(objResult => {
        Swal.fire('Success!', 'Data saved successfully!', 'success');
        elmInputs.forEach(elmInput => elmInput.value = '');
        refreshTable();
    })
    .catch(error => {
        Swal.fire('Error!', 'Error saving data: ' + error.message, 'error');
    });
}

// === CATEGORY MANAGEMENT ===
let intNewFieldCount = 0;

// Show form to create new category
function showAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'block';
    document.getElementById('editCategoryForm').style.display = 'none';
    document.getElementById('deleteCategoryForm').style.display = 'none';
}

// Show form to edit existing category
function showEditCategoryForm() {
    document.getElementById('editCategoryForm').style.display = 'block';
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('deleteCategoryForm').style.display = 'none';
}

// Show form to delete category
function showDeleteCategoryForm() {
    document.getElementById('deleteCategoryForm').style.display = 'block';
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('editCategoryForm').style.display = 'none';
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

// Cancel category deletion and reset form
function cancelDeleteCategory() {
    document.getElementById('deleteCategoryForm').style.display = 'none';
    document.getElementById('deleteCategorySelect').value = '';
}

// Delete selected category
function deleteCategory() {
    const elmDeleteSelect = document.getElementById('deleteCategorySelect');
    const strCategoryKey = elmDeleteSelect.value;
    
    if (!strCategoryKey) {
        Swal.fire('Warning!', 'Please select a category to delete', 'warning');
        return;
    }
    
    const strCategoryName = objCategories[strCategoryKey].name;
    
    Swal.fire({
        title: 'Are you sure?',
        text: `Delete category "${strCategoryName}"? This cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((objResult) => {
        if (objResult.isConfirmed) {
            fetch(`http://127.0.0.1:8000/api/categories/${strCategoryKey}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(objResult => {
                delete objCategories[strCategoryKey];
                populateCategoryDropdowns();
                cancelDeleteCategory();
                Swal.fire('Deleted!', 'Category has been deleted.', 'success');
            })
            .catch(error => {
                Swal.fire('Error!', 'Error deleting category: ' + error.message, 'error');
            });
        }
    });
}

// Edit category from card
function editCategory(strCategoryKey) {
    const elmEditSelect = document.getElementById('editCategorySelect');
    elmEditSelect.value = strCategoryKey;
    loadEditCategoryForm();
    showEditCategoryForm();
}

// Confirm delete category from card
function confirmDeleteCategory(strCategoryKey) {
    const strCategoryName = objCategories[strCategoryKey].name;
    
    Swal.fire({
        title: 'Are you sure?',
        text: `Delete category "${strCategoryName}"? This cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((objResult) => {
        if (objResult.isConfirmed) {
            fetch(`http://127.0.0.1:8000/api/categories/${strCategoryKey}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(objResult => {
                delete objCategories[strCategoryKey];
                populateCategoryDropdowns();
                Swal.fire('Deleted!', 'Category has been deleted.', 'success');
            })
            .catch(error => {
                Swal.fire('Error!', 'Error deleting category: ' + error.message, 'error');
            });
        }
    });
}

// Add new field to category creation form
function addNewField() {
    const elmFieldsContainer = document.getElementById('newCategoryFields');
    const elmFieldDiv = document.createElement('div');
    elmFieldDiv.className = 'mb-2 d-flex gap-2';
    elmFieldDiv.innerHTML = `
        <input type="text" placeholder="Field Name" class="form-control">
        <select class="form-select">
            <option value="text">Text</option>
            <option value="number">Number</option>
        </select>
        <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
    `;
    elmFieldsContainer.appendChild(elmFieldDiv);
    intNewFieldCount++;
}

// Load category data for editing
function loadEditCategoryForm() {
    const elmEditSelect = document.getElementById('editCategorySelect');
    const elmEditContent = document.getElementById('editCategoryContent');
    const elmEditNameInput = document.getElementById('editCategoryName');
    const elmEditFieldsContainer = document.getElementById('editCategoryFields');
    
    const strSelectedKey = elmEditSelect.value;
    
    if (!strSelectedKey) {
        elmEditContent.style.display = 'none';
        return;
    }
    
    const objCategory = objCategories[strSelectedKey];
    elmEditNameInput.value = objCategory.name;
    elmEditFieldsContainer.innerHTML = '';
    
    // Populate existing fields
    objCategory.fields.forEach(objField => {
        const elmFieldDiv = document.createElement('div');
        elmFieldDiv.className = 'mb-2 d-flex gap-2';
        elmFieldDiv.innerHTML = `
            <input type="text" value="${objField.label}" class="form-control">
            <select class="form-select">
                <option value="text" ${objField.type === 'text' ? 'selected' : ''}>Text</option>
                <option value="number" ${objField.type === 'number' ? 'selected' : ''}>Number</option>
            </select>
            <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        elmEditFieldsContainer.appendChild(elmFieldDiv);
    });
    
    elmEditContent.style.display = 'block';
}

// Add new field to edit form
function addEditField() {
    const elmFieldsContainer = document.getElementById('editCategoryFields');
    const elmFieldDiv = document.createElement('div');
    elmFieldDiv.className = 'mb-2 d-flex gap-2';
    elmFieldDiv.innerHTML = `
        <input type="text" placeholder="Field Name" class="form-control">
        <select class="form-select">
            <option value="text">Text</option>
            <option value="number">Number</option>
        </select>
        <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
    `;
    elmFieldsContainer.appendChild(elmFieldDiv);
}

// Save edited category
function saveEditCategory() {
    const elmEditSelect = document.getElementById('editCategorySelect');
    const strCategoryName = document.getElementById('editCategoryName').value;
    const elmFieldDivs = document.getElementById('editCategoryFields').children;
    
    if (!strCategoryName) {
        Swal.fire('Warning!', 'Please enter a category name', 'warning');
        return;
    }
    
    const arrFields = [];
    for (let elmDiv of elmFieldDivs) {
        const elmNameInput = elmDiv.querySelector('input[type="text"]');
        const elmTypeSelect = elmDiv.querySelector('select');
        if (elmNameInput.value) {
            arrFields.push({
                name: elmNameInput.value.toLowerCase().replace(/\s+/g, '_'),
                label: elmNameInput.value,
                type: elmTypeSelect.value
            });
        }
    }
    
    if (arrFields.length === 0) {
        Swal.fire('Warning!', 'Please add at least one field', 'warning');
        return;
    }
    
    const strCategoryKey = elmEditSelect.value;
    const objUpdatedCategory = {
        name: strCategoryName,
        fields: arrFields
    };
    
    // Save to server
    fetch('http://127.0.0.1:8000/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: strCategoryKey, category: objUpdatedCategory })
    })
    .then(response => response.json())
    .then(objResult => {
        objCategories[strCategoryKey] = objUpdatedCategory;
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
    const strCategoryName = document.getElementById('newCategoryName').value;
    const elmFieldDivs = document.getElementById('newCategoryFields').children;
    
    if (!strCategoryName) {
        Swal.fire('Warning!', 'Please enter a category name', 'warning');
        return;
    }
    
    const arrFields = [];
    for (let elmDiv of elmFieldDivs) {
        const elmNameInput = elmDiv.querySelector('input[type="text"]');
        const elmTypeSelect = elmDiv.querySelector('select');
        if (elmNameInput.value) {
            arrFields.push({
                name: elmNameInput.value.toLowerCase().replace(/\s+/g, '_'),
                label: elmNameInput.value,
                type: elmTypeSelect.value
            });
        }
    }
    
    if (arrFields.length === 0) {
        Swal.fire('Warning!', 'Please add at least one field', 'warning');
        return;
    }
    
    const strCategoryKey = strCategoryName.toLowerCase().replace(/\s+/g, '_');
    const objNewCategory = {
        name: strCategoryName,
        fields: arrFields
    };
    
    // Save to server
    fetch('http://127.0.0.1:8000/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: strCategoryKey, category: objNewCategory })
    })
    .then(response => response.json())
    .then(objResult => {
        objCategories[strCategoryKey] = objNewCategory;
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
    const elmCategorySelect = document.getElementById('searchCategorySelect');
    const strSelectedCategory = elmCategorySelect.value;
    
    if (!strSelectedCategory) {
        // Clear table if no category selected
        const elmTable = document.getElementById('dataTable');
        elmTable.innerHTML = '';
        return;
    }
    
    // Fetch and filter data by category
    fetch('http://127.0.0.1:8000/api/collection')
    .then(response => response.json())
    .then(arrData => {
        const objCategory = objCategories[strSelectedCategory];
        const arrCategoryFields = objCategory.fields.map(objF => objF.name);
        
        // Filter data to only show items that have MOST fields from this category
        const arrFilteredData = arrData.filter(objItem => {
            const arrMatchingFields = arrCategoryFields.filter(strField => objItem.hasOwnProperty(strField));
            return arrMatchingFields.length >= Math.ceil(arrCategoryFields.length * 0.6);
        });
        
        displayFilteredData(arrFilteredData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

// Display filtered data in table
function displayFilteredData(arrData) {
    const elmTable = document.getElementById('dataTable');
    elmTable.innerHTML = '';
    
    if (arrData.length === 0) {
        elmTable.innerHTML = '<p>No data found for this category.</p>';
        return;
    }
    
    // Get all unique keys from filtered data
    const setAllKeys = new Set();
    arrData.forEach(objItem => {
        Object.keys(objItem).forEach(strKey => {
            if (strKey !== '_id' && strKey !== '__v') {
                setAllKeys.add(strKey);
            }
        });
    });
    const arrHeaders = [...setAllKeys, 'Actions'];
    
    // Create table header
    const elmThead = document.createElement('thead');
    const elmHeaderRow = document.createElement('tr');
    arrHeaders.forEach(strHeaderText => {
        const elmTh = document.createElement('th');
        elmTh.textContent = strHeaderText.charAt(0).toUpperCase() + strHeaderText.slice(1);
        elmHeaderRow.appendChild(elmTh);
    });
    elmThead.appendChild(elmHeaderRow);
    elmTable.appendChild(elmThead);
    
    // Create table body
    const elmTbody = document.createElement('tbody');
    arrData.forEach(objItem => {
        const elmRow = document.createElement('tr');
        arrHeaders.forEach(strHeader => {
            const elmCell = document.createElement('td');
            if (strHeader === 'Actions') {
                elmCell.innerHTML = `<button onclick="deleteRecord('${objItem._id}')">Delete</button>`;
            } else {
                elmCell.textContent = objItem[strHeader] || 'N/A';
            }
            elmRow.appendChild(elmCell);
        });
        elmTbody.appendChild(elmRow);
    });
    elmTable.appendChild(elmTbody);
}