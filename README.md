# YYT - Task Manager/Visualizer

SQLite based task manager with CLI and Web interfaces, plain text exports, and
task dependency/timeline visualization. Uses TypeScript, TAP, and Yarn in
development.

## Installation
```
npm run build
```
## Examples

### CLI
```
$ node built/yyt.js add "Feed the birds"
$ node built/yyt.js add "Take out the trash"
$ node built/yyt.js ls
1 : Feed the birds
$ node built/yyt.js do 1
```
### Server
```
npm run server
```
## Dependencies
```
yarn
```
### npm live
```
body-parser
chalk
express
express-session
handlebars
passport
passport-local
session-file-store
sqlite3
uuid
yargs
```
### npm dev
```
typescript
nodemon
tap
```
## MIT License

https://mit-license.org/
