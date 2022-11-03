## Description

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Install pgcrypto extension in docker

```shell
$ docker exec -it <container-name> psql -U <db-user> -W <db-name>
```

After above command: 

```postgresql
CREATE EXTENSION pgcrypto;
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Alvin Ahmadov](https://github.com/alvinahmadov)
- Telegram - [@alvinahmadov](https://t.me/AlvinAhmadov)

## License

Nest is [MIT licensed](LICENSE.md).
