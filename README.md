![Yello Yolk Tasker](public/images/egg-small.png)

# Yellow Yolk Tasks (YYT)

This is a task/goal manager built using SQLite and Node.js. The server uses
the Express framework with Handlebars for templating. In the future I aim to
provide easy import/export of todo.txt files and visualization of your tasks.

This project is still in early prototyping, so use at your own risk.

## Installation
```
yarn build
```

## Examples

### CLI
```
$ node built/yyt.js add "My Task"
$ node built/yyt.js ls
1 : My Task
$ node built/yyt.js do 1
```
### Server
```
npm run server
```
Go to localhost:8080 and enjoy. I may put up a live demo at
http://yuriyyashkir.com/ in the future.

## Dependencies
```
nodejs
yarn
```
## MIT License

https://mit-license.org/
