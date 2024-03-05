import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';
import { signinInput, signupInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

userRouter.post('/signup',async(c) => {
        const body = await c.req.json();
        const { success } = signupInput.safeParse(body);
        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs are not correct"
            })
        }
        const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    try {
        const user = await prisma.user.create({
        data: {
            email: body.email,
            password: body.password,
            name: body.name
        }
        })
        const jwt = await sign({
        id: user.id
        }, c.env.JWT_SECRET);
        console.log([user, jwt]);
        return c.text('User created sucessfully');
    } catch (error) {
        console.log(error);
        c.status(403);
        return c.text('User already exits with this email');
    }
});

userRouter.post('/signin',async(c) => {
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs are not correct"
            })
        }
        const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    try {
        const user = await prisma.user.findFirst({
        where: {
            email: body.email,
            password: body.password,
        }
        });
        if(!user) {
        c.status(403);// unauthorized status code
        return c.json({
            messange: "Incorrect credentials"
        });
        }
        const jwt = await sign({
        id: user.id
        }, c.env.JWT_SECRET);
        console.log([user, jwt]);
        return c.text("Welcome!!");
    } catch (error) {
        c.status(403);
        return c.text('User already exits with this email');
    }
});