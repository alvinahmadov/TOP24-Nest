import { writeFileSync } from 'fs';
import modelsJson        from './models.json';
import crmEnums          from '../../src/config/json/crm_enums.json';

type ModelResult = { MODELS: ({ ID?: string, VALUE?: string, BRAND_ID?: string })[] }

const crmBrands = crmEnums.CRM.TRANSPORT.BRANDS;
const crmModels = crmEnums.CRM.TRANSPORT.MODELS;
const models: { [key: string]: string[] } = modelsJson;

let result: ModelResult = { MODELS: [] };
crmBrands.map(({ ID: brandId, VALUE: brandName }) =>
              {
	              if(brandName in models) {
		              const modelNames = models[brandName];
		              modelNames.forEach((modelName: string) =>
		                                 {
			                                 const model = crmModels.find(({ VALUE }) => VALUE === modelName);
			                                 if(model)
				                                 result['MODELS'].push({ ID: model.ID, VALUE: modelName, BRAND_ID: brandId });
		                                 });
	              }
              });
writeFileSync('../../result.json', JSON.stringify(result));
