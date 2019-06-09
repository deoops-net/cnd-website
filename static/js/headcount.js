(function(){
    // send a request with some basic user infos
    // but we should not collect privacy, and we don't set cookies for users
    // just some for pv uv statistics
    var payload = {
        page: window.location.pathname ||  window.location.href,
    }

    console.log(payload)

    fetch('/headcount', {
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json;'
        },
        method: 'POST',
    })

})()