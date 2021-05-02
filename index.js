var express = require("express");
var expressLayouts = require("express-ejs-layouts");
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
const fs = require('fs');

const AquaDB = require("aquadb");
const Adapter = require("aquadb/adapters/JsonDB", {
  "name": "database",
  "separator": ".",
  "autoFile": true,
  "ignoreWarns": false
});
const db = new AquaDB(Adapter);

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
function coderscode(req, res, next) {
  if (req.session.loggedin) return next();
  req.session.backURL = req.url;
  res.redirect("/");
}
app.engine('.html', require('ejs').__express);
app.set("view engine", "html");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {	
  if (req.session.loggedin) return res.redirect('/home');
  res.render("index.html");
});
app.get('/siginup', (req,res) => {
  if (req.session.loggedin) return res.redirect('/home');
  res.render('createaccont.html');
})

app.get('/logout',coderscode, (req,res) => {
  req.session.loggedin = false;
  res.redirect('/');
})				
 
app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var mail = req.body.mail;
  if(db.get(`uye.${username}`)){
    if(db.get(`uye.${username}.sifre`) === password){
      if (!req.session.loggedin) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.password = password;
				req.session.mail = mail;
				res.redirect('/home');
      }
    }else res.send("boyle bir hesap yokg")
  }else res.send("boyle bir hesap yokg")
});

app.post('/codersCode', function(req,res) {
  var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var mail = req.body.mail;
  if (db.get(`uye.${username}`)) return res.send('Bu Isim Kullanilmis')
  if (db.get(`${mail}`)) return res.send('Bu E Postaya Ait Bir Hesap Zaten Var')
  if (password !== password2) return res.send('Sifreler Eslesmiyor')
  db.set(`uye.${username}.isim`,username)
  db.set(`uye.${username}.sifre`,password)
  db.set(`uye.${username}.eposta`,mail)
  res.redirect("/");
})
app.get('/home',coderscode,function(req, res) {
  res.render("home.html", {
    name:req.session.username,
    password:req.session.password 
  });
});
app.listen(3300, console.log('CodersCode Aktif'));
