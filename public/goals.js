

var didItButtons = document.getElementsByClassName('did-it');

for (let didIt of didItButtons) {
    didIt.addEventListener('click', (event) => {

        var uncut = event.target.parentElement.innerHTML;
        var thingIDid = uncut.substring(0, uncut.indexOf('<'));

        fetch('accomplishments', {
        method: 'post',
        headers: {'Content-Type': 'application/JSON'},
        body: JSON.stringify({
            "accomplishment": thingIDid
            })
        })
        .then(res => {
        if(res.ok) return res.json()
            })
        .then(data => {
            console.log(data)
            window.location.reload(true)
        })
    })
};


for (let didIt of didItButtons) {
  var entryId = didIt.parentElement.getAttribute('id');

  didIt.addEventListener('click', (event) => {
  var delconfirmation = confirm("Did you really accomplish this goal?");
   if (delconfirmation) {
    fetch('goals/:_id', {
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
    console.log("Goal " + entryId + " was accomplished. Added to 'Accomplishments' ")
    window.location.reload(true)
    })
  }
 })
};