//this is a test file with the endpoints for the admin-app, to add / edit data in databaase.

/*

*ON WEBSITE OPENING:
  FETCH LIST OF DRIVERS SOMEHOW (FETCH * FROM SCHEDULES WHERE COLUMN = DRIVER, UNIQUE (something like that))
  FETCH LIST OF VEHICLES SOMEHOW (FETCH * FROM SCHEDULES WHERE COLUM = VEHICLE UNNIQUE)]
  FETCH ROUTE IDS AND THE STOP NUMBER, ADDRESS AND NOTES OF THAT ROUTE. (ASK ROY TO WRITE QUERY)

*ON SUBMIT SCHEDULE:
  PUSH DATE, DRIVER , VEHICLE, DROPPOFFINFO TEXT, ROUTE NUMBER AND (CHANGED NOTES FROM ROUTE TO DATABASE*) AS A SCHEDULE READY TO BE FETCHED BY APP.
  *NEED TO FIGURE OUT HOW TO UPDATE THE NOTES COLUMN ON SUBMIT IN ALREADY EXISTING ROUTE.

*ON CREATE NEW ROUTE CLICK:
  FETCH ROUTE_LIST LENGTH SO ROUTE # BECOMES 1 MORE THAN THAT.
  FETCH NAME/ADDRESS (BOTH) (THROUGH THEIR ID SOMEHOW?) OF CUSTOMERS FOR DROPDOWN LIST.

*ON SUBMIT ROUTE:
  PUSH INSERT NEW ROUTE: (ROUTE_ID)
  PUSH INSERT NEW STOPS: ROUTE_ID, STOP#, CUSTOMER_ID (FROM NAME SOMEHOW), AND NOTES


SO ... SEEMS LIKE FOUR NEW ENDPONTS, PROB NOT SUPER SIMPLE BUT BEZH WILL MANAGE AND ROY WILL HELP.
THANK YOU HASHEM, BEZH NAASE VENATZLIACH