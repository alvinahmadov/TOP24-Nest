import { Options as CsvOptions } from 'csv-parser';
import {
	js as beautify,
	JSBeautifyOptions
}                   from 'js-beautify';
import { IAddress } from '@common/interfaces';

const { createReadStream, writeFileSync } = require('fs');
const { join } = require('path');
const csv = require('csv-parser');
const relpath = '../../..';

interface IAddressData
	extends IAddress {
	population?: string;
	foundation_year?: string;
	created_at?: Date;
	updated_at?: Date;
}

const filepath = join(__dirname + `${relpath}/resources/kladr/address.csv`);
const output = join(__dirname + `${relpath}/db/seeders/seeds/addressSeed.js`);
const results: string[] = [];

const options: CsvOptions = {
	mapHeaders: ({ header }: any) =>
	            {
		            header = header.trim();
		            if(header === 'geo_lat') header = 'latitude';
		            if(header === 'geo_lon') header = 'longitude';

		            return header;
	            },
	mapValues:  ({ header, value }: any) =>
	            {
		            value = value.trim();

		            if(
			            header === 'geo_lat' ||
			            header === 'latitude' ||
			            header === 'geo_lon' ||
			            header === 'longitude'
		            )
			            value = Number(value);

		            return value;
	            },
	separator:  '|'
};
const beautifyOptions: JSBeautifyOptions = {
	brace_style:            'expand',
	operator_position:      'after-newline',
	keep_array_indentation: true,
	unescape_strings:       true
};

createReadStream(filepath)
	.pipe(csv(options))
	.on('data', (data: IAddressData) =>
	{
		data.created_at = new Date();
		data.updated_at = new Date();
		if(data.regionType === 'г') {
			data.cityType = data.regionType;
			data.city = data.region;
			data.regionType = '';
			data.region = '';
		}
		const {
			value,
			population,
			foundation_year,
			createdAt,
			updatedAt,
			...addressData
		} = data;
		results.push(JSON.stringify(addressData));
	})
	.on('end', () =>
		writeFileSync(
			output,
			beautify(
				`
		\nconst addressSeed = [\n${results.join(',')}\n];
		\n\nmodule.exports = { addressSeed };
		`,
				beautifyOptions
			)
		)
	);
