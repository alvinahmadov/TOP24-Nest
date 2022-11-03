import { Response } from 'express';

export default abstract class BaseController {
	public abstract index(...args: any[]): Promise<Response>;

	public abstract list(...args: any[]): Promise<Response>;

	public abstract filter(...args: any[]): Promise<Response>;

	public abstract create(...args: any[]): Promise<Response>;

	public abstract update(...args: any[]): Promise<Response>;

	public abstract delete(...args: any[]): Promise<Response>;
}

export class StaticController
	extends BaseController {
	public async index(): Promise<Response> {
		return Promise.resolve(undefined);
	}

	public async list() {
		return Promise.resolve(undefined);
	}

	public async filter(): Promise<Response> {
		return Promise.resolve(undefined);
	}

	public async create(): Promise<Response> {
		return Promise.resolve(undefined);
	}

	public async update(): Promise<Response> {
		return Promise.resolve(undefined);
	}

	public async delete(): Promise<Response> {
		return Promise.resolve(undefined);
	}
}
