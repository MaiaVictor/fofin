var express = require('express');
var app = express();

var entries = [];

function get_entries_by(type){
    return function(req,res){
        var filter = req.params.filter.toLowerCase();
        var filtered_entries = entries.filter(function(entry){
            return filter === "*" || entry[type].toLowerCase().indexOf(filter) !== -1;
        });
        res.send(JSON.stringify(filtered_entries));
    }
};

app.get("/get_entries_by_title/:filter", get_entries_by("title"));
app.get("/get_entries_by_author/:filter", get_entries_by("author"));

app.post("/add_entry/:json", function(req,res){
    entries.push(JSON.parse(decodeURI(req.params.json)));
    console.log(entries);
});

app.post("/del_entry/:json", function(req,res){
    var entry = JSON.parse(decodeURI(req.params.json));
    entries = entries.filter(function(e){ return e.author !== entry.author || e.title !== entry.title; });
    console.log(entries);
});

app.use(express.static('front'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
