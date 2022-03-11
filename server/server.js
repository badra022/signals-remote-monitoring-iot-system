const express = require('express');
const sqlite = require('sqlite3').verbose();
const cors = require('cors');
var bodyParser = require('body-parser');

 
// open database in memory
let db = new sqlite.Database('./db/sensor.db', sqlite.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sensor database.');
});


let createSensorsTable = `create table if not exists sensorsReadings(
							temp_value          numeric(7,3) not null,
							hum_value          numeric(7,3) not null,
							InDtTm         DATETIME DEFAULT CURRENT_TIMESTAMP 
							)`;
  
db.run(createSensorsTable, function(err) {
	  if (err) {
		console.log(err.message);
	  }
	  else{
		console.log('Table Created $$$');
	  }
	});
  



const app  = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })



// routes
app.get('/', (req,res)=>{
	res.send('this is home')
})


// insert reading 
app.get('/addreading',(req,res)=>{
	res.send('reading 1 added...')
	let reading = {temp_value: 1 , hum_value : 36.2};
	let sql = `INSERT INTO sensorsReadings (temp_value , hum_value) VALUES(${reading.temp_value},${reading.hum_value})`;
	let query = db.run(sql, (err,result)=>{
		if(err) throw err;
		console.log(result)

	}) 
})



app.get('/getsensors',(req,res)=>{
	// let sql = 'SELECT * FROM sensorsreadings';

	let sql_g_o = `select * from sensorsReadings order by InDtTm DESC LIMIT 10`;


	let query = db.get(sql_g_o, (err,results)=>{
		if(err) throw err;
		console.log('data fetched successfully from data base')
		// res.send('sensors data fetched...')
		res.json(results)
	
	}) 
});





app.post("/addreadings", urlencodedParser , async (req, res) => {

	console.log("------------------------------hello badra----------------------------")
	
	
	let reading = {
		temp_value : req.body.temp_value,
		hum_value: req.body.hum_value
	};

	console.log(reading)

  let sql = `INSERT INTO sensorsReadings (temp_value , hum_value) VALUES(${reading.temp_value},${reading.hum_value})`;

	let query = db.run(sql, (err,result)=>{
		if(err) throw err;
		console.log("saved the sensor reading")
	}) 


	
	res.status(200).json({
	  message: "Values saved in database"
	});

  });



app.get('/getdata',(req,res)=>{
	// let sql = 'SELECT * FROM sensorsreadings';

	let sql_g_o = `select * from sensorsReadings order by InDtTm DESC LIMIT 10`;


	let query = db.get(sql_g_o, (err,results)=>{
		if(err) throw err;
		console.log(results)   
		// res.send('sensors data fetched...')
		res.json(results)
		// console.log('--------------------------------')
	
	}) 
});


app.get('/getsensors',(req,res)=>{
	// let sql = 'SELECT * FROM sensorsreadings';

	let sql_g_o = `select * from sensorsReadings order by InDtTm DESC LIMIT 10`;


	let query = db.get(sql_g_o, (err,results)=>{
		if(err) throw err;
		console.log('data fetched successfully from data base')
		// res.send('sensors data fetched...')
		res.json(results)
	
	}) 
});




app.listen(process.env.PORT || 3000 ,()=>{
	console.log('server started on port 3000 ');
});

