import { Router, Request, Response, NextFunction } from 'express';
import passport = require('passport');
import { URL_PREFIX } from './config';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated) {
        return next();
    } else {
        return res.redirect(URL_PREFIX + '/login/');
    }
}

export function authenticateAndLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            return res.render('error', {error: info.message});
        }
        if (err)  { return next(err); }
        if (!user){ return res.redirect(URL_PREFIX + '/login/') }
        req.login(user, (err) => {
            if (err)  { return next(err); }
            req.session.filter = '';
            req.session.save(err => {
                if (err) {
                    next(err);
                } else {
                    res.redirect(URL_PREFIX + '/tasks/');
                }
            });
        });
    })(req, res, next);
}
