const mysql = require('mysql')
const app = require('./app')
const { PORT }= require('./config')



const dbInfo = {
  host : process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'allinhip_app'
}

//db.connect()
/*
db.on('connect', () => console.log('connected to mysql db'));
db.on('end', () => console.log('mysql db connection ended.'))
*/


app.get('/getcustomerslist', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  //console.log('getting /getcustomerslist');
  let sql = 'SELECT * FROM customers';
  db.query(sql, (err, result) => {
    if (err) {
      //console.log('error in db.query getcustomerslist.')
      throw err
    }
    //console.log('got /getcustomerslist. result:', result)
    res.json(result)
  })
  db.end();
})


//figure out how to get driver from app api request (header etc.) adn how to send it in app
//const driver = 'driver_1';
// OR: 
// INSIDE .GET FUNC! const driver = req.params.id;


//AND driver = '${driver}'

//need to figure out why crashing on load etc...


app.get('/getDailySchedule/:user', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  const today = new Date()
  console.log('getting /getdailyschedule/:user');
  const todaysDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const tomorrowsDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
  const driver = req.params.user;

  let sql = `SELECT schedules.vehicle , schedules.dropoff_info, stops.id,  stops.stop_number, stops.customer_id, customers.customer_name, customers.address, customers.location, customers.contact_name, customers.contact_number, customers.comments 
    FROM schedules JOIN route_list
    ON schedules.route_id = route_list.id
    JOIN stops ON stops.route_id = route_list.id
    JOIN customers on stops.customer_id = customers.customer_id
    WHERE schedule_date BETWEEN '${todaysDate}' AND '${tomorrowsDate}' AND driver = '${driver}'
    ORDER BY stop_number;`;

  db.query(sql, (err, result) => {
    if (err) {
    //  console.log('error in db.query of /getdailyschedule/:user');
      throw err
    }
    //console.log('got db.query of getdailyschedule/user. result:')
    res.json(result)
  })
  db.end();
})

app.get('/sendTimestamp/:driver/:stop_number', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  //console.log('timestamp received, sending to db');
  //this needs to receive drivers name, timestamp and date (and stop number?),
  //and add them to database
  
  let sql = `INSERT INTO timestamps (time_completed, driver, stop_number) 
  VALUES (now(), "${req.params.driver}", ${req.params.stop_number});`
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.send('timestamp sent')
  })
  db.end();
})


app.post('/sendFeedback/:driver/:stop_number', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect()
  //console.log('feedback received, sending to db', req.body);
  let sql = `INSERT INTO driver_feedback (feedback_date, driver, stop_number, feedback) 
  VALUES (now(), "${req.params.driver}", ${req.params.stop_number}, "${req.body.feedback}");`
  db.query(sql, (err, result) => {
    if (err) {
    //  console.log('error sending feedback to db');
      throw err
    }
    //console.log('feedback successfully sent to db');
    res.json(req.body)
  })
  db.end();
})

process.on('uncaughtException', err => {
  console.log(`Uncaught Exception: ${err.message}`)
})

app.listen(PORT, () => {
  console.log(`Server listening on this port.${PORT}`)
})
