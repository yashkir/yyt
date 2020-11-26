import { Router, Request, Response, NextFunction } from 'express';
import * as passport from 'passport';
import * as backend from './db/backend';
import * as users from './db/users';
import { makeUserAndTable, deleteUserAndDropTable } from './db/helpers';
import { authenticateAndLogin, ensureAuthenticated } from './auth';
import { GUEST_PREFIX, GUEST_SAMPLE_TODO,
         REGISTER_MAX_PER_IP, REGISTER_MAX_TIMEOUT } from './config';

export const router = Router();

let IPdata: Map<string, {resetTime: number, attempts: number}> = new Map();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login', {title: 'Login'});
});

router.get('/login/guest', (req, res, next) => {
    const newUser: users.IUserRecord = {
        id: null,
        username: `${GUEST_PREFIX}${req.session.id}`.replace(/-/g,'_'),
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
                    /* We don't pass a callback to the import, I am assuming
                     * that the serialized calls in .import_todotxt always finish
                     * before the next db calls. TODO take a look at the timing */
                    backend.import_todotxt(newUser.username, GUEST_SAMPLE_TODO);
                    authenticateAndLogin(req, res, next);
                }
            });
        }
    });
});

router.post('/login', authenticateAndLogin);

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/manage', ensureAuthenticated, (req, res, next) => {
    const user = req.user as users.IUserRecord;
    users.getUserById(user.id as unknown as string, (err, user) => { //TODO change getUserById param to number
        if(err) { next(err); }

        res.render('manage', {user: user});
    })
});

router.get('/manage/delete', ensureAuthenticated, (req, res) => {
    res.render('delete', {title: "Delete User"});
});

router.post('/manage/delete', ensureAuthenticated, (req, res) => {
    if (req.body.username === req.user.username) {
        deleteUserAndDropTable(req.user.username);
        res.redirect('/logout');
    } else {
        res.render('message', { body: "Username did not match, deletion aborted." });
    }
});

router.post('/register', (req, res, next) => {
    /* Only allow REGISTER_MAX_PER_IP attempts before REGISTER_MAX_TIMEOUT
     * time passes */
    if (!IPdata.has(req.ip)) {
        IPdata.set(req.ip, {
            resetTime: Date.now() + REGISTER_MAX_TIMEOUT,
            attempts: 1
        });
    } else {
        if (Date.now() > IPdata.get(req.ip).resetTime) {
            IPdata.delete(req.ip);
        } else {
            IPdata.get(req.ip).attempts += 1;
            if (IPdata.get(req.ip).attempts > REGISTER_MAX_PER_IP) {
                let wait = IPdata.get(req.ip).resetTime - Date.now();
                return res.render('error', { 
                    error: `Registration attempt limit for IP exceeded, wait ${wait / 1000} seconds.`
                });
            } 
        }
    }

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
    return res.render('register', {title: 'Register'});
});

router.get('/tasks', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render('error', {error: "Not Logged in!"});
    }

    backend.list(req.user.username, (err, tasks) => {
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
        backend.add(req.user.username, text, false, (err) => {
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

    let username = req.user.username;
    backend.export_todotxt(username, (text) => {
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

router.post('/tasks/upload', (req, res, next) => {
    let blob = req.files.upload.data.toString();
    backend.import_todotxt(req.user.username, blob, (err) => {
        if (err) { return next(err) };
        return res.redirect('../');
    });
});

router.get('/tasks/upload', (req, res, next) => {
    res.render('upload');
});

router.get('/tasks/hidedone', (req, res, next) => {
    req.session.hideDone = !req.session.hideDone;
    req.session.save((err) => res.redirect('../')); //TODO ignoring error here
});

router.get('/tasks/:taskId/done', (req, res) => {
    backend.done(req.user.username, parseInt(req.params.taskId), true, (err) => {
        res.redirect('..');
    });
});

router.get('/tasks/:taskId/delete', (req, res) => {
    backend.del(req.user.username, parseInt(req.params.taskId), (err) => {
        res.redirect('..');
    });
});
