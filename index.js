const path = require('path');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const Joi = require('joi');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(`app: ${app.get('env')}`);

const Validate = require('./router');

// app.use(express.json()); // instead I use bodyParser module
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

// Configuration
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
// console.log('Mail Password: ' + config.get('mail.password'));

if( app.get('env') === 'development') {
  app.use(morgan('tiny'));
  console.log("Morgan enabled...");
}

app.use(Validate.Log)
app.use(Validate.Authenticate)

const courses = [
  {id: 1, name: 'course 1'},
  {id: 2, name: 'course 2'},
  {id: 3, name: 'course 3'}
];

app.get('/', (req, res, next) => {
  res.send('<h1>Hello World</h1>');
  res.end();
})

app.get('/api/courses', (req, res, next) => {
  res.send(courses);
})

// app.get('/api/posts/:year/:mong', (req, res, next) => {
//   res.send(req.params);
// })

app.post('/api/courses', (req, res, next) => {
  const { error } = validateCourse(req.body);
  if(error) return res.status(400).send(error.details[0].message)

  const course = {
    id: courses.length + 1,
    name: req.body.name
  }
  courses.push(course);
  res.send(course);
})

app.put('/api/courses/:id', (req, res) => {
  // look up the course if exist update if not then send 404
  const course = courses.find( c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('The requested ID could not be found...!');

  // validate
  // if invalid, return 400 -bad request
  const { error } = validateCourse(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  // update course
  course.name = req.body.name;

  // return response
  res.send(course);
});



app.delete('/api/courses/:id', (req, res) => {
  const course = courses.find( c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('Requested ID could not be found...!');

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
})

app.get('/api/courses/:id', (req, res, next) => {
  const course = courses.find( c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('Requested ID could not be found...!');
  res.send(course);

  // =========================================
  /* Another variation to get the request  */
  // =========================================

  // const courseIndex = courses.findIndex( c => c.id === parseInt(req.params.id));
  // // console.log(parseInt(req.params.id));
  // console.log(courses[courseIndex]);

  // if(courseIndex < 0) res.status(404).send("Requested course could not be found...!");
  // return res.send(courses[courseIndex]);
})

function validateCourse(course) {
  const schema = { name: Joi.string().min(3).required() }
  return Joi.validate(course, schema);
}

// var result = _.contains([1,2,3], 2); // underscore module
// console.log(result)

// PORT
const PORT = process.env.PORT || 3000;
app.listen( PORT, () => console.log(`Listening port ${PORT}...`))