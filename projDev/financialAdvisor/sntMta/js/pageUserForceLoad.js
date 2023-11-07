  // grab the raw "querystring"
  var query = document.location.hash.substring(1);

  // immediately change the hash
  document.location.hash = '';

  // parse it in some reasonable manner ... 
  var params = {};
  var parts = query.split(/&/);
  for (var i in parts) {
    var t = part[i].split(/=/);
    params[decodeURIComponent(t[0])] = decodeURIComponent(t[1]);
  }

  // and do whatever you need to with the parsed params
  doSearch(params.search);