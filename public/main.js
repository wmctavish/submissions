
// Edit functionality
var editButtons = document.getElementsByClassName("edit-button");

  for (let editButton of editButtons) {
    editButton.addEventListener('click', (event) => {
        var br = document.createElement('br')

        var editBox = document.createElement("textarea");
        editBox.setAttribute('class','editing-box');
        editBox.setAttribute('rows', '5');
        editBox.setAttribute('cols', '100');

        var editSubmit = document.createElement("button");
        editSubmit.innerHTML = "Submit";
        editSubmit.setAttribute('class',"editSubmit");

        var editCancel = document.createElement("button");
        editCancel.innerHTML = "Cancel";
        editCancel.setAttribute('class',"editCancel");

        var originalEntry = event.target.parentElement;
        originalEntry.appendChild(editBox);
        originalEntry.appendChild(br);
        originalEntry.appendChild(editCancel);
        originalEntry.appendChild(editSubmit);

        var boxes = document.getElementsByClassName('editing-box');
        for (let box of boxes) {
        var raw = box.parentElement.textContent;
        var tidy1 = raw.substring(raw.lastIndexOf(')') + 1);
        var tidy2 = tidy1.substring(0, tidy1.indexOf('Delete')).trim();
        box.value = tidy2;
        };

        editSubmission()
        editCancellation()
        }, {once:true})
        };

function editSubmission () {
  var editSubmits = document.getElementsByClassName("editSubmit");

  for (let edited of editSubmits) {
    edited.addEventListener('click', (event) => {
    var editconfirmation = confirm("Are you sure you want to edit this entry?");

    if (editconfirmation) {
      var editedInput = Array.from(event.target.parentElement.children)

        fetch('entries', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "_id": event.target.parentElement.getAttribute('id'),
            "note": editedInput[7].value
            })
        })
        .then(res => {
        if(res.ok) return res.json()
            })
        .then(data => {
            console.log(data)
            window.location.reload(true)
            })
        }
      });
      }
      };


function editCancellation() {
    var editCancels = document.getElementsByClassName("editCancel");

    for (let cancelled of editCancels) {
        cancelled.addEventListener('click', (event) => {
            var editingBox = event.target.parentElement.children[7];
            var editBreak = event.target.parentElement.children[8];
            var editSubmitButton = event.target.parentElement.children[9];
            var editCancelButton = event.target.parentElement.children[10];
            console.log(editingBox)
            editingBox.parentNode.removeChild(editingBox);
            editBreak.parentNode.removeChild(editBreak);
            editSubmitButton.parentNode.removeChild(editSubmitButton);
            editCancelButton.parentNode.removeChild(editCancelButton);
        })
    }
}

// Delete functionality
var delButtons = document.getElementsByClassName("delete-button");

for (let delButton of delButtons) {
  var entryId = delButton.parentElement.getAttribute('id');

  delButton.addEventListener('click', (event) => {
  var delconfirmation = confirm("Are you sure you want to delete this entry?");
   if (delconfirmation) {
    fetch('entries/:_id', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "_id": event.target.parentElement.getAttribute('id')
    })
  })
  .then(res => {
    if (res.ok) return res.json()
  }).
  then(data => {
    console.log(data)
    console.log("Entry " + entryId + " was deleted")
    window.location.reload(true)
    })
  }
 })
}