import { Hono } from 'hono'
import { userRouter } from './router/user';
import { blogRouter } from './router/blog';

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app