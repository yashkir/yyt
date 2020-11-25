import { IUserRecord } from '../../../src/db/users'

declare global {
    namespace Express {
        export interface User extends IUserRecord {}
    }
}
