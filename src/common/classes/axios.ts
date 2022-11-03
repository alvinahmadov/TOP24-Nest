import axios,
{ AxiosRequestConfig, AxiosResponse } from 'axios';

export class AxiosStatic {
	private static setConfig(config?: AxiosRequestConfig) {
		if(config === undefined)
			config = { headers: { 'Content-Type': 'application/json' } };
		else {
			if(!('Content-Type' in config.headers))
				config.headers = { 'Content-Type': 'application/json' };
		}
		return config;
	}

	static async post<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);
		const { data: result } = await axios.request<T, AxiosResponse<T>, D>(
			{
				data,
				url:    path,
				method: 'post',
				...config
			}
		);
		return result;
	}

	static async get<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);
		const { data: result } = await axios.request<T>(
			{
				data,
				url:    path,
				method: 'get',
				...config
			}
		);
		return result;
	}

	static async put<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);
		const { data: result } = await axios.request<T>(
			{
				data,
				url:    path,
				method: 'put',
				...config
			}
		);
		return result;
	}

	static async patch<T = any, D = any>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);
		const { data: result } = await axios.request<T>(
			{
				data,
				url:    path,
				method: 'patch',
				...config
			}
		);
		return result;
	}

	static async delete<T = any>(
		path: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		config = AxiosStatic.setConfig(config);
		const { data: result } = await axios.request<T>(
			{
				url:    path,
				method: 'delete',
				...config
			}
		);
		return result;
	}
}

export class Axios {
	public async post<T, D = any>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.post<T, D>(url, data, config);
	}

	public async get<T, D = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.get<T, D>(url, undefined, config);
	}

	public async put<T, D = any>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.put<T, D>(url, data, config);
	}

	public async patch<T, D = any>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.patch<T, D>(url, data, config);
	}

	public async delete<T>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		return AxiosStatic.delete<T>(url, config);
	}
}
