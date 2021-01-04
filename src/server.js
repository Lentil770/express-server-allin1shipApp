const mysql = require('mysql')
const app = require('./app')
const { PORT }= require('./config')



const db = mysql.createConnection({
  host : process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'allinhip_app'
})

db.connect((err) => {
  if(err) {
    //console.log('error in db.connect.')
    throw err;
  }
  //console.log('mysql connected');
})


app.get('/getcustomerslist', (req, res) => {
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
})

//figure out how to set today and tomorow by a function etc.
const today = '2020-12-30';
const tomorrow = '2020-12-31';

//figure out how to get driver from app api request (header etc.) adn how to send it in app
//const driver = 'driver_1';
// OR: 
// INSIDE .GET FUNC! const driver = req.params.id;


//AND driver = '${driver}'

//need to figure out why crashing on load etc...
const today = new Date()

app.get('/getDailySchedule/:user', (req, res) => {
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
})

app.get('/sendTimestamp/:driver/:stop_number', (req, res) => {
  //console.log('timestamp received, sending to db');
  //this needs to receive drivers name, timestamp and date (and stop number?),
  //and add them to database
  let sql = `INSERT INTO timestamps (time_completed, driver, stop_number) 
  VALUES (now(), "${req.params.driver}", ${req.params.stop_number});`
  db.query(sql, (err, result) => {
    if (err) {
    //  console.log('error sending timestamp to db');
      throw err
    }
    //console.log('timestamp successfully sent to db');
    res.end()
  })
})


app.post('/sendFeedback/:driver/:stop_number', (req, res) => {
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
})


app.listen(PORT, () => {
  //console.log(`Server listening at http://localhost:${PORT}`)
})
/*
*/
/*

  //in here the app needs to fetch the daly schedule and route info and customer info from database.
  // i need to figure out what the query is, set a default, and fetch it!, acc to user

  roys suggestion for sql:
SELECT schedules.vehicle , schedules.dropoff_info, stops.id,  stops.stop_number, stops.customer_id, customers.customer_name, customers.address, customers.location, customers.contact_name, customers.contact_number, customers.comments 
FROM schedules JOIN route_list
ON schedules.route_id = route_list.id
JOIN stops ON stops.route_id = route_list.id
JOIN customers on stops.customer_id = customers.customer_id
WHERE driver = 'driver_1'
ORDER BY stop_number;

list of necesary things to fetch for app:
schedules.vehicle , schedules.dropoff_info, stops.id,  stops.stop_number, stops.customer_id, customers.customer_name, customers.address, customers.location, customers.contact_name, customers.contact_number, customers.comments

make a function to only fetch TODAYS:
schedule_date BETWEEN '2020-12-28' AND '2020-12-30' AND 

  let sql = `SELECT * FROM daily_schedule WHERE id = ${req.params.id} AND date = ${today somehow};
   let query = db.query(sql, (err, result) => {
     if(err) throw err;
     console.log(result);
     res.json(result);
   })
}))

*/