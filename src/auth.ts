import { Router, Request, Response, NextFunction } from 'express';
import passport = require('passport');

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

export function authenticateAndLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            return res.render('error', {error: info.message});
        }
        if (err)  { return next(err); }
        if (!user){ return res.redirect('/login/') }
        req.login(user, (err) => {
            if (err)  { return next(err); }
            req.session.filter = '';
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
