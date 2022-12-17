import * as ex    from 'express';
import { Socket } from 'socket.io';

function getHandshakeAuth(handshakeData: { [key: string]: any }): string {
	if('authorization' in handshakeData || 'Authorization' in handshakeData)
		return handshakeData['authorization'] || handshakeData['Authorization'] as string;
	return undefined;
}

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
	let authHeader = getHandshakeAuth(client.handshake.auth) ||
	                 getHandshakeAuth(client.handshake.headers);

	if(authHeader) {
		return authHeader.split(' ').length > 1
		       ? authHeader.split(' ')[1].trim()
		       : authHeader;
	}
	return '';
}
