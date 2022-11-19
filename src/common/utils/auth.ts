import * as ex    from 'express';
import { Socket } from 'socket.io';

export function requestAuthExtractor(req: ex.Request): string {
	let authHeader = req.header('authorization') || req.header('Authorization');

	if(authHeader) {
		return authHeader.split(' ').length > 1
		       ? authHeader.split(' ')[1].trim()
		       : authHeader;
	}
	return '';
}

export function socketAuthExtractor(client: Socket) {
	let authHeader = client.handshake.headers['authorization'] ||
	                 client.handshake.headers['Authorization'] as string;

	if(authHeader) {
		return authHeader.split(' ').length > 1
		       ? authHeader.split(' ')[1].trim()
		       : authHeader;
	}
	return '';
}
