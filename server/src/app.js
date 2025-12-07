import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import passport from '~/config/passport';
import routes from '~/routes/v1';
import error from '~/middlewares/error';
import rateLimiter from '~/middlewares/rateLimiter';
import config from '~/config/config';
import morgan from '~/config/morgan';

const app = express();

if (config.NODE_ENV !== 'test') {
	app.use(morgan);
}

// CORS - Allow all origins (for development)
app.use(cors({
	origin: true, // Allow all origins (returns the origin in Access-Control-Allow-Origin)
	credentials: true, // Allow credentials (cookies, authorization headers)
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
	exposedHeaders: ['Authorization']
}));

app.use(helmet({
	// Adjust helmet for CORS
	crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(rateLimiter);
app.use(passport.initialize());
app.use(express.static('public'));
app.use('/api/v1', routes);
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

export default app;
