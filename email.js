/*
 * email.js : script to send a email from a Gmail Account to
 * targetted audience using node-mailer
 */
var nodemailer    = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "yourappname@gmail.com",
        pass: "yourapppassword"
    }
});

exports.sendEmail = function (data, cb) {
    var mailOptions = {
        from                 : data.from,
        replyTo              : data.replyTo,
        to                   : data.to,
        subject              : data.subject,
        html                 : data.html,
        generateTextFromHTML : true
    };
    smtpTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.info('helper : email, sendEmail, error : ' + err);
            cb (err, null);
        } else {
            console.info('helper : email, sendEmail, success : message : '
                + JSON.stringify(res));
            cb (null, true);
        }
        smtpTransport.close();
    });
};

/*
 * Sample Code to run this helper
 * To-Do : // you need to enable low trusted apps in gmail security settings of 
 * your gmail account here : 
 * https://www.google.com/settings/security/lesssecureapps?hl=en

    var email  = require('./email.js');

    var emailData = {
        from: "yourappname@gmail.com", // sender address
        to: "targetperson@gmail.com",
        replyTo: 'Your App Name <yourappname@gmail.com>',
        subject: 'Your e-mail subject', // Subject line
        html: '<b>Hello,</b><br> this is a test mail from YourAppName' // html body
    };

    email.sendEmail(emailData, function (err, sent) {
        if (err) console.log(err);
        else if (sent) console.log('email successfully sent');
    });
 */