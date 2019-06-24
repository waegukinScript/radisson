const fs = require('fs');
const pdf = require('html-pdf');
const jade = require('jade');
const Event = require('../models/Event');

exports.postEvent = (req, res, next) => {
  const obj = req.body;
  const event = new Event({
    CheckIn: obj.CheckIn,
    CheckOut: obj.CheckOut,
    Guests: obj.Guests
  });
  event.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.postDeleteEvent = (req, res, next) => {
  const { id } = (req.params);
  Event.findOneAndDelete({ _id: id }, (err) => {
    if (err) {
      console.log(err);
    } else {
      return res.redirect('/eventDatabase');
    }
  });
};

exports.postEditEvent = (req, res, next) => {
  const { id } = (req.params);
  Event.findById({ _id: id }, (err, event) => {
    if (err) {
      console.log(err);
    } else if (event) {
      res.render('editEvent', {
        title: 'Edit Event',
        event
      });
    }
  });
};

exports.postUpdateEvent = (req, res, next) => {
  const { id } = (req.params);
  const obj = req.body;
  Event.findById({ _id: id }, (err, event) => {
    if (err) {
      console.log(err);
    } else if (event) {
      event.CheckIn = obj.CheckIn;
      event.CheckOut = obj.CheckOut;
      event.Guests = obj.Guests;
      event.save((err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/eventDatabase');
      });
    }
  });
};

exports.postGetReportEvent = (req, res, next) => {
  const { id } = (req.params);
  Event.findById({ _id: id }, (err, event) => {
    if (err) {
      console.log(err);
    } else if (event) {
      const html = `
                    <style>
                    table{
                        border-collapse: collapse;
                        margin-top: 30px;
                        margin-left: 70px;
                        margin-right: 30px;
                    }
                    .heading{
                        font-weight: bold;
                        width: 150px;
                    }
                    .value{
                        width: 500px;
                    }
                    </style>
                    <div style="margin-top: 50px">
                      <h1 style="margin-left: 70px;">Booking Information</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <table border="1">
                        <tr>
                          <td class="heading">Check In</td>
                          <td class="value">${event.CheckIn}</td>
                        </tr>
                        <tr>
                          <td class="heading">Check Out</td>
                          <td class="value">${event.CheckOut}</td>
                        </tr>
                        <tr>
                          <td class="heading">Number Of Guests</td>
                          <td class="value">${event.Guests}</td>
                        </tr>
                      </table>
                  </div>
          `;
      const pdfFilePath = './event.pdf';
      const options = { format: 'Letter' };
      pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
        if (err) {
          console.log(err);
          res.status(500).send('Some kind of error...');
          return;
        }
        fs.readFile(pdfFilePath, (err, data) => {
          res.contentType('application/pdf');
          res.send(data);
        });
      });
    }
  });
};

const ITEMS_PER_PAGE1 = 10;
exports.postDeletePageEvent = (req, res, next) => {
  const { page } = (req.params) || 1;
  let totalItem;
  let status = true;
  Event.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Event.find({})
        .skip((page - 1) * ITEMS_PER_PAGE1)
        .limit(ITEMS_PER_PAGE1);
    }).then((events) => {
      events.forEach((event) => {
        Event.findOneAndDelete({ _id: event.id }, (err) => {
          if (err) {
            console.log(err);
          } else {
            status = true;
          }
        });
      });
    });
  if (status) {
    if (page === '1') {
      return res.redirect('/eventDatabase/?page=1');
    }
    return res.redirect(`/eventDatabase/?page=${page - 1}`);
  }
};

const ITEMS_PER_PAGE = 10;
exports.postSavePageEvent = (req, res, next) => {
  const { page } = (req.params) || 1;
  let totalItem;
  Event.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Event.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((events) => {
      jade.renderFile('views/testEvent.pug', { eventsReceived: events }, (err, html) => {
        const pdfFilePath = './events.pdf';
        const options = { format: 'Letter' };
        pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
          if (err) {
            console.log(err);
            res.status(500).send('Some kind of error...');
            return;
          }
          fs.readFile(pdfFilePath, (err, data) => {
            res.contentType('application/pdf');
            res.send(data);
          });
        });
      });
    });
};

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const Contact = require('../models/Contact');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: 'youremail',
         pass: 'yourpassword'
     }
 });

exports.postSendEmailEvent = (req, res, next) => {
  const { id } = (req.params);
  res.render('send-email-event', {
    title: 'Send Email',
    id
  });
};

exports.postEmailEvent = (req, res, next) => {
  const { id } = (req.params);
  const { name } = req.body;
  const recipientEmail = req.body.emailAddress;
  const { postMessage } = req.body;
  Event.findById({ _id: id }, (err, event) => {
    if (err) {
      console.log(err);
    } else if (event) {
        const html = `
                    <style>
                    table{
                        border-collapse: collapse;
                        margin-top: 30px;
                        margin-left: 70px;
                        margin-right: 30px;
                    }
                    .heading{
                        font-weight: bold;
                        width: 150px;
                    }
                    .value{
                        width: 500px;
                    }
                    </style>
                    <div style="margin-top: 50px">
                      <h1 style="margin-left: 70px;">Booking Information</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <table border="1">
                        <tr>
                          <td class="heading">Check In</td>
                          <td class="value">${event.CheckIn}</td>
                        </tr>
                        <tr>
                          <td class="heading">Check Out</td>
                          <td class="value">${event.CheckOut}</td>
                        </tr>
                        <tr>
                          <td class="heading">Number Of Guests</td>
                          <td class="value">${event.Guests}</td>
                        </tr>
                      </table>
                  </div>
          `;
      const pdfFilePath = './event.pdf';
      const options = { format: 'Letter' };
      pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
        if (err) {
          console.log(err);
          res.status(500).send('Some kind of error...');
          return;
        }
        fs.readFile(pdfFilePath, (err, data) => {
          transporter.sendMail({
            to: recipientEmail,
            from: name,
            subject: 'Event Information',
            html: postMessage,
            attachments: [{
              filename: 'event.pdf',
              content: data,
              type: 'application/pdf',
              disposition: 'attachment',
              contentId: 'myId'
            }],
          });
        });
      });
    }
  });
  res.render('send-email-event', {
    title: 'Send Email',
    id
  });
};

exports.postSendEmailPageContact = (req, res, next) => {
  const { page } = (req.params);
  res.render('send-email-page-event', {
    title: 'Email Page',
    page
  });
};

exports.postEmailPageEvent = (req, res, next) => {
  const { page } = (req.params) || 1;
  const { name } = req.body;
  const recipientEmail = req.body.emailAddress;
  const { postMessage } = req.body;
  let totalItem;
  Event.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Event.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((events) => {
      jade.renderFile('views/testEvent.pug', { eventsReceived: events }, (err, html) => {
        const pdfFilePath = './events.pdf';
        const options = { format: 'Letter' };
        pdf.create(html, options).toFile(pdfFilePath, (err, res2) => {
          if (err) {
            console.log(err);
            res.status(500).send('Some kind of error...');
            return;
          }
          fs.readFile(pdfFilePath, (err, data) => {
            transporter.sendMail({
              to: recipientEmail,
              from: name,
              subject: 'Event Page Information',
              html: postMessage,
              attachments: [{
                filename: 'events.pdf',
                content: data,
                type: 'application/pdf',
                disposition: 'attachment',
                contentId: 'myId'
              }],
            });
          });
        });
      });
    });
  res.render('send-email-page-event', {
    title: 'Email Page',
    page
  });
};
