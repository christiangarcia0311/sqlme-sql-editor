let sqlEditor

// FOR TOGGLE SIDE CONTENT MENU
function Menu() {
  const side_content = document.getElementById('side-content');
  side_content.classList.toggle('open');
}

// LOAD CODE EDITOR FROM CODEMIRROR 
document.addEventListener("DOMContentLoaded", function() {
      sqlEditor = CodeMirror(document.getElementById('editor'), {
      lineNumbers: true,
      mode: "text/x-sql",
      theme: "dracula",
      autoCloseBrackets: true,
      viewportMargin: Infinity
    });
});

function loadTable() {
  fetch('/view_tables')
    .then(response => response.json())
    .then(data => {
      const table_list = document.getElementById('table-list');
      table_list.innerHTML = ''
      
      data.tables.forEach(table => {
        const li = document.createElement('li');
        li.textContent = table;
        li.onclick = (event) => {
          event.stopPropagation();
          sqlEditor.setValue(`SELECT * FROM ${table};`);
          Menu();
        };
        table_list.appendChild(li);
      });
    })
    .catch(error => console.error("Error loading tables", error))
}

// CREATE TABLE OUTPUT
function createTable(data) {
  const table = document.getElementById('table-output');
  table.innerHTML = '';
  
  if (data.length === 0) {
    table.innerHTML = "<tr><td>No results</td></tr>";
    return;
  }
  
  // const headers = Object.keys(data[0]);
  const headers = [];
  for (const key in data[0]) {
    headers.push(key);
  }
  
  let header_row = '<tr>';
  headers.forEach(header => {
    header_row += `<th>${header}</th>`;
  });
  header_row += '</tr>';
  table.innerHTML += header_row;
  
  data.forEach(row => {
    let row_html = '<tr>';
    headers.forEach(header => {
      row_html += `<td>${row[header]}</td>`;
    });
    row_html += '</tr>';
    table.innerHTML += row_html;
  });
}

// RUN QUERY FUNCTION 
function Run() {
  const query = sqlEditor.getValue();
  fetch('/run', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query: query})
  })
  .then(response => response.json())
  .then(result => {
    if (result.status == "success") {
      if (Array.isArray(result.data) && result.data.length > 0) {
        createTable(result.data);
        document.getElementById('console-output').textContent = "Query executed successfully.";
      }
      else {
        document.getElementById('console-output').textContent = "No results found.";
      }
    }
    else {
      document.getElementById('console-output').textContent = "Error: " + result.error;
    }
  })
  .catch(error => {
    document.getElementById('console-output').textContent = "Error: " + error;
  });
}

loadTable();