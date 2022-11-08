import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { IImage }                    from '@common/interfaces';
import { transformToImage }          from '@common/utils/compat/transformer-functions';

@Injectable()
export default class ImagePipe
	implements PipeTransform {
	transform(data: any): IImage {
		return !env.api.compatMode ? data : transformToImage(data);
	}
}
