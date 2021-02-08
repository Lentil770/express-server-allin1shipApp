const mysql = require('mysql')
const app = require('./app')
const { PORT }= require('./config')



const dbInfo = {
  host : process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'allinoy4_app'
}

//db.connect()
/*
db.on('connect', () => console.log('connected to mysql db'));
db.on('end', () => console.log('mysql db connection ended.'))
*/


app.get('/getcustomerslist', (req, res) => {
  console.log('lentil getting /getcustomerslist');
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('connected to db');
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

/* for new multiple notes
let sql = `SELECT DISTINCT schedules.vehicle, schedules.driver, schedules.dropoff_info, stops.id, stops.stop_number,
    stops.customer_id, customers.customer_name, customers.address, customers.location, customers.contact_name, customers.contact_number, customers.comments,
    notes.* 
    FROM schedules JOIN route_list
    ON schedules.route_id = route_list.id
    JOIN stops ON stops.route_id = route_list.id
    JOIN customers on stops.customer_id = customers.customer_id
    JOIN stop_tasks on stop_tasks.stop_id = stops.id
    WHERE schedule_date BETWEEN '${todaysDate}' AND '${tomorrowsDate}' AND driver = '${driver}'
    ORDER BY stop_number;`;
*/

//ROUTINGAPP ENDPOINTS


app.get('/getDailyTasks/:schedule_stop_id', (req, res) => {
  /*
  in app, for each stop id query database with it. this finc fetches its stops and returns them
  WORKS IN POSTMAN:)
  */
  const db = mysql.createConnection(dbInfo)
  db.connect();

  let sql = `SELECT * FROM schedule_stop_tasks WHERE schedule_stop_id = ${req.params.schedule_stop_id} ORDER BY schedule_stop_id;`;

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


app.get('/getDailySchedule/:user', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  const today = new Date()
  const todaysDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const tomorrowsDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
  const driver = req.params.user;

  let sql = `SELECT DISTINCT schedules.vehicle, schedules.driver, schedules.dropoff_info, schedule_stop_table.schedule_stop_id, schedule_stop_table.stop_number,
    customers.customer_name, customers.address, customers.location, customers.contact_name, customers.contact_number, customers.comments
    FROM schedules 
    JOIN schedule_stop_table ON schedule_stop_table.schedule_id = schedules.id
    JOIN customers ON schedule_stop_table.customer_id = customers.customer_id
    WHERE schedule_date >= '${todaysDate} 08:00:00' AND schedule_date < '${tomorrowsDate} 08:00:00' AND driver = '${driver}'
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



app.get('/getFeedbackOptions', (req, res) => {
  console.log('getfeedback options is running');
  const feedBackOptions = ['No papers.', 'Customer made me wait over 5 minutes.', 'Complete but no bags.', 'No feedback']
  res.json(feedBackOptions);
})

app.get('/sendTimestamp/:sched_stop_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('timestamp received, sending to db', req.params);
  //this needs to receive drivers name, timestamp and date (and stop number?),
  //and add them to database
  
  let sql = `UPDATE schedule_stop_table SET check_out_time=now() WHERE schedule_stop_table.schedule_stop_id=${req.params.sched_stop_id};`
  /*INSERT INTO timestamps (time_completed, driver, stop_number) 
  VALUES (now(), "${req.params.driver}", ${req.params.stop_number});`*/
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/sendStartTime/:sched_stop_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('start time received, sending to db', req.params);
  
  let sql = `UPDATE schedule_stop_table SET check_in_time=now() WHERE schedule_stop_table.schedule_stop_id=${req.params.sched_stop_id};`
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/markTaskComplete/:task_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('task recieved, sending to db', req.params);
  
  let sql = `UPDATE schedule_stop_tasks SET completion_status='complete' WHERE schedule_stop_tasks.task_id=${req.params.task_id};`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/markTaskIncomplete/:task_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('task received, sending to db', req.params);
  
  let sql = `UPDATE schedule_stop_tasks SET completion_status='incomplete' WHERE schedule_stop_tasks.task_id=${req.params.task_id};`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/sendPackageNumber/:stop_id/:package_number', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('package number received, sending to db', req.params);
  
  let sql = `UPDATE schedule_stop_table SET number_packages='${req.params.package_number}' WHERE schedule_stop_table.schedule_stop_id=${req.params.stop_id};`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})
app.get('/markCompletionStatus/:stop_id/', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('completion received, sending to db', req.params);
  
  let sql = `UPDATE schedule_stop_table SET completion_status='complete' WHERE schedule_stop_table.schedule_stop_id=${req.params.stop_id};`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/sendFeedback/:sched_stop_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect()
  //console.log('feedback received, sending to db', req.body);
  let sql = `UPDATE schedule_stop_table SET feedback='${req.body.feedback}' WHERE schedule_stop_table.schedule_stop_id=${req.params.sched_stop_id};`
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

app.post('/sendTaskCompletion/:stop_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect()
  //console.log('feedback received, sending to db', req.body);
  let sql1 = `
  UPDATE stop_tasks SET time_completed=CURRENT_TIMESTAMP() WHERE stop_id=${req.params.stop_id} AND task='${req.body.task}';
  `
  let sql2 = `
  UPDATE stop_tasks SET complete=1 WHERE stop_id=${req.params.stop_id} AND task='${req.body.task}';`

  db.query(sql1, (err, result) => {
    if (err) {
    //  console.log('error sending feedback to db');
      throw err
    }
    //console.log('feedback successfully sent to db');
    res.json(req.body)
  })
  db.query(sql2, (err, result) => {
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

app.get('/defaultRouteDisplay/:route_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('getting /singleRouteDisplay/:route_id');

  let sql =  `SELECT stops.id, stops.stop_number, stops.customer_id, customers.customer_id, customers.address, customers.customer_name
  FROM stops
  JOIN customers ON stops.customer_id = customers.customer_id
  WHERE route_id = ${req.params.route_id}
  ORDER BY stop_number;`;
/*
  let sql = `SELECT  stops.id, stop_number, notes, address, customer_name, customers.customer_id FROM
  route_list JOIN stops ON stops.route_id = route_list.id
  JOIN customers ON stops.customer_id = customers.customer_id
  WHERE route_id = ${req.params.route_id}
  ORDER BY stop_number;`;
*/

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/singleRouteDisplay/:schedule_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('getting /singleRouteDisplay/:route_id');

  let sql =  `SELECT schedule_stop_table.schedule_stop_id, schedule_stop_table.customer_id, schedule_stop_table.stop_number, customers.customer_id, customers.address, customers.customer_name
    FROM schedule_stop_table 
    JOIN customers ON schedule_stop_table.customer_id = customers.customer_id
    WHERE schedule_id = ${req.params.schedule_id}
    ORDER BY stop_number;`;
/*
  let sql = `SELECT  stops.id, stop_number, notes, address, customer_name, customers.customer_id FROM
  route_list JOIN stops ON stops.route_id = route_list.id
  JOIN customers ON stops.customer_id = customers.customer_id
  WHERE route_id = ${req.params.route_id}
  ORDER BY stop_number;`;
*/

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/getRouteTasks/:stop_id', (req, res) => {
  /*
  in app, for each stop id query database with it. this finc fetches its stops and returns them
  WORKS IN POSTMAN:)
  */
  const db = mysql.createConnection(dbInfo)
  db.connect();

  let sql = `SELECT * FROM schedule_stop_tasks WHERE schedule_stop_id = ${req.params.stop_id} ORDER BY schedule_stop_id;`;

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

app.get('/singleScheduleDisplay/:driver', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log('getting /singleScheduleDisplay/:driver');

  let sql = `SELECT * FROM
  schedules WHERE driver='${req.params.driver}' AND DATE(schedule_date)= CURDATE();
  `;

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
    VALUES ('${req.body.selectedDate} 08:00:00', '${req.body.selectedDriver}', '${req.body.selectedVehicle}', '${req.body.selectedDropOffInfo}', ${req.body.selectedDefaultRoute})`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/postScheduleStops', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
  let sql = `INSERT INTO schedule_stop_table(schedule_id, customer_id, stop_number)
    VALUES (${req.body.scheduleId}, ${req.body.customerId}, ${req.body.stopNumber});
  `
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result.insertId)
  })
  db.end();
})

app.post('/postStopTask/:scheduleStopId', (req, res) => {
  //res.send('insert req.body and req.params.scheduleStopId to sched_stop_tasks')
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
  let sql = `INSERT INTO schedule_stop_tasks(schedule_stop_id, task)
    VALUES (${req.params.scheduleStopId}, '${req.body.task}');
  `
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.get('/deleteStopsTasks/:scheduleStopId', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  let sql = `
  DELETE FROM schedule_stop_tasks WHERE schedule_stop_id=${req.params.scheduleStopId};
  `
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})
app.post('/alterStopTask/:scheduleStopId', (req, res) => {
  //res.send('insert req.body and req.params.scheduleStopId to sched_stop_tasks')
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
  let sql = `
  INSERT INTO schedule_stop_tasks(schedule_stop_id, task)
    VALUES (${req.params.scheduleStopId}, '${req.body.task}');
  `
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/alterScheduleStops', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);
  let sql = `UPDATE schedule_stop_table SET customer_id=${req.body.customerId}
    WHERE schedule_id=${req.body.scheduleId} AND stop_number=${req.body.stopNumber};
  `
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result.insertId)
  })
  db.end();
})

app.post('/alterSchedule/:schedule_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body); 
  let sql = `UPDATE schedules SET schedule_date='${req.body.selectedDate} 08:00:00', driver='${req.body.selectedDriver}', vehicle='${req.body.selectedVehicle}', dropoff_info='${req.body.selectedDropOffInfo}', route_id=${req.body.selectedDefaultRoute}
  WHERE schedules.id=${req.params.schedule_id}`;
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

app.post('/postStopChanges/:route_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `UPDATE stops SET notes='${req.body.notes}', stop_number=${req.body.stop_number}, customer_id=${req.body.customer_id} WHERE route_id=${req.params.route_id} AND stop_number=${req.body.key}`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

app.post('/postScheduleChanges/:schedule_id', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `UPDATE schedules SET schedule_date='${req.body.schedule_date}', driver=${req.body.driver}, vehicle=${req.body.vehicle} dropoff_info=${req.body.dropoff_info} WHERE driver=${req.params.driver} AND schedule_date=${req.params.schedule_date}`;

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

app.get('/getNumberSchedules', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `SELECT COUNT(*) FROM schedules;`;
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

app.get('/getCurrentRouteDetails/:driver', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  const today = new Date()
  const todaysDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const tomorrowsDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
  const { driver } = req.params;

  let sql = `SELECT schedules.vehicle, schedules.dropoff_info, route_list.route_name, schedule_stop_table.schedule_stop_id, schedule_stop_table.stop_number, schedule_stop_table.feedback, schedule_stop_table.completion_status, 
  schedule_stop_table.number_packages, schedule_stop_table.check_in_time, schedule_stop_table.check_out_time, customers.customer_name FROM
  schedules JOIN route_list ON route_list.id = schedules.route_id
  JOIN schedule_stop_table ON schedule_stop_table.schedule_id = schedules.id
  JOIN customers ON schedule_stop_table.customer_id = customers.customer_id
  WHERE schedule_date >= '${todaysDate} 08:00:00' AND schedule_date < '${tomorrowsDate} 08:00:00' AND driver = '${driver}'
  ORDER BY stop_number;`;

  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})


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


//fetches id, start_time and driver from start_times. (add date filter to get the days starts? maybe unnecasary.)
app.get('/getStartTimesData/:driver', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `SELECT * FROM start_times WHERE driver='${req.params.driver}';`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
  db.end();
})

//fetches daily stop timestamps for driver(add date filter to get the days starts?)
app.get('/getTimestampsData/:driver', (req, res) => {
  const db = mysql.createConnection(dbInfo)
  db.connect();
  console.log(req.body);

  let sql = `SELECT time_completed, driver, stop_number FROM timestamps WHERE driver='${req.params.driver}';`;
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
