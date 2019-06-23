/**
 * GET /
 * Home page.
 */
// const nodemailer = require("nodemailer");
const Contact = require('../models/Contact');

const ITEMS_PER_PAGE = 10;
exports.getContactDatabase = (req, res) => {
  const page = +req.query.page || 1;
  let totalItem;
  Contact.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Contact.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((contacts) => {
      res.render('contactDatabase', {
        title: ' contactDatabase',
        contacts,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItem,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
      });
    });
};
