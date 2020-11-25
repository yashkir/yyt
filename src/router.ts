import { Router, Request, Response, NextFunction } from 'express';
import * as passport from 'passport';
import * as backend from './db/backend';
import * as users from './db/users';
import { makeUserAndTable, deleteUserAndDropTable } from './db/helpers';
import { authenticateAndLogin, ensureAuthenticated } from './auth';

export const router = Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login', {session: req.session, title: 'Login'});
});

router.get('/login/guest', (req, res, next) => {
    const newUser: users.IUserRecord = {
        id: null,
        username: `Guest-${req.session.id}`.replace(/-/g,'_'),
        email: null,
        password: 'password',
        isGuest: true,
    };
    req.body.username = newUser.username;
    req.body.password = 'password';

    users.getUserByUsername(newUser.username, (err, user) => {
        if (user) {
            authenticateAndLogin(req, res, next);
        } else {
            makeUserAndTable(newUser, (err) => {
                if (err) {
                    return next(err)
                }
                else {
                    console.log(`Created ${newUser.username} with password: password`);
                    authenticateAndLogin(req, res, next);
                }
            });
        }
    });
});

router.post('/login', authenticateAndLogin);

router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.username = null;
    req.session.save((err) => {
        if (err) { console.log(err); }
        res.redirect('/');
    });
});

router.get('/manage', ensureAuthenticated, (req, res, next) => {
    const user = req.user as users.IUserRecord;
    users.getUserById(user.id as unknown as string, (err, user) => { //TODO change getUserById param to number
        if(err) { next(err); }

        res.render('manage', {session: req.session, user: user});
    })
});

router.get('/manage/delete', ensureAuthenticated, (req, res) => {
    res.render('delete');
});

router.post('/manage/delete', ensureAuthenticated, (req, res) => {
    console.log(req.user);
    if (req.body.username === req.session.username) {
        deleteUserAndDropTable(req.session.username);
        res.redirect('/logout');
    } else {
        res.render('message', { body: "Username did not match, deletion aborted." });
    }
});

router.post('/register', (req, res, next) => {
    if (req.body.password != req.body.password2) {
        next(new Error("Passwords do not match."));
    }
    let user: users.IUserRecord  = {
        id:       null,
        username: req.body.username,
        email:    req.body.email,
        password: req.body.password,
    };
    makeUserAndTable(user, (err) => {
        if (err) { return next(err) };
        res.render('message', { body: "Created User." });
    });
});

router.get('/register', (req, res) => {
    return res.render('register', {session: req.session, title: 'Register'});
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
        if (req.session.hideDone) {
            tasks = tasks.filter(task => !task.isDone)
        }
        res.render('tasks', {session: req.session, title: 'Tasks', tasks: tasks});
    }, req.session.filter || '');
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

router.get('/tasks/filter', (req, res) => {
    let filter = req.query['filter_text'] as string;
    
    req.session.filter = filter;
    req.session.save( (err) => {
        if (err) {
            res.render('error', { error: err });
        } else {
            res.redirect('..');
        }
    });
});

router.get('/tasks/download', (req, res, next) => {
    // TODO move auth check out
    if (!req.user) {
        return res.redirect('/login');
    }

    let username = req.session.username; backend.export_todotxt(username, (text) => {
        const fileData = text;
        const fileName = `${username}_todo.txt`;
        const fileType = 'text/plain';

        res.writeHead(200, {
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Type': fileType,
        })

        const download = Buffer.from(fileData);
        res.end(download);
    });
});

router.get('/tasks/hidedone', (req, res, next) => {
    req.session.hideDone = !req.session.hideDone;
    req.session.save((err) => res.redirect('../')); //TODO ignoring error here
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
