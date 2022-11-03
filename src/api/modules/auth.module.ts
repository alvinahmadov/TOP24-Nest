import { Module }         from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule }      from '@nestjs/jwt';
import { JWT_OPTIONS }    from '@common/constants';
import { JwtStrategy }    from '@api/middlewares';
import { AuthService }    from '@api/services';

@Module({
	        imports:   [
		        PassportModule,
		        JwtModule.register(JWT_OPTIONS)
	        ],
	        providers: [
		        JwtStrategy,
		        AuthService
	        ],
	        exports:   [
		        JwtStrategy,
		        AuthService
	        ]
        })
export default class AuthModule {}
