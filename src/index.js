const Koa = require('koa');
const app = new Koa();

// Response
app.use((ctx) => {
	ctx.body = 'Hello Koa';
});

app.listen(3000);
