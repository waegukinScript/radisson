// const nodemailer = require("nodemailer");
const fs = require('fs');
const pdf = require('html-pdf');
const jade = require('jade');

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  const unknownUser = !req.user;

  res.render('home', {
    title: 'Contact',
    unknownUser
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res, next) => {
  console.log('req.body.contactName', req.body.contactName);
  console.log('req.body.emailAddress', req.body.emailAddress);
  console.log('req.body.phoneNumber', req.body.phoneNumber);
  console.log('req.body.postMessage', req.body.postMessage);


  const contact = new Contact({
    contactName: req.body.contactName,
    emailAddress: req.body.emailAddress,
    phoneNumber: req.body.phoneNumber,
    postMessage: req.body.postMessage
  });

  contact.save((err) => {
    if (err) { return next(err); }
    res.redirect('/contact');
  });
  // let fromName;
  // let fromEmail;
  // if (!req.user) {
  //   req.assert('name', 'Name cannot be blank').notEmpty();
  //   req.assert('email', 'Email is not valid').isEmail();
  // }
  // req.assert('message', 'Message cannot be blank').notEmpty();
  // const errors = req.validationErrors();
  // if (errors) {
  //   req.flash('errors', errors);
  //   return res.redirect('/contact');
  // }
  // if (!req.user) {
  //   fromName = req.body.name;
  //   fromEmail = req.body.email;
  // } else {
  //   fromName = req.user.profile.name || '';
  //   fromEmail = req.user.email;
  // }
  // let transporter = nodemailer.createTransport({
  //   service: 'SendGrid',
  //   auth: {
  //     user: process.env.SENDGRID_USER,
  //     pass: process.env.SENDGRID_PASSWORD
  //   }
  // });
  // const mailOptions = {
  //   to: 'your@email.com',
  //   from: `${fromName} <${fromEmail}>`,
  //   subject: 'Contact Form | Hackathon Starter',
  //   text: req.body.message
  // };
  // return transporter.sendMail(mailOptions)
  //   .then(() => {
  //     req.flash('success', { msg: 'Email has been sent successfully!' });
  //     res.redirect('/contact');
  //   })
  //   .catch((err) => {
  //     if (err.message === 'self signed certificate in certificate chain') {
  //       console.log('WARNING: Self signed certificate in certificate chain.
  // Retrying with the self signed certif
  // icate. Use a valid certificate if in production.');
  //       transporter = nodemailer.createTransport({
  //         service: 'SendGrid',
  //         auth: {
  //           user: process.env.SENDGRID_USER,
  //           pass: process.env.SENDGRID_PASSWORD
  //         },
  //         tls: {
  //           rejectUnauthorized: false
  //         }
  //       });
  //       return transporter.sendMail(mailOptions);
  //     }
  //     console.log('ERROR: Could not send contact email after security downgrade.\n', err);
  //     req.flash('errors', { msg: 'Error sending the message. Please try again shortly.' });
  //     return false;
  //   })
  //   .then((result) => {
  //     if (result) {
  //       req.flash('success', { msg: 'Email has been sent successfully!' });
  //       return res.redirect('/contact');
  //     }
  //   })
  //   .catch((err) => {
  //     console.log('ERROR: Could not send contact email.\n', err);
  //     req.flash('errors', { msg: 'Error sending the message. Please try again shortly.' });
  //     return res.redirect('/contact');
  //   });
};

exports.postDeleteContact = (req, res, next) => {
  const { id } = req.params;
  Contact.findOneAndDelete({ _id: id }, (err) => {
    if (err) {
      console.log(err);
    } else {
      return res.redirect('back');
    }
  });
};

exports.postEditContact = (req, res, next) => {
  const { id } = req.params;
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
      res.render('editContact', {
        title: 'Edit Event',
        contact
      });
    }
  });
};

exports.postUpdateContact = (req, res, next) => {
  const { id } = (req.params);
  const obj = req.body;
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
      contact.contactName = obj.contactName;
      contact.emailAddress = obj.emailAddress;
      contact.phoneNumber = obj.phoneNumber;
      contact.postMessage = obj.postMessage;
      contact.save((err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/contactDatabase');
      });
    }
  });
};

exports.postGetReportContact = (req, res, next) => {
  const { id } = (req.params);
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
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
                      <h1 style="margin-left: 70px;">Contacts</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <table border="1">
                        <tr>
                          <td class="heading">Contact Name</td>
                          <td class="value">${contact.contactName}</td>
                        </tr>
                        <tr>
                          <td class="heading">Email Address</td>
                          <td class="value">${contact.emailAddress}</td>
                        </tr>
                        <tr>
                          <td class="heading">Phone Number</td>
                          <td class="value">${contact.phoneNumber}</td>
                        </tr>
                        <tr>
                          <td class="heading">Post Message</td>
                          <td class="value">${contact.postMessage}</td>
                        </tr>
                        <tr>
                          <td class="heading">Date Entered</td>
                          <td class="value">${contact.createdAt}</td>
                        </tr>
                      </table>
                  </div>
          `;
      const pdfFilePath = './contact.pdf';
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
exports.postDeletePageContact = (req, res, next) => {
  const { page } = (req.params) || 1;
  let totalItem;
  let status = true;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE1)
        .limit(ITEMS_PER_PAGE1);
    }).then((contacts) => {
      contacts.forEach((contact) => {
        Contact.findOneAndDelete({ _id: contact.id }, (err) => {
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
      return res.redirect('/contactDatabase/?page=1');
    }
    return res.redirect(`/contactDatabase/?page=${page - 1}`);
  }
};

const ITEMS_PER_PAGE = 10;
exports.postSavePageContact = (req, res, next) => {
  const { page } = (req.params) || 1;
  let totalItem;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((contacts) => {
      jade.renderFile('views/testContact.pug', { contactsReceived: contacts }, (err, html) => {
        const pdfFilePath = './contacts.pdf';
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


exports.postSendEmailContact = (req, res, next) => {
  const { id } = (req.params);
  res.render('send-email-contact', {
    title: 'Send Email',
    id
  });
};

exports.postEmailContact = (req, res, next) => {
  const { id } = (req.params);
  const  name  = req.body.name;
  const  recipientEmail  = req.body.emailAddress;
  const  postMessage  = req.body.postMessage;
  Contact.findById({ _id: id }, (err, contact) => {
    if (err) {
      console.log(err);
    } else if (contact) {
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
                      <h1 style="margin-left: 70px;">Contacts</h1>
                      <hr style=" margin-top:0px; height:10px;border:none;color:#333;background-color:#333; margin-left: 70px; margin-right: 73px;" />
                      <table border="1">
                        <tr>
                          <td class="heading">Contact Name</td>
                          <td class="value">${contact.contactName}</td>
                        </tr>
                        <tr>
                          <td class="heading">Email Address</td>
                          <td class="value">${contact.emailAddress}</td>
                        </tr>
                        <tr>
                          <td class="heading">Phone Number</td>
                          <td class="value">${contact.phoneNumber}</td>
                        </tr>
                        <tr>
                          <td class="heading">Post Message</td>
                          <td class="value">${contact.postMessage}</td>
                        </tr>
                        <tr>
                          <td class="heading">Date Entered</td>
                          <td class="value">${contact.createdAt}</td>
                        </tr>
                      </table>
                  </div>
          `;
      const pdfFilePath = './contact.pdf';
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
            subject: 'Contact Information',
            html: postMessage,
            attachments: [{
              filename: 'contact.pdf',
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
  res.render('send-email-contact', {
    title: 'Send Email',
    id
  });
  // transporter.sendMail({
  //   to: 'ammarshabbir007@gmail.com',
  //   from: 'MailRoomNS1',
  //   subject: 'We Received Your Parcel',
  //   html: 'Working',
  //   files     : [{filename: 'Report.pdf', content: data}],
  // });
  // res.send(`Working${id}`);
  // res.send(`Working${id}${name}${recipientEmail}${postMessage}`);
};

exports.postSendEmailPageContact = (req, res, next) => {
  const { page } = (req.params);
  res.render('send-email-page-contact', {
    title: 'Email Page',
    page
  });
};

exports.postEmailPageContact = (req, res, next) => {
  const { page } = (req.params) || 1;
  const  name  = req.body.name;
  const  recipientEmail  = req.body.emailAddress;
  const  postMessage  = req.body.postMessage;
  let totalItem;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((contacts) => {
      jade.renderFile('views/testContact.pug', { contactsReceived: contacts }, (err, html) => {
        const pdfFilePath = './contacts.pdf';
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
              subject: 'Contact Page Information',
              html: postMessage,
              attachments: [{
                filename: 'contacts.pdf',
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
  res.render('send-email-page-contact', {
    title: 'Email Page',
    page
  });
  // res.send(`Working${page}${name}${recipientEmail}${postMessage}`);
};
