import {
	Namespace,
	Server,
	ServerOptions
}                                      from 'socket.io';
import { createClient }                from 'redis';
import { IoAdapter }                   from '@nestjs/platform-socket.io';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';
import env                             from '@config/env';

export default class RedisIoAdapter
	extends IoAdapter {
	private adapterConstructor: (nsp: Namespace) => RedisAdapter;

	public async connectToRedis(): Promise<void> {
		const pubClient = createClient({ url: `redis://${env.redis.host}:${env.redis.port}` });
		const subClient = pubClient.duplicate();

		pubClient.on('error', (err) => console.error('Redis pubClient error: ', err));
		subClient.on('error', (err) => console.error('Redis subClient error: ', err));

		await Promise.all([pubClient.connect(), subClient.connect()]);
		this.adapterConstructor = createAdapter(pubClient, subClient);
	}

	public override createIOServer(port: number, options?: ServerOptions): Server {
		const server: Server = super.createIOServer(port, options);
		console.log('RedisIoAdapter created on', port);
		return server.adapter(this.adapterConstructor);
	}
}
