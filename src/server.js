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

//distinct solves issue of multiple identical stops/routes, but does not solve there being multiple DIFFERENT stops/rotues. 
//POSSIBLE SOLUTION (ask roy for actual best way) admin app CHANGE route dont just add new

app.get('/getDailySchedule/:user', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  const today = new Date()
  console.log('getting /getdailyschedule/:user');
  const todaysDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const tomorrowsDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
  const driver = req.params.user;

  let sql = `SELECT DISTINCT schedules.vehicle, schedules.driver, schedules.dropoff_info, stops.id, stops.stop_number, stops.notes,
    stops.customer_id, customers.customer_name, customers.address, customers.location, customers.contact_name, customers.contact_number, customers.comments 
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


//ROUTINGAPP ENDPOINTS

app.get('/sendTimestamp/:driver/:stop_number', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('timestamp received, sending to db', req.params);
  //this needs to receive drivers name, timestamp and date (and stop number?),
  //and add them to database
  
  let sql = `INSERT INTO timestamps (time_completed, driver, stop_number) 
  VALUES (now(), "${req.params.driver}", ${req.params.stop_number});`
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/sendStartTime/:driver', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('start time received, sending to db', req.params);
  
  let sql = `INSERT INTO start_times (driver) 
  VALUES ("${req.params.driver}");`
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
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

//ADMIN APP ENDPOINTS


app.get('/singleRouteDisplay/:route_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('getting /singleRouteDisplay/:route_id');

  let sql = `SELECT  stop_number, notes, address, customer_name FROM
  route_list JOIN stops ON stops.route_id = route_list.id
  JOIN customers ON stops.customer_id = customers.customer_id
  WHERE route_id = ${req.params.route_id}
  ORDER BY stop_number;`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/getVehicles', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();

  let sql = `SELECT DISTINCT vehicle FROM schedules`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/getDrivers', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();

  let sql = `SELECT DISTINCT driver FROM schedules`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/getNumberRoutes', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();

  let sql = `SELECT id, route_name FROM route_list`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/postSchedule', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
  let sql = `INSERT INTO schedules(schedule_date, driver, vehicle, dropoff_info, route_id)
    VALUES ('${req.body.selectedDate}', '${req.body.selectedDriver}', '${req.body.selectedVehicle}', '${req.body.selectedDropOffInfo}', ${req.body.selectedRoute})`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/postChangedComments/:route_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `UPDATE stops SET notes='${req.body.comment}' WHERE route_id=${req.params.route_id} AND stop_number=${req.body.key}`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/getCustomersData', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `SELECT customer_id, customer_name FROM customers;`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/getRouteLength', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `SELECT COUNT(*) FROM route_list;`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/createNewRouteList/:newRouteListName', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `INSERT INTO route_list (route_name)
  VALUES ('${req.params.newRouteListName}');`
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/postNewRoute', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
//can i get customer_id? or should i get address and find id in sql?
  let sql = `INSERT INTO stops (route_id, stop_number, customer_id, notes)
  VALUES (${req.body.route_id}, ${req.body.stop_number}, ${req.body.customer_id}, '${req.body.notes}');`

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/postNewCustomer', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
//can i get customer_id? or should i get address and find id in sql?
  let sql = `INSERT INTO customers (customer_name, address, location, contact_name, contact_number, comments, active)
  VALUES ('${req.body.customer_name}', '${req.body.address}', '${req.body.location}', '${req.body.contact_name}', ${req.body.contact_number}, '${req.body.comments}', 1);`

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(result)
  })
  db.end();
})


//DISPLAY FEEDBACK ENDPOINTS

app.get('/getFeedbackData/:driver', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `SELECT feedback_date, stop_number, feedback FROM driver_feedback WHERE driver='${req.params.driver}';`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})


//GENERAL SERVER FUNCTIONS
process.on('uncaughtException', err => {
  console.log(`Uncaught Exception: ${err.message}`)
})

app.listen(PORT, () => {
  console.log(`Server listening on this port.${PORT}`)
})
