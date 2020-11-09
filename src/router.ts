import express = require('express');
import passport = require('passport');
import backend = require('./db/backend');
import users = require('./db/users');
import bcrypt = require('bcrypt');

export const router = express.Router();

const saltRounds = 10;

router.get('/', (req, res) => {
    res.render('index', {session: req.session});
});

router.get('/login', (req, res) => {
    res.render('login', {session: req.session, title: 'Login'});
});

router.get('/login/guest', (req, res, next) => {
    let user: users.IUserRecord = {
        id: null,
        username: `Guest-${req.session.id}`.replace(/-/g,'_'),
        email: null,
        password: 'password',
    }
    make_user(user, (err) => {
        if (err) {
            return next(err)
        }
        else {
            //TODO make a better message
            console.log(`Created ${user.username}\npassword: password`);
            req.body.username = user.username;
            req.body.password = 'password';
            authenticateAndLogin(req, res, next);
        }
    });
    //TODO route to login
});

router.post('/login', authenticateAndLogin);

router.get('/logout', (req, res, next) => {
    req.logout(); //TODO session too
    req.session.username = null;
    req.session.save((err) => {
        if (err) { console.log(err); }
        res.redirect('/');
    });
});

router.get('/manage', (req, res, next) => {
    // TODO use passport.deserializeUser here?
    users.getUserById(req.session.passport.user, (err, user) => {
        if(err) { next(err); }

        res.render('manage', {session: req.session, user: user});
    })
});

router.post('/register', (req, res, next) => {
    //TODO check 2ndpassword
    //TODO check duplicate users
    //TODO create table
    if (req.body.password != req.body.password2) {
        return res.send("Passwords do not match.");
    }
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            res.render('error', {error: err});
        } else {
            let user: users.IUserRecord  = {
                id:       null,
                username: req.body.username,
                email:    req.body.email,
                password: hash,
            }
            users.addUser(user, (err) => {
                if (err) {
                    next(err);
                } else {
                    backend.create_table_for_user(user.username, (err) => {
                        if (err) {
                            res.render('error', {error: err});
                        } else {
                            res.send("success");
                        }
                    });
                }
            });
        }
    });
});

router.get('/register', (req, res) => {
    return res.render('register', {session: req.session, title: 'Register'});
});

//TODO remove, deprecated
router.get('/authtest', (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('error', {error: "Authenticated is TRUE"});
    } else {
        return res.render('error', {error: "Authenticated is FALSE"});
    }
});

router.get('/tasks', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render('error', {error: "Not Logged in!"});
    }
    backend.list(req.session.username, (err, tasks) => {
        if (err) {
            console.log(err);
            return res.render('error', {error: err})
        }
        res.render('tasks', {session: req.session, title: 'Tasks', tasks: tasks});
    });
});

router.get('/tasks/add', (req, res) => {
    let text = req.query['task_text'] as string;
    if (text.length > 0) {
        backend.add(req.session.username, text, false, (err) => {
            res.redirect('..');
        });
    } else {
        res.redirect('..');
    }
});

router.get('/tasks/:taskId/done', (req, res) => {
    backend.done(req.session.username, parseInt(req.params.taskId), true, (err) => {
        res.redirect('..');
    });
});

router.get('/tasks/:taskId/delete', (req, res) => {
    backend.del(req.session.username, parseInt(req.params.taskId), (err) => {
        res.redirect('..');
    });
});

//TODO move this out?
function make_user(user: users.IUserRecord, callback: (err: Error) => void) {
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
        if (err) {
            callback(err);
        } else {
            user.password = hash;
            users.addUser(user, (err) => {
                if (err) {
                    callback(err);
                } else {
                    backend.create_table_for_user(user.username, (err) => {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                }
            });
        }
    });
}

function authenticateAndLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            return res.render('error', {error: info.message});
        }
        if (err)  { return next(err); }
        if (!user){ return res.redirect('/login/') }
        req.login(user, (err) => {
            if (err)  { return next(err); }
            req.session.username = user.username;
            req.session.save(err => {
                if (err) {
                    next(err);
                } else {
                    res.redirect('/tasks/');
                }
            });
        });
    })(req, res, next);
}
