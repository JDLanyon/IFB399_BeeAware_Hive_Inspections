// Switch to sub screens within the module
function hip_switchScreen(screen_name) {
    var pages = document.getElementsByClassName("hip_screen");
    var shownScreen = document.getElementById(screen_name);
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }
    shownScreen.style.display = "block";
};

function hip_addRow(table) {
    if (table == "locations") {
        var html_table = document.getElementById("hip_location_table");
        // empty row html string (this is silly)
        let next_ID = html_table.children[1].children.length + 1;

        // 1 isn't the user id and next_ID is a bad way of displaying addressID for new rows.
        let table_body = "\n<tr>\n<th>" + next_ID + "</th><th>" + 1 + "</th>";
        for (let i = 0; i < 9; i++) {
            table_body += "<td contenteditable=\"true\"></td>";
        }
        table_body += "<th></th>\n</tr>";

        html_table.children[1].insertAdjacentHTML('beforeend', table_body);
    } else {
        return;
    }
}

function hip_delRow(table) {
    if (table == "locations") {
        var html_table = document.getElementById("hip_location_table");
        // delete the last row
        let next_ID = html_table.children[1].removeChild(html_table.children[1].lastChild);

        html_table.children[1].insertAdjacentHTML('beforeend', table_body);
    } else {
        return;
    }
}

// Populates table with data from the database
function hip_resyncTable(table) {
    // check that the user wants to resync the table.
    if (window.confirm("This will reset any modifications you have made. Are you sure you want to resync the table?") == false)
        return;

    if (table == "locations") { // fetch hive locations from database.

        fetch("/api/hip/getLocations", { // fetch to the api route that is provided in backend, with get if you need
            referer: 'about:client',
            credentials: 'same-origin',
            headers: new Headers({ 'content-type': 'application/ json' }),
        })
            .then(function (response) {
                if (response.status == 200) {
                    response.json()
                        .then(data => {

                            // Rebuild table depending on the existing data
                            var html_table = document.getElementById("hip_location_table");

                            // build table body from data
                            let table_body = "";
                            data.forEach(function (row, row_val) {
                                table_body += "<tr>\n<th>" + row["AddressID"]
                                    + "</th><th>" + row["UserID"]
                                    + "</th><td contenteditable=\"true\">" + row["AddressType"]
                                    + "</td><td contenteditable=\"true\">" + row["Address1"]
                                    + "</td><td contenteditable=\"true\">" + row["Address2"]
                                    + "</td><td contenteditable=\"true\">" + row["Address3"]
                                    + "</td><td contenteditable=\"true\">" + row["City"]
                                    + "</td><td contenteditable=\"true\">" + row["PostCode"]
                                    + "</td><td contenteditable=\"true\">" + row["RegionalCouncil"]
                                    + "</td><td contenteditable=\"true\">" + row["State"]
                                    + "</td><td contenteditable=\"true\">" + row["Country"]
                                    + "</td><th>" + row["PostDate"]
                                    + "</th>\n</tr>";
                            })

                            // replace current body with new body
                            html_table.children[1].innerHTML = table_body;

                        })
                } else {
                    window.alert("failed!!")
                }
            }
            ).catch(function (err) {
                console.log(err);
            });
    } else {
        window.alert("Unexpected parameter given for hip_resyncTable().");
    }
}

function hip_uploadTable(table) {
    // check that the user wants to resync the table.
    if (window.confirm("Are you sure you want to upload the table? Previous entries will not be saved.") == false)
        return;

    if (table == "locations") { // fetch hive locations from database.
        let html_table_data = document.getElementById("hip_location_table").rows;
        let json_table = [];
        console.log(html_table_data);

        for (let i = 1; i < html_table_data.length; i++) { // i starts at 1 to avoid the header row.
            let html_row_data = html_table_data[i].children;
            var json_row = {};

            json_row.AddressID = html_table_data[i].children[0].innerHTML;
            json_row.UserID = html_table_data[i].children[1].innerHTML;
            json_row.AddressType = html_table_data[i].children[2].innerHTML;
            json_row.Address1 = html_table_data[i].children[3].innerHTML;
            json_row.Address2 = html_table_data[i].children[4].innerHTML;
            json_row.Address3 = html_table_data[i].children[5].innerHTML;
            json_row.City = html_table_data[i].children[6].innerHTML;
            json_row.PostCode = html_table_data[i].children[7].innerHTML;
            json_row.RegionalCouncil = html_table_data[i].children[8].innerHTML;
            json_row.State = html_table_data[i].children[9].innerHTML;
            json_row.Country = html_table_data[i].children[10].innerHTML;
            json_row.PostDate = html_table_data[i].children[11].innerHTML;

            json_table.push(json_row); // add row entry to list


            // old code

            //for (let j = 0; j < html_row_data.length; j++) {
            //    // convert to the correct datatype
            //    if (j <= 1 || j == html_row_data.length - 1)
            //        json_row.push(Number(html_row_data[j].innerHTML));
            //    // this part may be problematic and would need actual front end datetime implementation.
            //    else if (j == html_row_data.length)
            //        json_row.push(new Date(html_row_data[j].innerHTML));
            //    else
            //        json_row.push(html_row_data[j].innerHTML);
            //}
            //json_table.push(json_row);
        }

        console.log(json_table);
        const data = JSON.stringify(json_table);

        // push to DB
        fetch("/api/hip/postLocations", {
            method: 'POST',
            referer: 'about:client',
            credentials: 'same-origin',
            headers: new Headers({ 'content-type': 'application/ json' }),
            body: data,
        })
            .then(function (response) {
                if (response.status == 200) {
                    response.json()
                        .then(() => {
                            window.alert("Success!")
                        })
                } else {

                }
            }
            ).catch(function (err) {
                
            });


    } else {
        window.alert("Unexpected parameter given for hip_uploadTable().");
    }
}

// table editing is from https://code-boxx.com/editable-html-table/

// Edit cells in a table
window.addEventListener("DOMContentLoaded", () => {
    for (let cell of document.querySelectorAll(".hip_table td")) {
        cell.ondblclick = () => editable.edit(cell);
    }
})

// Convert a cell to be an editable field
var editable = {
    // (B) PROPERTIES
    selected: null, // current selected cell
    value: "", // current selected cell value

    // (C) "CONVERT" TO EDITABLE CELL
    edit: cell => {
        // (C1) REMOVE "DOUBLE CLICK TO EDIT"
        cell.ondblclick = "";

        // (C2) EDITABLE CONTENT
        cell.contentEditable = true;
        cell.focus();

        // (C3) "MARK" CURRENT SELECTED CELL
        cell.classList.add("edit");
        editable.selected = cell;
        editable.value = cell.innerHTML;

        // (C4) PRESS ENTER/ESC OR CLICK OUTSIDE TO END EDIT
        window.addEventListener("click", editable.close);
        cell.onkeydown = evt => {
            if (evt.key == "Enter" || evt.key == "Escape") {
                editable.close(evt.key == "Enter" ? true : false);
                return false;
            }
        };
    },
    // ...
};

// (D) END "EDIT MODE"
close: evt => {
    if (evt.target != editable.selected) {
        // (D1) CANCEL - RESTORE PREVIOUS VALUE
        if (evt === false) {
            editable.selected.innerHTML = editable.value;
        }

        // (D2) REMOVE "EDITABLE"
        window.getSelection().removeAllRanges();
        editable.selected.contentEditable = false;

        // (D3) RESTORE CLICK LISTENERS
        window.removeEventListener("click", editable.close);
        let cell = editable.selected;
        cell.onkeydown = "";
        cell.ondblclick = () => editable.edit(cell);

        // (D4) "UNMARK" CURRENT SELECTED CELL
        editable.selected.classList.remove("edit");
        editable.selected = null;
        editable.value = "";

        // (D5) DO WHATEVER YOU NEED
        if (evt !== false) {
            console.log(cell.innerHTML);
            // check value?
            // send value to server?
            // update calculations in table?
        }
    }
}


// Example JS
function exampleTest() {
    fetch("/api/hip/Test", { // fetch to the api route that is provided in backend, with get if you need
        referer: 'about:client',
        credentials: 'same-origin',
        headers: new Headers({ 'content-type': 'application/ json' }),
    })
        .then(function (response) {
            if (response.status == 200) {
                response.json()
                    .then(data => {
                        window.alert(data)
                    })
            } else {
                window.alert("failed!!")
            }

        }
        ).catch(function (err) {

        })
};

/*
function login(event) {
    event.preventDefault();
     var email = document.getElementById ("login-email")
     var password = document.getElementById("login-password")

     const data = JSON.stringify({
         'id': parseInt(0),

         "email": email.value,
         "group": email.value,

         "password": password.value,
     })
     fetch("/api/User/login", {
         method: 'POST',
         referer: 'about:client',
         credentials: 'same-origin',
         headers: new Headers({ 'content-type': 'application/ json' }),
         body: data,
     })
         .then(function (response) {
             if (response.status == 202) {
                 response.json()
                     .then(data => {
                       
                     })
             } else {
               
             }

         }
         ).catch(function (err) {

         })
 };*/
 // this is just a example function with post method

 // better to use [ModuleName]+function as function name to prevent duplicate name with other module functions.