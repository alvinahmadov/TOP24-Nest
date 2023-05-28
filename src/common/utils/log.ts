import * as pj                 from 'prettyjson';
import { ConsoleLogger }       from '@nestjs/common';
import { TRenderColorOptions } from '@common/interfaces';

/**@ignore*/
type TRendererOptionsKeys = 'dashColor' |
							'keysColor' |
							'stringColor' |
							'numberColor';

/**@ignore*/
type TRenderOptions = Omit<pj.RendererOptions, TRendererOptionsKeys> &
					  {
						  stringColor?: TRenderColorOptions;
						  keysColor?: TRenderColorOptions;
						  numberColor?: TRenderColorOptions;
						  dashColor?: TRenderColorOptions;
					  }

export class CustomLogger extends ConsoleLogger {
	public static readonly rendererOptions: TRenderOptions = {
		inlineArrays:       true,
		noAlign:            true,
		defaultIndentation: 2,
		stringColor:        'yellow',
		keysColor:          'blue',
		numberColor:        'green',
		dashColor:          'grey'
	};

	private static prettify(...optionalParams: any[]) {
		if(optionalParams) {
			if(optionalParams.length <= 1) {
				return optionalParams;
			}
			else if(optionalParams.length > 1) {
				if(typeof optionalParams[optionalParams.length - 1] === 'string') {
					const optMessage = optionalParams.pop();
					return [
						pj.render(optionalParams, CustomLogger.rendererOptions),
						optMessage
					];
				}
			}
		}
		return [];
	}

	public override debug(
		message: any,
		...optionalParams: any[]
	): void {
		return super.debug(message, ...CustomLogger.prettify(...optionalParams));
	}

	public override error(
		message: any,
		...optionalParams: any[]
	): void {
		return super.error(message, ...CustomLogger.prettify(...optionalParams));
	}

	public override log(
		message: any,
		...optionalParams: any[]
	): void {
		return super.log(message, ...CustomLogger.prettify(...optionalParams));
	}

	public override verbose(
		message: any,
		...optionalParams: any[]
	): void {
		return super.verbose(message, ...CustomLogger.prettify(...optionalParams));
	}

	public override warn(
		message: any,
		...optionalParams: any[]
	): void {
		return super.warn(message, ...CustomLogger.prettify(...optionalParams));
	}
}
