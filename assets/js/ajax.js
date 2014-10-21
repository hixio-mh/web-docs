var AJAX = {

  run: function (method, url, callback) {
    var res;

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      res = new XMLHttpRequest();
    }

    res.onreadystatechange = function () {
      if (res.readyState == 4) {
        callback && callback(res);
      }
    }

    res.open(method, url, true);
    res.send();
  },

  prepend: function (args, el) {
    var args = Array.prototype.slice.call(args);
    args.unshift(el);
    return args;
  },

  get: function () {
    this.run.apply(this.run, this.prepend(arguments, "GET"));
  },

  json: function (url, callback) {
    this.run("GET", url, function (res) {
      if (res.status !== 200){
        throw Error("Could not retrieve JSON data from "+url+" (Status Code: "+res.status+").");
      }
      try {
        res.json = JSON.parse(res.responseText);
      } catch (e) {
        res.json = null;
      }
      callback && callback(res.json);
    });
  }
}
