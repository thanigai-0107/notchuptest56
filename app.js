var express=require('express');// importing express
var app= express();
var path=require('path')
var bodyParser = require('body-parser')// importing body parser middleware to parse form content from HTML
var nodemailer = require('nodemailer');// importing nodemailer
const fs = require('fs');
let rawdata = fs.readFileSync('data.json');
let coursedata=JSON.parse(rawdata);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));

// route which captures form details and sends it to your personal mail
app.post('/',(req,res,next)=>{

  var dt = new Date( `${req.body.date}`);
  var year = dt.getFullYear();
  var month = dt.getMonth();
  var day = dt.getDate();
  
  // var day =`${req.body.date}`.split("-")[0];
  // var month=`${req.body.date}`.split("-")[1];
  // var year=`${req.body.date}`.split("-")[2];
  
  var dhours =`${req.body.time}`.split(":")[0];
  var dminutes =`${req.body.time}`.split(":")[1];
  // console.log(year);
  // console.log(month);
  // console.log(day);
  // console.log(dhours);
  // console.log(dminutes);

//Logic to find the accurate slot date and time 
  
  for(i=0;i<coursedata.length;i++)
{
    var row;
    if(JSON.stringify(coursedata[i].course_id)==`${req.body.courses}`){
       var mint=5000;
        var col=0;
        for(j=0;j<coursedata[i].slots.length;j++){
            unixtime=coursedata[i].slots[j].slot;
            timestamp=(unixtime/1000);
            milliseconds=timestamp*1000;
            const dateObject = new Date(milliseconds);
            var date = dateObject.toLocaleString();
            // console.log(date);
            const curdate = new Date(year,month,day,dhours,dminutes);
            var cur = curdate.getTime();
            var cdate = curdate.toLocaleString();
            // console.log(cdate);
            var pdate=new Date();
            var pre=pdate.getTime();
            var pdiff=milliseconds-pre;
            var diff = (milliseconds - cur);
            if(diff>0 && pdiff>0){
                var hours = Math.round(diff / (1000 * 60 * 60 ));
                var phours=Math.round(pdiff / (1000 * 60 * 60 ));
                console.log(phours);
                if(hours<mint && phours>4 && coursedata[i].slots[j].instructor_count>0)
            {
                mint=hours;
                col=j;
                row=i;
            }
                }
              }
      }
}
// console.log(coursedata[row].slots[col].instructor_count);
if(mint!=5000){
coursedata[row].slots[col].instructor_count=coursedata[row].slots[col].instructor_count-1;
fs.writeFileSync('data.json', JSON.stringify(coursedata));
// console.log(coursedata[row].slots[col].instructor_count);
slottime=coursedata[row].slots[col].slot;
slottimestamp=(slottime/1000);
slotmilliseconds=slottimestamp*1000;
const dateObject = new Date(slotmilliseconds);
var slotdate =dateObject.toLocaleString();// Slot date and time
console.log(slotdate);
}
console.log(req.body)

if(`${req.body.courses}`==1)
{
var course="Scrach Junior";
}
else if(`${req.body.courses}`==2){
    var course="Web Development";
}
else if(`${req.body.courses}`==3){
  
    var course="Game Development";
}
else if(`${req.body.courses}`==4){
    var course="App Development";
}
  else{
    var course="Python";
    
}
  
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'notchuptest56@gmail.com',
      pass: 'notchup56'
    }
  }); 

//Classes found
if(mint!=5000){
  var mailOptions = {
    from: 'notchuptest56@gmail.com',
    to: `${req.body.email}`,
    subject: `NotchUp Trail Class Booked successfully`,
    html:`<h1>Dear ${req.body.parentname}</h1>
          <h2> ${req.body.name}'s trial class for the course `+ course + ` at `+ slotdate + ` has been successfully booked.</h2>`
  };
}
//Classes not found
else
{
  var mailOptions = {
    from: 'notchuptest56@gmail.com',
    to: `${req.body.email}`,
    subject: `NotchUp Trail Class Booking failed`,
    html:`<h1>Dear ${req.body.parentname}</h1>
          <h2> ${req.body.name}'s trial class for the course `+ course +` is not available on your preferred date right now.</h2>`
  };
}
  
  

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.send('error') 
    } else {
      console.log('Email sent: ' + info.response);
      
      res.send("Email sent successfully");
      
    }
  });
})
app.listen(1234);

