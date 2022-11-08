import {
	IImage,
	IRepository,
	IRepositoryOptions
}                        from '@common/interfaces';
import { Image }         from '@models/index';
import GenericRepository from './generic';

export default class ImageRepository
	extends GenericRepository<Image, IImage>
	implements IRepository {
	protected override readonly model = Image;

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(ImageRepository.name);
	}
}
