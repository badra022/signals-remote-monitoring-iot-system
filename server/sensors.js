const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
var bodyParser = require('body-parser')

// create connection 
const db = mysql.createConnection({
  host     : 'bljpcyfb4wgfdpksuges-mysql.services.clever-cloud.com',
  user     : 'u98n8iv7rrcrcsrz',
  password : 'HNhx8grSTYXeuOgHz7dw',
  database : 'bljpcyfb4wgfdpksuges',
  port	   : '3306',
});

const app  = express();

app.use(express.json({ limit: '1mb' }));
app.use(cors());

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// connect to the MySQL server
db.connect(function(err) {
	if (err) {
	  return console.error('error: ' + err.message);
	}
  });

let createSensorsTable = `create table if not exists sensorsReadings(
	sensorId       int,
	value          numeric(7,3) not null,
	InDtTm         DATETIME DEFAULT CURRENT_TIMESTAMP 
	)`;

db.query(createSensorsTable, function(err, results, fields) {
if (err) {
console.log(err.message);
}
else{
console.log('Table Created $$$');
}
});

// routes
app.get('/', (req,res)=>{
	res.sendFile('index.html');
})

// this will accept readings from the client end (from sensors and store them in the DB 
// -> html page that will get the sensor readings and send it to api[addreadings] using
//  fetch post [in the clint html] to be saved in db)

app.post("/addreadings", urlencodedParser , async (req, res) => {
	// handleDisconnect();

	/* uncomment next field if urlencoded parser*/ 
	let reading = {
		sensorId: req.body.sensorid,
		value: req.body.val
	};
	console.log(reading)

	let sql = `INSERT INTO sensorsReadings SET sensorId = ${reading.sensorId}, value=${reading.value}`;

	let query = db.query(sql, (err,result)=>{
		if(err) throw err;
		console.log("saved the sensor reading")
	}) 
	
	res.status(200)

  });

// get the top 20 sensor readings (will be callback after setting interval of sensors post )
// ########   This function should be called every 1s to update the api with the latest inserted readings ####
// -> html/flutter fetch data from this api and display the updated graph.

app.get('/getsensors',(req,res)=>{
	// handleDisconnect();

	let sql_g_o = ` (select * from sensorsReadings where sensorId = 1 order by InDtTm DESC LIMIT 1)
	  				UNION ALL
					(select * from sensorsReadings where sensorId = 2 order by InDtTm DESC LIMIT 1)`;


	let query = db.query(sql_g_o, (err,results)=>{
		if(err) throw err;
		console.log(results[0])
		res.json(results)
	
	}) 
})


//fetch individual sensor data 
app.get('/getsensor/:id',(req,res)=>{
	// handleDisconnect();

	let sql = `SELECT * FROM sensorsReadings WHERE sensorId =${req.params.id}`;
	let query = db.query(sql, (err,result)=>{
		if(err) throw err;
		console.log(result)
		// res.send(`sensor ${req.params.id}  data fetched `)
		res.json(result)
	}) 
})

setInterval(function () {
    db.query('SELECT 1');
}, 5000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});